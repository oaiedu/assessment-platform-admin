<template>
  <div>
    <v-container>
      <v-container>
        <h1 class="text-center blue--text">Gerenciar Questões</h1>
      </v-container>

      <v-container>
        <v-container>
          <SearchBox
            label='Procurar por IQ'
            @enter='searchQuery($event)'
            @textChange='searchTextChange($event)' />
        </v-container>
      </v-container>

      <v-container v-if='hasDeleteMarkQuestions && (userClaims["admin"])'>
        <DeleteAlert
            :confirmCondition='deleteConfirmed'
            :itemsCondition='hasTrueMarkStatus'
            itemsText='As seguintes questões foram marcadas para exclusão:'
            :items='markedQuestionsByUser' />

        <v-row justify="start" v-if='hasTrueMarkStatus'>
            <v-btn
                class='ml-10'
                color='red'
                dark
                @click="deleteConfirmed = true; deleteQuestions()" >
                Confirmar
            </v-btn>
            <v-btn
                class='ml-3'
                color='grey darken-1'
                dark
                @click="restoreAll()" >
                Restaurar
            </v-btn>
        </v-row>
      </v-container>

      <QuestionsTable
        :items="isSearching ? filteredQuestions : questions"
        :page="isSearching ? searchPage : page"
        :itemsPerPage='itemsPerPage'
        :isActionsAvailable='true'
        @pdfClick='dialogPDF = true; selectedEdit = $event;'
        @editClick='dialogEditQuestion = true; selectedEdit = $event;'
        @deleteClick='deleteQuestionSnackBar = true; deleteSelect = $event;'
        @restoreClick='restoreQuestion($event)' />

      <v-tooltip left v-if='userClaims["appraiser"] || userClaims["admin"]' >
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            fixed
            dark
            fab
            bottom
            right
            color="blue darken-1"
            @click.stop="dialogNewQuestion = true"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        <span>Criar Questão</span>
      </v-tooltip>

      <v-dialog
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
        v-model="dialogNewQuestion" >
        <Stepper
            :page='page'
            @closeDialogNew="dialogNewQuestion = false" />
      </v-dialog>

      <v-dialog
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
        v-model="dialogEditQuestion" >
        <EditQuestion
          :question="selectedEdit"
          :userClaims="userClaims"
          :userInfo="userInfo"
          :isSearching="isSearching"
          @closeDialogEdit="dialogEditQuestion = false" />
      </v-dialog>

      <v-dialog
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
        v-model="dialogPDF"
      >
        <Body
          :question="selectedEdit"
          @closeDialogPrint="dialogPDF = false"
        ></Body>
      </v-dialog>

      <div class="text-center pt-2">
        <Paginator
          :page='!isSearching ? page : searchPage'
          :length='!isSearching ? pageAmount : Math.ceil(filteredQuestions.length / itemsPerPage)'
          @pageChange='!isSearching ? page = $event.page : searchPage = $event.page; onPageChange($event)' />
      </div>

      <DeleteWarning
        label='Tem certeza de que deseja excluir esta questâo?'
        :state='deleteQuestionSnackBar'
        @confirm='deleteQuestion(deleteSelect.iq); deleteQuestionSnackBar = false;'
        @cancel='deleteQuestionSnackBar = false' />

      <v-snackbar
        v-model="deleteErrorSnackBar"
        light
        color="red darken-2"
        right
        top
        vertical
        :timeout="15000" >
        <span style='color: white; font-size: 1rem'>
            Esta questão está sendo usada nas seguintes provas:
            <br>
            {{ getQuestionTests }}
            <br><br>
            Só será possível excluí-la quando não se encontrar em nenhum teste.
        </span>
        <template v-slot:action='{ attrs }'>
            <v-btn
                dark
                color="white"
                text
                v-bind='attrs'
                @click="deleteErrorSnackBar = false" >
                Fechar
            </v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script>
    import Paginator from '../Paginator';
    import QuestionsTable from './QuestionsTable';
    import DeleteWarning from '../Shared/DeleteWarning';
    import DeleteAlert from './DeleteAlertQuestions';
    import SearchBox from '../Shared/SearchBox';

    export default {
        name: 'Questions',
        components: { Paginator, QuestionsTable, DeleteWarning, DeleteAlert, SearchBox },
        data() {
            return {
                loadedPages: [1],
                deleteSelect: "",
                selectedEdit: {},
                questionTests: [],
                deleteConfirmed: false,
                deleteErrorSnackBar: false,
                deleteQuestionSnackBar: false,
                selected: [],
                dialogNewQuestion: false,
                dialogEditQuestion: false,
                dialogPDF: false,
                items: [
                    "Teoria do Reator",
                    "Termodinâmica",
                    "Instrumentação e Controle",
                    "Válvulas e Bombas",
                    "Eletricidade",
                    "Mecânica dos Fluidos",
                    "Tratamento Qúimico Refrigerante",
                    "Análise Integrada",
                    "Instrumentação Nuclear",
                    "Física Nuclear",
                    "Transferência de Calor",
                    "Materiais",
                ],
                showedQuestions: [],
                search: "",
                isSearching: false,
                page: 1,
                searchPage: 1,
                itemsPerPage: 8,
                headers: [
                    { text: "IQ", align: "left", value: "iq" },
                    { text: "Conhecimento", value: "knowledge" },
                    { text: "Relevância OR", value: "knowledgePWR" },
                    { text: "Relevância OSR", value: "knowledgeBWR" },
                    { text: "Disciplina", value: "subject" },
                    { text: "Ações", align: "right", value: "actions", sortable: false },
                ]
            }
        },
        computed: {
            loading() {
                return this.$store.getters.loading;
            },
            questions() {
                return this.$store.getters.getCurrentQuestionsPage;
            },
            deleteMarkQuestions() {
                return this.$store.getters.getDeleteMarkQuestions;
            },
            markedQuestionsByUser() {
                const isAdmin = this.userClaims['admin'];
                const questions = isAdmin
                    ? this.deleteMarkQuestions
                    : this.deleteMarkQuestions.filter(q => q.toDelete.userEmail === this.userInfo.email);

                const iqs = [];

                if(isAdmin) {
                    iqs.push(...questions.filter(q => q.toDelete && q.toDelete.status));
                }

                return iqs.map(q => `${q.iq} (${q.toDelete.userEmail})`).join(', ');
            },
            hasDeleteMarkQuestions() {
                return this.deleteMarkQuestions && this.deleteMarkQuestions.length > 0;
            },
            hasTrueMarkStatus() {
                const questions = this.deleteMarkQuestions.map(q => q.toDelete.status);
                return questions.includes(true);
            },
            filteredQuestions() {
                return this.$store.getters.getFilteredQuestions;
            },
            userClaims() {
                return this.$store.getters.getUserClaims;
            },
            userInfo() {
                return this.$store.getters.userInfo;
            },
            pageAmount() {
                const questionAmount = this.$store.getters.getDataSize.questions.general;
                return Math.ceil(questionAmount / this.itemsPerPage);
            },
            getQuestionTests() {
                const titles = this.questionTests.map(t => "'" + t.title + "'");
                titles.sort((t1, t2) => t1 > t2 ? 1 : -1);
                return titles.join(', ');
            }
        },
        watch: {
            selected(val) {
                this.questions.forEach((element) => {
                    for(let i = 0; i < this.selected.length; i++) {
                        if(element.data.DISCIPLINA == this.selected[i]) {
                            let aux = true;
                            for (let k = 0; k < this.showedQuestions.length; k++) {
                                if(element === this.showedQuestions[k]) aux = false;
                            }
                            if(aux == true) this.showedQuestions.push(element);
                        }
                    }
                });
            }
        },
        methods: {
            editQuestions(val) {
                this.selectedEdit = val;
                this.dialogEditQuestion = true;
            },
            generatePDF(val) {
                this.selectedEdit = val;
                this.dialogPDF = true;
            },
            deleteQuestion(iq) {
                this.deleteQuestionSnackBar = false;
                this.$store.dispatch('checkQuestionInTests', { iq })
                    .then(result => {
                        this.questionTests = result;
                        if(result.length === 0) {
                            this.$store.dispatch('deleteMarkQuestion', {
                                iq,
                                isSearching: this.isSearching,
                                userEmail: this.userInfo.email
                            });
                        } else {
                            this.deleteErrorSnackBar = true;
                        }
                    });
            },
            deleteQuestions() {
                const questions = this.deleteMarkQuestions;
                questions.forEach(question => {
                    if(question.toDelete.status) {
                        this.$store.dispatch("changeDeleteStatusQuestions", { iq: question.iq, isSearching: this.isSearching });
                    }
                });
                this.$store.commit('setSuccess', 'Questões excluídas com sucesso!');
            },
            onPageChange(event) {
                const payload = {
                    page: this.page,
                    itemsPerPage: this.itemsPerPage
                }

                if(!this.isSearching) {
                    if(!event.mode) {
                        this.$store.dispatch('loadQuestionPage', { ...payload, type: event.type });
                    } else {
                        this.$store.dispatch('loadFOLQuestionPage', { ...payload, mode: event.mode });
                    }
                }
            },
            searchTextChange(text) {
                if((text === null || text.length === 0) && this.isSearching) {
                    this.isSearching = false;
                    this.searchPage = 1;
                    this.$store.commit('resetFilteredQuestions');
                }
            },
            searchQuery(text) {
                this.searchPage = 1;
                this.$store.commit('resetFilteredQuestions');

                if(text && text.length > 0) {
                    this.isSearching = true;
                    this.$store.dispatch('searchQuestions', text);
                } else {
                    this.isSearching = false;
                }
            },
            itemRowStyle(item) {
                return item.toDelete ? (item.toDelete.status ? 'item-to-delete' : 'item-deleted') : '';
            },
            restoreQuestion(item) {
                this.$store.dispatch('restoreMarkedQuestion', { iq: item.iq, isSearching: this.isSearching });
            },
            restoreAll() {
                this.$store.dispatch('restoreAllMarkedQuestions', { isSearching: this.isSearching });
            }
        },
        mounted() {
            this.deleteConfirmed = false;
            this.$store.dispatch('checkDeleteMarkQuestions');
            this.$store.dispatch('loadFOLQuestionPage', { page: 1, itemsPerPage: this.itemsPerPage, mode: 'first' });
        },
        beforeDestroy() {
            this.search = '';
            this.isSearching = false;
            this.page = 1;
            this.$store.commit('resetFilteredQuestions');
            this.$store.commit('resetCurrentQuestionsPage');

            if(this.deleteConfirmed) {
                this.$store.dispatch('deleteQuestions');
                this.$store.dispatch('resetQuestions');
                this.$store.dispatch('loadDataSize');
            }
        }
    }
</script>

<style>
    li button.v-pagination__item:focus {
        outline: none !important;
    }

    .item-to-delete {
        color: #f00;
    }

    .item-deleted {
        color: #c4c4c4;
    }
</style>
