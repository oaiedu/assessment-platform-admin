<template>
  <div>
    <v-container>
      <v-container>
        <h1 class="text-center blue--text">Gerenciar Questões</h1>
      </v-container>

      <v-container>
        <v-container>
          <v-text-field
            v-model="search"
            filled
            rounded
            dense
            append-icon="mdi-magnify"
            label="Search for IQ"
            single-line
            hide-details
          ></v-text-field>
        </v-container>
      </v-container>

      <v-container>
        <v-card>
          <v-data-table
            :headers="headers"
            :items="questions"
            :page.sync="page"
            :items-per-page="itemsPerPage"
            :search="search"
            :loading="loading"
            loading-text="Carregando questões..."
            hide-default-footer
            class="elevation-1"
            @page-count="pageCount = $event"
          >
            <template v-slot:[`item.actions`]="{ item }">
              <v-row justify="end">
                <v-icon
                  @click='dialogPDF = true; selectedEdit = item;' >
                  mdi-pdf-box
                </v-icon>
                <v-icon
                    class="ml-2"
                    v-if='userClaims["admin"]'
                    @click="editQuestions(item)" >
                    mdi-pencil
                </v-icon>
                <v-icon
                    class="ml-2"
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
        <v-pagination
          v-model="page"
          :length="pageCount"
          total-visible="7"
        ></v-pagination>
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
    export default {
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
                page: 1,
                pageCount: 15,
                itemsPerPage: 8,
                headers: [
                    { text: "IQ", align: "left", sortable: false, value: "iq" },
                    { text: "Conhecimento", value: "knowledge" },
                    { text: "Relevância OR", value: "knowledgePWR" },
                    { text: "Relevância OSR", value: "knowledgeBWR" },
                    { text: "Disciplina", value: "subject", sortable: false },
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
        return this.$store.getters.loadedQuestions;
        },
        userClaims() {
            return this.$store.getters.getUserClaims;
        }
    },
        watch: {
            selected(val) {
                this.questions.forEach((element) => {
                    for (let i = 0; i < this.selected.length; i++) {
                        if (element.data.DISCIPLINA == this.selected[i]) {
                            let aux = true;
                            for (let k = 0; k < this.showedQuestions.length; k++) {
                                if (element === this.showedQuestions[k]) aux = false;
                            }
                            if (aux == true) this.showedQuestions.push(element);
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
                console.log(iq);
                let aux = this.$store.dispatch("deleteQuestion", iq);
                aux.then(() => {
                    this.deleteQuestionSnackBar = false;
                });
            }
        }
    }
</script>
