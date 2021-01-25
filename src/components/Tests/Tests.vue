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

      <v-container v-if='hasDeleteMarkTests && (userClaims["admin"] ||
        (markedTestsByUser && markedTestsByUser.length > 0) ||
        (deleteMarkTests.filter(t => t.toDelete.userEmail === userInfo.email)))'>
        <v-alert
            v-if='deleteConfirmed'
            text
            prominent
            type='warning'
            color="red"
            icon='mdi-alert' >
            Exclusão confirmada! Quando deixar esta página, a tabela será atualizada.
        </v-alert>

        <v-alert
            v-if='hasTrueMarkStatus && (userClaims["admin"] || markedTestsByUser)'
            text
            prominent
            type='warning'
            color="red"
            icon='mdi-alert' >
            As seguintes provas foram marcadas para exclusão:
            <br>
            {{ markedTestsByUser }}

            <div v-if="userClaims['admin']">
                <br>
                Marcadas por você:
                <br>
                {{ markedTestsAdmin }}
            </div>
        </v-alert>

        <v-row justify="start" v-if='hasTrueMarkStatus && (userClaims["admin"] || markedTestsByUser)'>
            <v-btn
                class='ml-10'
                color='red'
                :dark='!(userClaims["admin"] && markedTestsAdmin.length === 0)'
                :disabled="userClaims['admin'] && markedTestsAdmin.length === 0"
                @click="deleteConfirmed = true; deleteTests(false)" >
                Confirmar
            </v-btn>
            <v-btn
                v-if="userClaims['admin']"
                class='ml-3'
                color='red'
                dark
                @click="deleteConfirmed = true; deleteTests(true)" >
                Confirmar Todos
            </v-btn>
            <v-btn
                class='ml-3'
                color='grey darken-1'
                :dark='!(userClaims["admin"] && markedTestsAdmin.length === 0)'
                :disabled="userClaims['admin'] && markedTestsAdmin.length === 0"
                @click="restoreAll(false)" >
                Restaurar
            </v-btn>
            <v-btn
                v-if="userClaims['admin']"
                class='ml-3'
                color='grey darken-1'
                dark
                @click="restoreAll(true)" >
                Restaurar Todos
            </v-btn>
        </v-row>
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
              <v-row justify="end" v-if='!item.toDelete'>
                <router-link
                    style="text-decoration: none;"
                    :to="`/tests/${item.id}`"
                    replace>
                    <v-tooltip top>
                        <template v-slot:activator='{ on }'>
                            <v-icon v-on="on">mdi-pdf-box</v-icon>
                        </template>
                        <span>Visualizar PDF</span>
                    </v-tooltip>
                </router-link>

                <v-tooltip top>
                    <template v-slot:activator='{ on }'>
                        <v-icon
                            v-if='!userClaims["student"]'
                            v-on="on"
                            @click="editTest(item)"
                            class="ml-2" >
                            mdi-pencil
                        </v-icon>
                    </template>
                    <span>Editar</span>
                </v-tooltip>

                <v-tooltip top>
                    <template v-slot:activator='{ on }'>
                        <v-icon
                            v-if='!userClaims["student"]'
                            v-on="on"
                            @click="deleteTestSnackBar = true; deleteSelect = item"
                            class="ml-2" >
                            mdi-delete
                        </v-icon>
                    </template>
                    <span>Excluir</span>
                </v-tooltip>
              </v-row>

              <v-row justify="end" v-else-if='item.toDelete && item.toDelete.status'>
                  <v-btn
                    style="padding: 0 !important; font-weight: bold !important;"
                    color='red'
                    text
                    :disabled='userClaims["teacher"] && item.toDelete.userEmail !== userInfo.email'
                    @click='restoreTest(item)' >
                    {{ userClaims["teacher"] && item.toDelete.userEmail !== userInfo.email ? 'Indisponível' : 'Restaurar' }}
                  </v-btn>
              </v-row>

              <v-row justify="end" v-else>
                  <v-btn
                    style="padding: 0 !important; font-weight: bold !important;"
                    disabled
                    text >
                    Excluída
                  </v-btn>
              </v-row>
            </template>
          </v-data-table>
        </v-card>
      </v-container>

      <v-tooltip left v-if='!userClaims["student"]'>
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            fixed
            dark
            fab
            bottom
            right
            color="blue darken-1"
            @click.stop="dialogNewTest = true" >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        <span>Criar Prova</span>
      </v-tooltip>

      <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialogNewTest">
        <NewTest @closeDialogNew="dialogNewTest = false"></NewTest>
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
      <v-snackbar v-model="deleteTestSnackBar" color="white" light right top>
        Você realmente quer excluir esta prova?
        <v-btn dark color="blue" text @click="deleteTest(deleteSelect.id)">Excluir</v-btn>
        <v-btn dark color="grey" text @click="deleteTestSnackBar = false">Cancelar</v-btn>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script>
    import NewTest from './NewTestForm';
    import EditTest from './EditTest';
    import Paginator from '../Paginator';

    export default {
        name: 'Tests',
        components: { NewTest, EditTest, Paginator },
        data() {
            return {
                search: '',
                isSearching: false,
                deleteConfirmed: false,
                deleteTestSnackBar: false,
                dialogNewTest: false,
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
            },
            tests() {
                return this.$store.getters.getCurrentTestsPage;
            },
            deleteMarkTests() {
                return this.$store.getters.getDeleteMarkTests;
            },
            markedTestsAdmin() {
                const tests = this.deleteMarkTests.filter(t => t.toDelete.userEmail === this.userInfo.email);
                const titles = tests.filter(t => t.toDelete && t.toDelete.status);
                return titles.map(t => t.title).join(', ');
            },
            markedTestsByUser() {
                const isAdmin = this.userClaims['admin'];
                const tests = isAdmin
                    ? this.deleteMarkTests
                    : this.deleteMarkTests.filter(t => t.toDelete.userEmail === this.userInfo.email);

                const titles = [];

                titles.push(...tests.filter(t => t.toDelete && t.toDelete.status));

                return titles.map(t => isAdmin ? `${t.title} (${t.toDelete.userEmail})` : t.title).join(', ');
            },
            hasDeleteMarkTests() {
                return this.deleteMarkTests && this.deleteMarkTests.length > 0;
            },
            hasTrueMarkStatus() {
                const tests = this.deleteMarkTests.map(t => t.toDelete.status);
                return tests.includes(true);
            },
            filteredTests() {
                return this.$store.getters.getFilteredTests;
            },
            userClaims() {
                return this.$store.getters.getUserClaims;
            },
            userInfo() {
                return this.$store.getters.userInfo;
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
                this.deleteTestSnackBar = false;
                this.$store.dispatch('deleteMarkTest', {
                    id,
                    isSearching: this.isSearching,
                    userEmail: this.userInfo.email
                });
            },
            deleteTests(all) {
                const tests = this.deleteMarkTests;
                tests.forEach(test => {
                    if(test.toDelete.status && (this.userInfo.email === test.toDelete.userEmail || all)) {
                        this.$store.dispatch("changeDeleteStatusTests", { id: test.id, isSearching: this.isSearching });
                    }
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
            },
            itemRowStyle(item) {
                return item.toDelete ? (item.toDelete.status ? 'item-to-delete' : 'item-deleted') : '';
            },
            restoreTest(item) {
                this.$store.dispatch('restoreMarkedTest', { id: item.id, isSearching: this.isSearching });
            },
            restoreAll(all) {
                this.$store.dispatch('restoreAllMarkedTests', { all, user: this.userInfo, isSearching: this.isSearching });
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
            this.deleteConfirmed = false;
            this.$store.dispatch('checkDeleteMarkTests');
            this.$store.dispatch("loadFOLTestPage", { page: 1, itemsPerPage: this.itemsPerPage, mode: 'first' });
        },
        beforeDestroy() {
            this.search = '';
            this.isSearching = false;
            this.page = 1;
            this.$store.commit('resetFilteredTests');
            this.$store.commit('resetCurrentTestsPage');

            if(this.deleteConfirmed) {
                this.$store.dispatch('deleteTests');
                this.$store.dispatch('resetTests');
                this.$store.dispatch('loadDataSize');
            }
        }
    };
</script>

<style>
    .item-to-delete {
        color: #f00;
    }

    .item-deleted {
        color: #c4c4c4;
    }
</style>
