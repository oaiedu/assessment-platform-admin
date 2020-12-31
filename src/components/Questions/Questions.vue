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

      <v-container v-if='hasDeleteMarkQuestions && (userClaims["admin"])'>
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
            v-if='hasTrueMarkStatus'
            text
            prominent
            type='warning'
            color="red"
            icon='mdi-alert' >
            As seguintes questões foram marcadas para exclusão:
            <br>
            {{ markedQuestionsByUser }}
        </v-alert>

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
            :item-class="itemRowStyle"
            class="elevation-1"
          >
            <template v-slot:[`item.actions`]="{ item }">
              <v-row justify="end" v-if='!item.toDelete'>
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

              <v-row justify="end" v-else-if='item.toDelete && item.toDelete.status'>
                  <v-btn
                    style="padding: 0 !important; font-weight: bold !important;"
                    color='red'
                    text
                    @click='restoreQuestion(item)' >
                    Restaurar
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
        <Stepper :page='page' @closeDialogNew="dialogNewQuestion = false"></Stepper>
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

      <v-snackbar
        v-model="deleteQuestionSnackBar"
        light
        color="white"
        right
        top
        :timeout="15000">
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

    export default {
        components: { Paginator },
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
                    : this.deleteMarkQuestions.map(q => q.toDelete.userEmail === this.userInfo.email);

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
                this.deleteQuestionSnackBar = false;
                this.$store.dispatch('checkQuestioninTests', { iq })
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
                    if(question.toDelete.status){
                        this.$store.dispatch("changeDeleteStatusQuestions", { iq: question.iq, isSearching: this.isSearching });
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
