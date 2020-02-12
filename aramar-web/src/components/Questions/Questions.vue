<template>
  <v-app>
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
              <v-icon small class="mr-2" @click="editQuestions(item)">mdi-pencil</v-icon>
              <v-icon small @click="deleteQuestionSnackBar = true; deleteSelect = item">mdi-delete</v-icon>
              <v-icon small class="mr-2" @click="generatePDF(item)">mdi-pdf-box</v-icon>
            </template>
          </v-data-table>
        </v-card>
      </v-container>

      <v-btn fixed dark fab bottom right color="cyan" @click.stop="dialogNewQuestion= true">
        <v-icon>mdi-plus</v-icon>
      </v-btn>

      <v-dialog v-model="dialogNewQuestion" persistent>
        <NewQuestion @closeDialogNew="dialogNewQuestion = false"></NewQuestion>
      </v-dialog>

      <v-dialog v-model="dialogEditQuestion" persistent>
        <EditQuestion :questions="selectedEdit" @closeDialogEdit="dialogEditQuestion = false"></EditQuestion>
      </v-dialog>

      <v-dialog v-model="dialogPDF">
        <Body :question="selectedEdit"></Body>
      </v-dialog>

      <div class="text-center pt-2">
        <v-pagination v-model="page" :length="pageCount"></v-pagination>
      </div>

      <v-snackbar v-model="deleteQuestionSnackBar" color="black" right top>
        Você realmente quer deletar esta questão?
        <v-btn dark color="yellow" text @click="deleteQuestion(deleteSelect.id)">Ok</v-btn>
        <v-btn dark color="yellow" text @click="deleteQuestionSnackBar = false">Cancelar</v-btn>
      </v-snackbar>
    </v-container>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
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
      itemsPerPage: 10,
      headers: [
        { text: "IQ", align: "left", sortable: false, value: "id" },
        { text: "Conhecimento", value: "data.CONHECIMENTO" },
        { text: "Relevância OR", value: "data.RELEVANCIA_OR" },
        { text: "Relevância OSR", value: "data.RELEVANCIA_OSR" },
        { text: "Disciplina", value: "data.DISCIPLINA", sortable: false },
        { text: "", value: "actions", sortable: false }
      ]
    };
  },
  computed: {
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
      this.dialogEditQuestion = true
    },
    generatePDF(val){
      this.selectedEdit = val
      this.dialogPDF = true
    },
    loadQuestions() {
      this.$store.dispatch("loadedQuestions");
    },
    removeSelections(i) {
      let aux = this.showedQuestions.length;

      for (let j = 0; j < aux; j++) {
        if (this.showedQuestions[j].data.DISCIPLINA == this.selected[i]) {
          this.showedQuestions.splice(j, 1);
          j--;
          aux--;
        }
      }

      this.selected.splice(i, 1);
    },
    selections(i) {
      let aux = false;
      for (let j = 0; j < this.selected.length; j++) {
        if (this.items[i] == this.selected[j]) aux = true;
      }

      if (aux == false) this.selected.push(this.items[i]);
    },
    deleteQuestion(id) {
      console.log(id);
      this.$store.dispatch("deleteQuestion", id);
      this.deleteQuestionSnackBar = false;
      this.loadQuestions();
    }
  }
};
</script>
