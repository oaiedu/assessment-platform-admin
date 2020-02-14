<template>
  <v-card>
    <v-form ref="formRef" @submit.prevent="onCreateTest()">
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="close()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
          <v-btn dark text type="submit">Create Test</v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-row>
        <v-col>
          <v-container>
            <v-row>
              <v-col>
                <v-text-field
                  solo
                  rounded
                  flat
                  filled
                  outlined
                  dense
                  :rules="textRule"
                  required
                  label="Test Name"
                  v-model="testName"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-select
                  solo
                  rounded
                  flat
                  filled
                  outlined
                  dense
                  label="Tipo de prova"
                  v-model="testType"
                  :items="types"
                ></v-select>
              </v-col>

              <v-col v-if="testType=='Aleatório'">
                <v-text-field
                  dense
                  outlined
                  rounded
                  name="randomQuestionsNumber"
                  label="Número de Questões"
                  id="randomQuestionsNumber"
                  v-model="randomQuestionsNumber"
                  type="number"
                  :rules="rule"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-textarea
                  outlined
                  required
                  :rules="textRule"
                  v-model="purpose"
                  label="Propósito"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-col>

        <v-col>
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

            <v-container>
              <v-card v-if="selectedSubjects.length == 0 ">
                <v-data-table
                  v-model="selectedQuestions"
                  :headers="headers"
                  :items="questions"
                  :page.sync="page"
                  :items-per-page="itemsPerPage"
                  :search="search"
                  show-select
                  item-key="id"
                  hide-default-footer
                  class="elevation-1"
                  @page-count="pageCount = $event"
                ></v-data-table>
              </v-card>

              <v-card v-else>
                <v-data-table
                  v-model="selectedQuestions"
                  :headers="headers"
                  :items="showedQuestions"
                  :page.sync="page"
                  :items-per-page="itemsPerPage"
                  :search="search"
                  show-select
                  item-key="id"
                  hide-default-footer
                  class="elevation-1"
                  @page-count="pageCount = $event"
                ></v-data-table>
              </v-card>
            </v-container>
            <div class="text-center pt-2">
              <v-pagination v-model="page" :length="pageCount"></v-pagination>
            </div>
          </v-container>
        </v-col>
      </v-row>
    </v-form>
  </v-card>
</template>

<script>

export default {
  data() {
    return {
      testType: "Selecionado",
      randomQuestionsNumber: null,
      selectedSubjects: [],
      selectedQuestions: [],
      testItems: [],
      testName: "",
      purpose: "",
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
      types: [
        "Aleatório",
        "Selecionado"
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
      ],
      textRule: [
        v => !!v || 'Necessário'
      ],
      rule: [
        v => (v <= 50) || 'Máximo de 50 questões',
        v => (v <= this.questions.length) || 'Número de questões inexistente',
        v => (v >= 0) || 'Apenas números positivos'
      ]
    };
  },
  computed: {
    questions() {
      return this.$store.getters.loadedQuestions;
    },
    loadQuestions() {
      this.$store.dispatch("loadedQuestions");
    },
    checkNumber() {
      return this.questions.length < this.randomQuestionsNumber ? 'Número de questões não existente' : ''
    }
  },
  watch: {
    selectedSubjects(val) {
      this.questions.forEach(element => {
        for (let i = 0; i < this.selectedSubjects.length; i++) {
          if (element.data.DISCIPLINA == this.selectedSubjects[i]) {
            let aux = true;
            for (let k = 0; k < this.showedQuestions.length; k++) {
              if (element === this.showedQuestions[k]) aux = false;
            }
            if (aux == true) this.showedQuestions.push(element);
          }
        }
      });
    },
    randomQuestionsNumber(val) {
      if ( val <= this.questions.length)
        this.randomSelection(val)
    }
  },
  methods: {
    close() {
      this.setInitialData();
      this.$emit("closeDialogNew");
    },
    setInitialData () {
      this.testType =  "Selecionado",
      this.randomQuestionsNumber =  null,
      this.selectedSubjects =  [],
      this.selectedQuestions =  [],
      this.testItems =  [],
      this.testName =  "",
      this.purpose =  "",
      this.showedQuestions =  [],
      this.search =  ""
    },
    randomSelection(i) {
      console.log("i: ",i)
      this.selectedQuestions = []

      let conf = false
      let randomizer = 0
      let aux = ""
      let j = 0

      for ( j = 0 ; j < i ; j++ ) {
        do{
          conf = false
          randomizer = Math.floor(Math.random() * this.questions.length)
          aux = this.questions[randomizer]
          this.selectedQuestions.forEach(element => {
            if ( element === aux )
              conf = true
          })
        } while ( conf == true );

        this.selectedQuestions.push(aux);
      }

      console.log("hey",this.selectedQuestions)
    },
    removeSelections(i) {
      let aux = this.showedQuestions.length;

      for (let j = 0; j < aux; j++) {
        if (
          this.showedQuestions[j].data.DISCIPLINA == this.selectedSubjects[i]
        ) {
          this.showedQuestions.splice(j, 1);
          j--;
          aux--;
        }
      }

      this.selectedSubjects.splice(i, 1);
    },
    selections(i) {
      let aux = false;
      for (let j = 0; j < this.selectedSubjects.length; j++) {
        if (this.items[i] == this.selectedSubjects[j]) aux = true;
      }

      if (aux == false) this.selectedSubjects.push(this.items[i]);
    },
    onCreateTest() {
      if(this.$refs.formRef.validate()){

      if (this.randomQuestionsNumber == null && this.testType === "Aleatório") {
        console.log("AAAAA: ",this.questions.length)
        if (this.questions.length > 50) {
          this.randomSelection(50)
        }

        else {
          this.randomSelection(this.questions.length)
        }
      }

      console.log("selected: ", this.selectedQuestions)

      if(this.testType == "Aleatório")
        this.testType = "random"

      else
        this.testType = "selected"

      this.selectedQuestions.forEach(element => {
        this.testItems.push(element.id);
      });

      const testData = {
        title: this.testName,
        questions: this.testItems,
        type: this.testType,
        user: this.$store.getters.userInfo.name,
        created: Date(),
        edited: "",
        purpose: this.purpose
      }

      this.close()
      this.$store.dispatch("createTest", testData);
      this.$store.dispatch("loadedTests");
    }

    }
  }
};
</script>
