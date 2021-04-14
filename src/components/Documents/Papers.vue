<template>
  <div>
    <v-container>
      <v-container>
          <h1 class="text-center blue--text">Gerenciar Documentos</h1>
      </v-container>

      <v-container>
          <v-container>
            <SearchBox
              label='Procurar por Nome'
              @enter='searchQuery($event)'
              @textChange='searchTextChange($event)' />
          </v-container>
      </v-container>

      <v-container v-if='hasDeleteMarkPapers && (userClaims["admin"] ||
        (markedPapersByUser && markedPapersByUser.length > 0) ||
        (deleteMarkPapers.filter(p => p.toDelete.userEmail === userInfo.email)))' >
        <DeleteAlert
            :confirmCondition='deleteConfirmed'
            :itemsCondition='hasTrueMarkStatus'
            itemsText='Os seguintes documentos foram marcados para exclusão:'
            :items='markedPapersByUser'
            :isAdmin='userClaims["admin"]'
            :adminItems='markedPapersAdmin' />

        <v-row justify="start" v-if='hasTrueMarkStatus && (userClaims["admin"] || markedPapersByUser)'>
            <v-btn
                class='ml-10'
                color='red'
                :dark='!(userClaims["admin"] && markedPapersAdmin.length === 0)'
                :disabled="userClaims['admin'] && markedPapersAdmin.length === 0"
                @click="deleteConfirmed = true; deletePapers(false)" >
                {{ userClaims['admin'] ? 'Confirmar Meus' : 'Confirmar'}}
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
                {{ userClaims['admin'] ? 'Restaurar Meus' : 'Restaurar' }}
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

      <PapersTable
        :items="isSearching ? filteredPapers : papers"
        :page="isSearching ? searchPage : page"
        :itemsPerPage="itemsPerPage"
        @pdfClick='dialogPDF = true; selectedEdit = $event;'
        @editClick='dialogEditPaper = true; selectedEdit = $event;'
        @deleteClick='deletePaperSnackBar = true; deleteSelect = $event;'
        @restoreClick='restorePaper($event)' />

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
            <v-icon>{{ mdiPlus }}</v-icon>
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

      <v-dialog
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
        v-model="dialogPDF" >
        <v-card>
            <PrintPaper
                :paper="selectedEdit"
                @closeDialogPrint="dialogPDF = false; selectedEdit = {}"
            ></PrintPaper>
        </v-card>
      </v-dialog>

      <v-container class="mb-10">
        <PremadePapersTable
            @eyeClick='openDialogView($event)' />
      </v-container>

      <DeleteWarning
        label='Tem certeza de que deseja excluir este documento?'
        :state='deletePaperSnackBar'
        @confirm='deletePaper(deleteSelect); deletePaperSnackBar = false;'
        @cancel='deletePaperSnackBar = false' />
    </v-container>
  </div>
</template>

<script>
    import { mdiPlus } from '@mdi/js';
    import NewPaper from './CreatePaper';
    import EditPaper from './EditPaper';
    import PapersTable from './PapersTable';
    import Paginator from '../Paginator';
    import Intro from './PrintPremadePapers/Intro';
    import Questions from './PrintPremadePapers/Questions';
    import Statistics from './PrintPremadePapers/Statistics';
    import ListOfAnswers from './PrintPremadePapers/ListOfAnswers';
    import PrintPaper from './PrintPaper';
    import SearchBox from '../Shared/SearchBox';
    import DeleteAlert from './DeleteAlertPapers';
    import DeleteWarning from '../Shared/DeleteWarning';
    import PremadePapersTable from './PremadePapersTable';

    export default {
        name: 'Papers',
        components: {
            NewPaper,
            EditPaper,
            PapersTable,
            Paginator,
            Intro,
            PPQuestions: Questions,
            PPStatistics: Statistics,
            ListOfAnswers,
            PrintPaper,
            SearchBox,
            DeleteAlert,
            DeleteWarning,
            PremadePapersTable
        },
        data() {
            return {
                mdiPlus,
                dialogPDF: false,
                dialogIntro: false,
                dialogQuestions: false,
                dialogStatistics: false,
                dialogAnswers: false,
                dialogNewPaper: false,
                dialogEditPaper: false,
                selectedEdit: {},
                page: 1,
                searchPage: 1,
                itemsPerPage: 10,
                isSearching: false,
                deleteConfirmed: false,
                deletePaperSnackBar: false,
                deleteSelect: ""
            }
        },
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
            searchTextChange(text) {
                if((text === null || text.length === 0) && this.isSearching) {
                    this.isSearching = false;
                    this.searchPage = 1;
                    this.$store.commit('resetFilteredPapers');
                }
            },
            searchQuery(text) {
                this.searchPage = 1;
                this.$store.commit('resetFilteredPapers');

                if(text && text.length > 0) {
                    this.isSearching = true;
                    this.$store.dispatch('searchPapers', text);
                } else {
                    this.isSearching = false;
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
