<template>
  <div>
    <v-container>
      <v-container>
          <h1 class="text-center blue--text">Gerenciar Documentos</h1>
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
              label="Procurar por Nome"
              single-line
              hide-details
            ></v-text-field>
          </v-container>
      </v-container>

      <v-container>
        <v-card>
          <v-data-table
            :headers="headers"
            :items="isSearching ? filteredPapers : papers"
            :page="isSearching ? searchPage : page"
            :items-per-page="itemsPerPage"
            :loading="loading"
            no-data-text='Não há documentos a serem mostrados'
            loading-text="Carregando documentos..."
            hide-default-footer
            class="elevation-1"
          >
            <template small v-slot:[`item.actions`]="{ item }">
              <v-row justify="end">
                <v-icon
                    color="amber darken-2"
                    @click="editPaper(item)" >
                    mdi-pencil
                </v-icon>
                <v-icon
                    @click="deletePaperSnackBar = true; deleteSelect = item"
                    color="red"
                    class="ml-2" >
                    mdi-delete
                </v-icon>
              </v-row>
            </template>
          </v-data-table>
        </v-card>
      </v-container>

      <v-tooltip left>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" fixed dark fab bottom right color="cyan" @click.stop="dialogNewPaper = true">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        <span>Criar Documento</span>
      </v-tooltip>

      <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialogNewPaper">
        <NewPaper @closeDialogNew="dialogNewPaper = false"></NewPaper>
      </v-dialog>

      <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialogEditPaper">
        <EditPaper :paper="selectedEdit" @closeDialogEdit="dialogEditPaper = false"></EditPaper>
      </v-dialog>

      <div class="text-center pt-2">
        <Paginator
            :page='!isSearching ? page : searchPage'
            :length='!isSearching ? pageAmount : Math.ceil(filteredPapers.length / itemsPerPage)'
            @pageChange='!isSearching ? page = $event.page : searchPage = $event.page; onPageChange($event)' />
      </div>
      <v-snackbar v-model="deletePaperSnackBar" color="black" right top>
        Você realmente quer deletar este documento?
        <v-btn dark color="yellow" text @click="deletePaper(deleteSelect)">Ok</v-btn>
        <v-btn dark color="yellow" text @click="deletePaperSnackBar = false">Cancelar</v-btn>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script>
    import NewPaper from './CreatePaper';
    import EditPaper from './EditPaper';
    import Paginator from '../Paginator';

    export default {
        components: { NewPaper, EditPaper, Paginator },
        data: () => ({
            dialogNewPaper: false,
            dialogEditPaper: false,
            selectedEdit: {},
            headers: [
                { text: "Nome", align: "left",  value: "name", sortable: true },
                { text: "Ações", align:"right", value: "actions", sortable: false }
            ],
            page: 1,
            searchPage: 1,
            itemsPerPage: 10,
            search: '',
            isSearching: false,
            deletePaperSnackBar: false,
            deleteSelect: "",
        }),
        computed: {
            loading () {
                return this.$store.getters.loading;
                this.$store.dispatch('clearLoading');
            },
            papers () {
                return this.$store.getters.getCurrentPapersPage;
            },
            filteredPapers() {
                return this.$store.getters.getFilteredPapers;
            },
            userClaims() {
                return this.$store.getters.getUserClaims;
            },
            pageAmount() {
                const papersAmount = this.$store.getters.getDataSize.papers;
                return Math.ceil(papersAmount / this.itemsPerPage);
            }
        },
        methods: {
            editPaper(val){
                this.selectedEdit = val;
                this.dialogEditPaper = true;
            },
            deletePaper(paper) {
                this.$store.dispatch("deletePaper", { id: paper.id, isSearching: this.isSearching });
                this.deletePaperSnackBar = false;
            },
            onPageChange(event) {
                const payload = {
                    page: this.page,
                    itemsPerPage: this.itemsPerPage
                }

                if(!this.isSearching) {
                    if(!event.mode) {
                        this.$store.dispatch('loadPaperPage', { ...payload, type: event.type });
                    } else {
                        this.$store.dispatch('loadFOLPaperPage', { ...payload, mode: event.mode });
                    }
                }
            },
            searchQuery(event) {
                if(event.key === 'Enter') {
                    document.getElementById('searchField').blur();

                    this.searchPage = 1;
                    this.$store.commit('resetFilteredPapers');

                    if(this.search.length > 0) {
                        this.isSearching = true;
                        this.$store.dispatch('searchPapers', this.search);
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
                    this.$store.commit('resetFilteredPapers');
                }
            }
        },
        mounted() {
            this.$store.dispatch("loadFOLPaperPage", { page: 1, itemsPerPage: this.itemsPerPage, mode: 'first' });
        },
        beforeDestroy() {
            this.search = '';
            this.isSearching = false;
            this.page = 1;
            this.$store.commit('resetFilteredPapers');
            this.$store.commit('resetCurrentPapersPage');
        }
    }
</script>
