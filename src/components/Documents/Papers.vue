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

      <v-container v-if='hasDeleteMarkPapers && (userClaims["admin"] ||
        (markedPapersByUser && markedPapersByUser.length > 0) ||
        (deleteMarkPapers.filter(p => p.toDelete.userEmail === userInfo.email)))'>
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
            v-if='hasTrueMarkStatus && (userClaims["admin"] || markedPapersByUser)'
            text
            prominent
            type='warning'
            color="red"
            icon='mdi-alert' >
            Os seguintes documentos foram marcados para exclusão:
            <br>
            {{ markedPapersByUser }}

            <div v-if="userClaims['admin']">
                <br>
                Marcadas por você:
                <br>
                {{ markedPapersAdmin }}
            </div>
        </v-alert>

        <v-row justify="start" v-if='hasTrueMarkStatus && (userClaims["admin"] || markedPapersByUser)'>
            <v-btn
                class='ml-10'
                color='red'
                :dark='!(userClaims["admin"] && markedPapersAdmin.length === 0)'
                :disabled="userClaims['admin'] && markedPapersAdmin.length === 0"
                @click="deleteConfirmed = true; deletePapers(false)" >
                Confirmar
            </v-btn>
            <v-btn
                v-if="userClaims['admin']"
                class='ml-3'
                color='red'
                dark
                @click="deleteConfirmed = true; deletePapers(true)" >
                Confirmar Todos
            </v-btn>
            <v-btn
                class='ml-3'
                color='grey darken-1'
                :dark='!(userClaims["admin"] && markedPapersAdmin.length === 0)'
                :disabled="userClaims['admin'] && markedPapersAdmin.length === 0"
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
            <v-card-title>Documentos Criados</v-card-title>
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
              <v-row justify="end" v-if='!item.toDelete'>
                    <v-tooltip top>
                        <template v-slot:activator='{ on }'>
                            <v-icon
                                v-on="on"
                                @click="item = item" >
                                mdi-pdf-box
                            </v-icon>
                        </template>
                        <span>Visualizar PDF</span>
                    </v-tooltip>

                    <v-tooltip top>
                        <template v-slot:activator='{ on }'>
                            <v-icon
                                v-on="on"
                                @click="editPaper(item)"
                                class="ml-2" >
                                mdi-pencil
                            </v-icon>
                        </template>
                        <span>Editar</span>
                    </v-tooltip>

                    <v-tooltip top>
                        <template v-slot:activator='{ on }'>
                            <v-icon
                                v-on="on"
                                @click="deletePaperSnackBar = true; deleteSelect = item"
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
                    @click='restorePaper(item)' >
                    {{ userClaims["teacher"] && item.toDelete.userEmail !== userInfo.email ? 'Indisponível' : 'Restaurar' }}
                  </v-btn>
              </v-row>

              <v-row justify="end" v-else>
                  <v-btn
                    style="padding: 0 !important; font-weight: bold !important;"
                    disabled
                    text >
                    Excluído
                  </v-btn>
              </v-row>
            </template>
          </v-data-table>
        </v-card>
      </v-container>

      <v-tooltip left>
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            fixed
            dark
            fab
            bottom
            right
            color="blue darken-1"
            @click.stop="dialogNewPaper = true" >
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

      <v-dialog
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
        v-model="dialogIntro" >
        <v-card>
            <Intro @closeDialogIntro="dialogIntro = false" />
        </v-card>
      </v-dialog>

      <v-dialog
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
        v-model="dialogQuestions" >
        <v-card>
            <PPQuestions @closeDialogQuestions="dialogQuestions = false" />
        </v-card>
      </v-dialog>

      <v-dialog
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
        v-model="dialogStatistics" >
        <v-card>
            <PPStatistics @closeDialogStatistics="dialogStatistics = false" />
        </v-card>
      </v-dialog>

      <v-dialog
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
        v-model="dialogAnswers" >
        <v-card>
            <ListOfAnswers @closeDialogAnswers="dialogAnswers = false" />
        </v-card>
      </v-dialog>

      <v-container class="mb-10">
        <v-card>
            <v-card-title>
                Documentos Prontos
            </v-card-title>
            <v-data-table
                :headers="headers"
                :items="premadePapers"
                hide-default-footer
                class="elevation-1">
                <template small v-slot:[`item.actions`]="{ item }">
                    <v-tooltip top>
                        <template v-slot:activator='{ on }'>
                            <v-icon
                                v-on="on"
                                @click="openDialogView(item.name)" >
                                mdi-eye
                            </v-icon>
                        </template>
                        <span>Visualizar</span>
                    </v-tooltip>
                </template>
            </v-data-table>
        </v-card>
      </v-container>

      <v-snackbar v-model="deletePaperSnackBar" color="white" light right top>
        Você realmente quer excluir este documento?
        <v-btn dark color="blue" text @click="deletePaper(deleteSelect)">Excluir</v-btn>
        <v-btn dark color="grey" text @click="deletePaperSnackBar = false">Cancelar</v-btn>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script>
    import NewPaper from './CreatePaper';
    import EditPaper from './EditPaper';
    import Paginator from '../Paginator';
    import Intro from './PrintPremadePapers/Intro';
    import Questions from './PrintPremadePapers/Questions';
    import Statistics from './PrintPremadePapers/Statistics';
    import ListOfAnswers from './PrintPremadePapers/ListOfAnswers';

    export default {
        name: 'Papers',
        components: {
            NewPaper,
            EditPaper,
            Paginator,
            Intro,
            PPQuestions: Questions,
            PPStatistics: Statistics,
            ListOfAnswers
        },
        data: () => ({
            dialogIntro: false,
            dialogQuestions: false,
            dialogStatistics: false,
            dialogAnswers: false,
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
            deleteConfirmed: false,
            deletePaperSnackBar: false,
            deleteSelect: "",
            premadePapers: [
                { name: "Introdução" },
                { name: "Questões" },
                { name: "Estatísticas" },
                { name: "Gabarito" }
            ]
        }),
        computed: {
            loading () {
                return this.$store.getters.loading;
            },
            papers () {
                return this.$store.getters.getCurrentPapersPage;
            },
            deleteMarkPapers() {
                return this.$store.getters.getDeleteMarkPapers;
            },
            markedPapersAdmin() {
                const papers = this.deleteMarkPapers.filter(p => p.toDelete.userEmail === this.userInfo.email);
                const titles = papers.filter(p => p.toDelete && p.toDelete.status);
                return titles.map(p => p.name).join(', ');
            },
            markedPapersByUser() {
                const isAdmin = this.userClaims['admin'];
                const papers = isAdmin
                    ? this.deleteMarkPapers
                    : this.deleteMarkPapers.filter(p => p.toDelete.userEmail === this.userInfo.email);

                const titles = [];

                titles.push(...papers.filter(p => p.toDelete && p.toDelete.status));

                return titles.map(p => isAdmin ? `${p.name} (${p.toDelete.userEmail})` : p.name).join(', ');
            },
            hasDeleteMarkPapers() {
                return this.deleteMarkPapers && this.deleteMarkPapers.length > 0;
            },
            hasTrueMarkStatus() {
                const papers = this.deleteMarkPapers.map(t => t.toDelete.status);
                return papers.includes(true);
            },
            filteredPapers() {
                return this.$store.getters.getFilteredPapers;
            },
            userClaims() {
                return this.$store.getters.getUserClaims;
            },
            userInfo() {
                return this.$store.getters.userInfo;
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
            deletePaper({ id }) {
                this.deletePaperSnackBar = false;
                this.$store.dispatch('deleteMarkPaper', {
                    id,
                    isSearching: this.isSearching,
                    userEmail: this.userInfo.email
                });
            },
            deletePapers(all) {
                const papers = this.deleteMarkPapers;
                papers.forEach(paper => {
                    if(paper.toDelete.status && (this.userInfo.email === paper.toDelete.userEmail || all)){
                        this.$store.dispatch("changeDeleteStatusPapers", { id: paper.id, isSearching: this.isSearching });
                    }
                });
            },
            openDialogView(item) {
                if(item === 'Introdução') {
                    this.dialogIntro = true;
                } else if(item === 'Questões') {
                    this.dialogQuestions = true;
                } else if(item === 'Estatísticas') {
                    this.dialogStatistics = true;
                } else {
                    this.dialogAnswers = true;
                }
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
            },
            itemRowStyle(item) {
                return item.toDelete ? (item.toDelete.status ? 'item-to-delete' : 'item-deleted') : '';
            },
            restorePaper(item) {
                this.$store.dispatch('restoreMarkedPaper', { id: item.id, isSearching: this.isSearching });
            },
            restoreAll(all) {
                this.$store.dispatch('restoreAllMarkedPapers', { all, user: this.userInfo, isSearching: this.isSearching });
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
            this.deleteConfirmed = false;
            this.$store.dispatch('checkDeleteMarkPapers');
            this.$store.dispatch("loadFOLPaperPage", { page: 1, itemsPerPage: this.itemsPerPage, mode: 'first' });
        },
        beforeDestroy() {
            this.search = '';
            this.isSearching = false;
            this.page = 1;
            this.$store.commit('resetFilteredPapers');
            this.$store.commit('resetCurrentPapersPage');

            if(this.deleteConfirmed) {
                this.$store.dispatch('deletePapers');
                this.$store.dispatch('resetPapers');
                this.$store.dispatch('loadDataSize');
            }
        }
    }
</script>

<style>
    .item-to-delete {
        color: #f00;
    }

    .item-deleted {
        color: #c4c4c4;
    }
</style>
