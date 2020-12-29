<template>
  <div>
    <v-container>
      <v-container>
          <h1 class="text-center blue--text">Gerenciar Provas</h1>
      </v-container>

      <v-container>
          <v-container>
            <v-text-field
              id='searchField'
              v-model="search"
              @keydown="searchQuery($event)"
              clearable
              filled
              rounded
              dense
              append-icon="mdi-magnify"
              label='Procurar por Nome'
              single-line
              hide-details
            ></v-text-field>
          </v-container>
      </v-container>

      <v-container>
        <v-card>
          <v-data-table
            :headers="headers"
            :items="isSearching ? filteredTests : tests"
            :page="isSearching ? searchPage : page"
            :items-per-page="itemsPerPage"
            :loading="loading"
            no-data-text='Não há provas a serem mostradas'
            loading-text="Carregando provas..."
            hide-default-footer
            class="elevation-1"
          >
            <template v-slot:[`item.type`]='{ item }'>
                {{ item.type === 'selected' ? 'Selecionado' : 'Aleatório' }}
            </template>

            <template small v-slot:[`item.actions`]="{ item }">
              <v-row justify="end">
                <router-link style="text-decoration: none;" :to="`/tests/${item.id}`" replace>
                  <v-icon color="grey darken-1">mdi-pdf-box</v-icon>
                </router-link>
                <v-icon
                    v-if='!userClaims["student"]'
                    @click="editTest(item)"
                    class="ml-2"
                    color="amber darken-2" >
                    mdi-pencil
                </v-icon>
                <v-icon
                    v-if='!userClaims["student"]'
                    @click="deleteTestSnackBar = true; deleteSelect = item"
                    class="ml-2"
                    color="red" >
                    mdi-delete
                </v-icon>
              </v-row>
            </template>
          </v-data-table>
        </v-card>
      </v-container>

      <v-tooltip left v-if='!userClaims["student"]'>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" fixed dark fab bottom right color="cyan" @click.stop="dialogNewTest = true">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        <span>Criar Prova</span>
      </v-tooltip>

      <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialogNewTest">
        <NewTest @closeDialogNew="dialogNewTest = false"></NewTest>
      </v-dialog>

      <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialogHtmlTest">
        <HtmlTest :test="selectedTest"></HtmlTest>
      </v-dialog>

      <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialogEditTest">
        <EditTest @closeDialogNew="dialogEditTest = false" :test="selectedTest"></EditTest>
      </v-dialog>

      <div class="text-center pt-2">
        <Paginator
            :page='!isSearching ? page : searchPage'
            :length='!isSearching ? pageAmount : Math.ceil(filteredTests.length / itemsPerPage)'
            @pageChange='!isSearching ? page = $event.page : searchPage = $event.page; onPageChange($event)' />
      </div>
      <v-snackbar v-model="deleteTestSnackBar" color="black" right top>
        Você realmente quer deletar esta prova?
        <v-btn dark color="yellow" text @click="deleteTest(deleteSelect.id)">Ok</v-btn>
        <v-btn dark color="yellow" text @click="deleteTestSnackBar = false">Cancelar</v-btn>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script>
    import NewTest from './NewTestForm';
    import HtmlTest from './HtmlToPdfTest';
    import EditTest from './EditTest';
    import Paginator from '../Paginator';

    export default {
        name: 'Tests',
        components: { NewTest, HtmlTest, EditTest, Paginator },
        data() {
            return {
                search: '',
                isSearching: false,
                deleteTestSnackBar: false,
                dialogNewTest: false,
                dialogHtmlTest: false,
                dialogEditTest: false,
                page: 1,
                searchPage: 1,
                itemsPerPage: 10,
                selectedTest: null,
                headers: [
                    { text: "Nome", align: "start",  value: "title" },
                    { text: "Questões", align: "left",  value: "questions.length" },
                    { text: "Tipo", align: "left",  value: "type" },
                    { text: "Ações", align:"right", value: "actions", sortable: false }
                ]
            }
        },
        computed: {
            loading () {
                return this.$store.getters.loading;
                this.$store.dispatch('clearLoading');
            },
            tests() {
                return this.$store.getters.getCurrentTestsPage;
            },
            filteredTests() {
                return this.$store.getters.getFilteredTests;
            },
            userClaims() {
                return this.$store.getters.getUserClaims;
            },
            pageAmount() {
                const testsAmount = this.$store.getters.getDataSize.tests;
                return Math.ceil(testsAmount / this.itemsPerPage);
            }
        },
        methods: {
            editTest(item){
                this.selectedTest = item;
                this.dialogEditTest = true;
            },
            deleteTest(id) {
                this.$store.dispatch("deleteTest", { id, isSearching: this.isSearching }).then(() => {
                    this.deleteTestSnackBar = false;
                });
            },
            onPageChange(event) {
                const payload = {
                    page: this.page,
                    itemsPerPage: this.itemsPerPage
                }

                if(!this.isSearching) {
                    if(!event.mode) {
                        this.$store.dispatch('loadTestPage', { ...payload, type: event.type });
                    } else {
                        this.$store.dispatch('loadFOLTestPage', { ...payload, mode: event.mode });
                    }
                }
            },
            searchQuery(event) {
                if(event.key === 'Enter') {
                    document.getElementById('searchField').blur();

                    this.searchPage = 1;
                    this.$store.commit('resetFilteredTests');

                    if(this.search.length > 0) {
                        this.isSearching = true;
                        this.$store.dispatch('searchTests', this.search);
                    } else {
                        this.isSearching = false;
                    }
                }
            }
        },
        watch: {
            search(text) {
                if((text === null || text.length === 0) && this.isSearching) {
                    this.isSearching = false;
                    this.searchPage = 1;
                    this.$store.commit('resetFilteredTests');
                }
            }
        },
        mounted() {
            this.$store.dispatch("loadFOLTestPage", { page: 1, itemsPerPage: this.itemsPerPage, mode: 'first' });
        },
        beforeDestroy() {
            this.search = '';
            this.isSearching = false;
            this.page = 1;
            this.$store.commit('resetFilteredTests');
            this.$store.commit('resetCurrentTestsPage');
        }
    };
</script>
