<template>
  <div>
    <v-overlay :value="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <v-container>
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
            hide-default-footer
            class="elevation-1"
            @page-count="pageCount = $event"
          >
            <template v-slot:item.actions="{ item }">
              <v-row justify="end">
                <router-link class="mr-6" style="text-decoration: none;" :to="{name:'printquestion', params:{questionId:item.id}}" replace>
                  <v-icon>mdi-pdf-box</v-icon>
                </router-link>
                <v-icon class="mr-2" @click="editQuestions(item)">mdi-pencil</v-icon>
                <v-icon @click="deleteQuestionSnackBar = true; deleteSelect = item" class="mr-2">mdi-delete</v-icon>
              </v-row>
            </template>
          </v-data-table>
        </v-card>
      </v-container>



      <v-tooltip left>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" fixed dark fab bottom right color="cyan" @click.stop="dialogNewQuestion= true">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        <span>Criar Questão</span>
      </v-tooltip>

      <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialogNewQuestion">
        <Stepper  @closeDialogNew="dialogNewQuestion = false"></Stepper>
      </v-dialog>

      <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialogEditQuestion">
        <EditQuestion :question="selectedEdit" @closeDialogEdit="dialogEditQuestion = false"></EditQuestion>
      </v-dialog>

      <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialogPDF">
        <Body :question="selectedEdit" @closeDialogPrint="dialogPDF = false"></Body>
      </v-dialog>

      <div class="text-center pt-2">
        <v-pagination
          v-model="page"
          :length="pageCount"
          total-visible="7" 
          ></v-pagination>
      </div>

      <v-snackbar v-model="deleteQuestionSnackBar" color="black" right top>
        Você realmente quer deletar esta questão?
        <v-btn dark color="yellow" text @click="deleteQuestion(deleteSelect.id)">Ok</v-btn>
        <v-btn dark color="yellow" text @click="deleteQuestionSnackBar = false">Cancelar</v-btn>
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
        "Materiais"
      ],
      showedQuestions: [],
      search: "",
      page: 1,
      pageCount: 15,
      itemsPerPage: 8,
      headers: [
        { text: "IQ", align: "left", sortable: false, value: "id" },
        { text: "Conhecimento", value: "data.CONHECIMENTO" },
        { text: "Relevância OR", value: "data.RELEVANCIA_OR" },
        { text: "Relevância OSR", value: "data.RELEVANCIA_OSR" },
        { text: "Disciplina", value: "data.DISCIPLINA", sortable: false },
        { text: "Ações", align:"right", value: "actions", sortable: false }
      ]
    };
  },
  computed: {
    loading () {
        return this.$store.getters.loading
        this.$store.dispatch('clearLoading')
    },
    questions() {
      return this.$store.getters.loadedQuestions;
    }
  },
  watch: {
    selected(val) {
      this.questions.forEach(element => {
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
    editQuestions(val){
      this.selectedEdit = val
      // this.loadQuestions()
      this.dialogEditQuestion = true
    },
    generatePDF(val){
      this.selectedEdit = val
      this.dialogPDF = true
    },
    // loadQuestions() {
    //   console.log("é mano")
    //   let aux = this.$store.dispatch("loadedQuestions");
    //   aux.then(()=>{
    //     return aux
    //   })
    // },
    deleteQuestion(id) {
      console.log(id);
      let aux = this.$store.dispatch("deleteQuestion", id);
      aux.then(()=>{
        this.deleteQuestionSnackBar = false;
      })
    }
  }
}
</script>
