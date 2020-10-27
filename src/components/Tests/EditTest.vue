<template>
  <v-card>
    <v-form ref="formRef" @submit.prevent="onEditTest()">
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="close()">
            <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn dark text type="submit" height="100">Editar Teste</v-btn>
      </v-toolbar>
      <v-row>
        <v-col>
          <v-container>
            <v-row>
              <v-col>
                <v-card-title>{{name}}</v-card-title>
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
              <v-card>
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
  props: ["test"],
  data() {
    return {
      randomQuestionsNumber: null,
      selectedQuestions: [],
      testItems: [],
      testTitle: "",
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
    name(){
      let aux = this.test.data.title;
      this.testTitle = aux;
      return aux;
    },
    loadQuestions() {
      this.$store.dispatch("loadedQuestions");
    },
    checkNumber() {
      return this.questions.length < this.randomQuestionsNumber ? 'Número de questões não existente' : ''
    }
  },
  watch: {
    randomQuestionsNumber(val) {
      if ( val <= this.questions.length)
        this.randomSelection(val)
    },
    testTitle(val){
      this.update();
    }
  },
  methods: {
    update(){
      console.log("AAAAAAAAA");
      this.test.data.questions.forEach(element=>{
        var question = this.$store.getters.findQuestionById(element)
        this.selectedQuestions.push(question)
      });
      this.testType = this.test.data.type;
      this.testName = this.test.data.title;
      this.purpose = this.test.data.purpose;
    },
    close() {
      this.setInitialData();
      this.update();
      this.$emit("closeDialogNew");
    },
    setInitialData () {
      this.testType =  "Selecionado",
      this.randomQuestionsNumber =  null,
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
    onEditTest() {
      if(this.$refs.formRef.validate()){

        // if (this.randomQuestionsNumber == null && this.testType === "Aleatório") {
        //   console.log("AAAAA: ",this.questions.length)
        //   if (this.questions.length > 50) {
        //     this.randomSelection(50)
        //   }
        //
        //   else {
        //     this.randomSelection(this.questions.length)
        //   }
        // }

        console.log("selected: ", this.selectedQuestions)

        this.selectedQuestions.forEach(element => {
          this.testItems.push(element.id);
        });

        const now = new Date();
        const editedHour = parseInt(now.toLocaleTimeString().split(':')[0]);
        const isAfterNoon = now.toLocaleString().split(':')[2].includes('PM');
        const editedDate = now.toISOString().split('T')[0] + 'T'
            + (isAfterNoon ? (editedHour + 12) : (editedHour < 10 ? '0' + editedHour : editedHour))
            + now.toISOString().split('T')[1].slice(2);

        const testData = {
          title: this.testTitle,
          questions: this.testItems,
          type: this.testType,
          user: this.test.data.user,
          created: this.test.data.created,
          edited: `${this.$store.getters.userInfo.name}`+'/'+`${editedDate}`,
          purpose: this.purpose,
          id: this.test.id
        }

        this.close()
        this.$store.dispatch("updateTest", testData);
        this.$store.dispatch("loadedTests");
      }
    }
  }
};
</script>
