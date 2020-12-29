<template>
  <div>
    <v-container>
      <v-container>
        <h1 class="text-center blue--text">Gerenciar Questões</h1>
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
            label="Procurar por IQ"
            single-line
            hide-details
          ></v-text-field>
        </v-container>
      </v-container>

      <v-container>
        <v-card>
          <v-data-table
            :headers="headers"
            :items="isSearching ? filteredQuestions : questions"
            :page="isSearching ? searchPage : page"
            :items-per-page="itemsPerPage"
            :loading="loading"
            no-data-text='Não há questões a serem mostradas'
            loading-text="Carregando questões..."
            hide-default-footer
            class="elevation-1"
          >
            <template v-slot:[`item.actions`]="{ item }">
              <v-row justify="end">
                <v-icon
                  color="grey darken-1"
                  @click='dialogPDF = true; selectedEdit = item;' >
                  mdi-pdf-box
                </v-icon>
                <v-icon
                    class="ml-2"
                    color="amber darken-2"
                    v-if='userClaims["admin"]'
                    @click="editQuestions(item)" >
                    mdi-pencil
                </v-icon>
                <v-icon
                    class="ml-2"
                    color="red"
                    v-if='userClaims["admin"]'
                    @click='deleteQuestionSnackBar = true; deleteSelect = item;' >
                    mdi-delete
                </v-icon>
              </v-row>
            </template>
          </v-data-table>
        </v-card>
      </v-container>

      <v-tooltip left v-if='userClaims["appraiser"] || userClaims["admin"]' >
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            fixed
            dark
            fab
            bottom
            right
            color="cyan"
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
        v-model="dialogNewQuestion"
      >
        <Stepper @closeDialogNew="dialogNewQuestion = false"></Stepper>
      </v-dialog>

      <v-dialog
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
        v-model="dialogEditQuestion"
      >
        <EditQuestion
          :question="selectedEdit"
          @closeDialogEdit="dialogEditQuestion = false"
        ></EditQuestion>
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

      <v-snackbar v-model="deleteQuestionSnackBar" light color="white" right top :timeout="15000">
        Você realmente quer excluir esta questão?
        <v-btn
            dark
            class="ml-2"
            color="blue"
            text
            @click="deleteQuestion(deleteSelect.iq)" >
            Excluir
        </v-btn>
        <v-btn
            dark
            color="grey"
            text
            @click="deleteQuestionSnackBar = false" >
            Cancelar
        </v-btn>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script>
    import Paginator from '../Paginator';

    export default {
        components: { Paginator },
        data() {
            return {
                loadedPages: [1],
                deleteSelect: "",
                selectedEdit: {},
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
                this.$store.dispatch("clearLoading");
            },
            questions() {
                return this.$store.getters.getCurrentQuestionsPage;
            },
            filteredQuestions() {
                return this.$store.getters.getFilteredQuestions;
            },
            userClaims() {
                return this.$store.getters.getUserClaims;
            },
            pageAmount() {
                const questionAmount = this.$store.getters.getDataSize.questions.general;
                return Math.ceil(questionAmount / this.itemsPerPage);
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
            },
            search(text) {
                if((text === null || text.length === 0) && this.isSearching) {
                    this.isSearching = false;
                    this.searchPage = 1;
                    this.$store.commit('resetFilteredQuestions');
                }
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
                this.$store.dispatch("deleteQuestion", { iq, isSearching: this.isSearching }).then(() => {
                    this.deleteQuestionSnackBar = false;
                });
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
            searchQuery(event) {
                if(event.key === 'Enter') {
                    document.getElementById('searchField').blur();

                    this.searchPage = 1;
                    this.$store.commit('resetFilteredQuestions');

                    if(this.search.length > 0) {
                        this.isSearching = true;
                        this.$store.dispatch('searchQuestions', this.search);
                    } else {
                        this.isSearching = false;
                    }
                }
            }
        },
        mounted() {
            this.$store.dispatch('loadFOLQuestionPage', { page: 1, itemsPerPage: this.itemsPerPage, mode: 'first' });
        },
        beforeDestroy() {
            this.search = '';
            this.isSearching = false;
            this.page = 1;
            this.$store.commit('resetFilteredQuestions');
            this.$store.commit('resetCurrentQuestionsPage');
        }
    }
</script>

<style>
    li button.v-pagination__item:focus {
        outline: none !important;
    }
</style>
