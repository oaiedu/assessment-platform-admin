 <template>
  <v-container>
    <div id="example-1">
      <div v-if="premadePapers[0].value" class="question-page">
        <p class="centered-text">
          <b>
            MARINHA DO BRASIL
            <br>
            CENTRO TECNOLÓGICO DA MARINHA EM SÃO PAULO
            <br><br>
          </b>
            {{testTilte}}
            <br>
            <b>{{currentDate}}</b>
            <br>
            <br>
        </p>
        <p class="left-text">
          Responsável:    {{testCreator}}
          <br>
          <br>
          Revisão:        {{testEditedDate}}
          <br>
          <br>
          Propósito:      {{testPurpose}}
          <br>
          <br>
          Alterações:
          <br>
          <br>
        </p>
      </div>

      <div v-if="premadePapers[1].value" class="question-page">
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">QUESTÃO</th>
                <th class="text-left">DISCIPLINA</th>
                <th class="text-left">QUESTÃO DE REFERÊNCIA</th>
                <th class="text-left">Obs.</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in infoTable" :key="item.question">
                <td>{{ item.question }}</td>
                <td>{{ item.subject }}</td>
                <td>{{ item.iq }}</td>
                <td>{{ item.obs }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </div>

      <div v-if="premadePapers[3].value" class="question-page">
        <statistics-questions :statistics="statistics" :numberOfQuestions="numberOfQuestions"/>
      </div>

      <div v-for="(paper, index) in createdPapers" class=" question-page">
        <div v-if="paper.value">
          <v-row justify="center">
            <viewer v-if="checkImage(paper.object.data.image)" :value="paper.object.data.description"/>

            <img v-else :src="paper.object.data.image" style="max-height: 1150px; max-width: 700px"/>
          </v-row>
        </div>
      </div>

      <div v-for="(question, index) in questions" :key="index">
        <div class="question-page">
          QUESTÃO {{index+1}}
          <br>
          <br>
          DISCIPLINA: {{ question.data.DISCIPLINA }}
          <br>
          CONHECIMENTO: {{ question.data.CONHECIMENTO }} [ {{ question.data.RELEVANCIA_OR }} / {{ question.data.RELEVANCIA_OSR }} ]
          <br>
          IQ: {{ question.id }}
          <br>
          <br>

          {{ question.data.PERGUNTA }}
          <br>
          <br>

          <div class="img-container" v-if="confirmImage(question.data.IMAGENS)">
            <img :src="question.data.IMAGENS" style="max-height: 250px; max-width: 180px"/>
          </div>

          <v-content v-if="typeof question.data.RESPOSTAS[0].text !== 'string'">
            <v-row>
              <v-col cols="2"></v-col>
              <v-col v-for="(item, index) in question.data.RESPOSTAS[0].text" :key="index" cols="2">{{ item.title }}</v-col>
            </v-row>

            <v-row>
              <v-col cols="2">A -</v-col>
              <v-col
                v-for="(item, index) in question.data.RESPOSTAS[0].text"
                :key="index"
                cols="2"
              >{{ item.answerDescription }}</v-col>
            </v-row>

            <v-row>
              <v-col cols="2">B -</v-col>
              <v-col
                v-for="(item, index) in question.data.RESPOSTAS[1].text"
                :key="index"
                cols="2"
              >{{ item.answerDescription }}</v-col>
            </v-row>

            <v-row>
              <v-col cols="2">C -</v-col>
              <v-col
                v-for="(item, index) in question.data.RESPOSTAS[2].text"
                :key="index"
                cols="2"
              >{{ item.answerDescription }}</v-col>
            </v-row>

            <v-row>
              <v-col cols="2">D -</v-col>
              <v-col
                v-for="(item, index) in question.data.RESPOSTAS[3].text"
                :key="index"
                cols="2"
              >{{ item.answerDescription }}</v-col>
            </v-row>
          </v-content>

          <v-content v-else>
            <v-row v-for="(item, index) in question.data.RESPOSTAS" :key="index">
              <v-col cols="2">{{ letters[index] }} - </v-col>
              <v-col>
                {{ item.text }}
              </v-col>
            </v-row>
          </v-content>
        </div>
      </div>

      <div v-if="premadePapers[3].value" class="question-page">
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">Questão</th>
                <th class="text-left">IQ</th>
                <th class="text-left">Resposta</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in table" :key="item.question">
                <td>{{ item.question }}</td>
                <td>{{ item.iq }}</td>
                <td>{{ item.answer }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </div>
    </div>

    <v-row>
      <v-btn
        class="buttonIsHidden"
        fab
        dark
        fixed
        bottom
        right
        color="indigo"
        @click="toPrint()"
      >
        <v-icon>mdi-file-outline</v-icon>
      </v-btn>

    </v-row>

    <v-row>
      <v-btn
        class="buttonIsHidden"
        fab
        dark
        fixed
        bottom
        right
        style="margin-bottom: 80px;"
        color="grey"
        @click="printDialog = true"
      >
        <v-icon>mdi-pencil</v-icon>
      </v-btn>

    </v-row>

    <v-dialog v-model="printDialog" scrollable persistent max-width="300px">
      <v-card>
        <v-card-title>Selecione os documentos</v-card-title>

        <v-divider></v-divider>

        <v-card-text style="height: 300px">
          <div>
            <v-checkbox v-for="(item, index) in premadePapers" class="ma-4" :label="item.id" :input-value="item.value" v-model="item.value" :key="index"/>
          </div>

          <div>
            <v-checkbox v-for="(item, index) in createdPapers" class="ma-4" :label="item.id" :input-value="item.value" v-model="item.value" :key="index"/>
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn color="blue darken-1" text @click="printDialog = false">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>


<script>
import StatisticsQuestions from '@/components/Questions/StatisticsQuestions';
import { Viewer } from "@toast-ui/vue-editor";

export default {
  components: {
    StatisticsQuestions,
    'viewer': Viewer
  },
  data() {
    return {
      checkFirtPage: false,
      fab: false,
      tabs: null,
      checkSecondPage: false,
      checkThirdPage: false,
      checkFinalPage: false,
      printDialog: false,
      testPurpose: "",
      testCreator: "",
      testEditedDate: "",
      letters: ['A','B','C','D'],
      testTilte: "",
      confirmTitle: false
    }
  },
  methods: {
    toPrint() {
      window.print();
    },
    confirmImage(val) {
      if (typeof val == 'undefined' || val == "")
        return false

      else
        return true
    },
    checkImage(item) {
      if(item === '' || typeof item === 'undefined')
        return true
    }
  },
  computed:{
    createdPapers(){
      let result = [];
      let papers = JSON.stringify(this.$store.getters.loadedPapers);
      papers = JSON.parse(papers);
      papers.forEach( element => {
        result.push({id: element.data.name, value: false, object: element});
      });
      return result
    },
    premadePapers() {
      let result = [];
      let aux = [
        {id: "Introdução", value: false, object: null},
        {id: "Questões", value:  false, object: null},
        {id: "Estatísticas", value:  false, object: null},
        {id: "Gabarito", value:  false, object: null}
      ];
      aux.forEach( element => {
        result.push(element);
      });
      return result;
    },
    activeFab () {
      switch (this.tabs) {
        case 'one': return { class: 'purple', icon: 'account_circle' }
        default: return {}
      }
    },
    currentDate() {
      var today = new Date();
      var months = [
        "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
        "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
      ]
      var result = months[today.getMonth()] + " DE " + today.getFullYear()
      return result
    },
    statistics(){
      let statisticsObj=[]
      const cat =  this.$store.getters.getSubjects
      cat.forEach(element=>{
        console.log(element)
        const numberOfQuestions = this.$store.getters.getNumberOfQuestionBySubjectOnTest(element, this.questions)
        statisticsObj.push({name: element, questions: numberOfQuestions})
        console.log(numberOfQuestions)
      })
      console.log(statisticsObj)
      return statisticsObj
    },
    numberOfQuestions(){
      return this.questions.length
    },
    questions() {
      let questionsAux=[]
      let test = this.$store.getters.findTestById(this.$route.params.testId)
      this.testTilte = test.data.title.toUpperCase()
      this.testPurpose = test.data.purpose
      this.testEditedDate = test.data.edited
      this.testCreator = test.data.user
      test.data.questions.forEach(element=>{
        var question = this.$store.getters.findQuestionById(element)
        questionsAux.push(question)
      })
      console.log(questionsAux)
      return questionsAux
    },
    table() {
      var result = []

      for ( let i = 0; i < this.questions.length; i++ ) {
        let data = { question: "", iq: "", answer: ""}
        data.question = i+1
        data.iq = this.questions[i].id

        for( let j = 0; j < 4; j++){
          if(this.questions[i].data.RESPOSTAS[j].value == true) {
            data.answer = this.letters[j]
          }
        }
        result.push(data)
      }

      return result
    },
    infoTable() {
      var result = []

      for ( let i = 0; i < this.questions.length; i++ ) {
        let data = { question: "", subject: "", iq: "", obs: ""}
        data.question = i+1
        data.subject = this.questions[i].data.DISCIPLINA
        data.iq = this.questions[i].id
        result.push(data)
      }

      return result
    }
  },
}
</script>

<style>
.centered-text {
  text-align: center;
}

@media print {
   header{
    display:none !important
   }

   footer{
     display: none !important
   }

  @page {
      margin-top: 1cm;
      margin-bottom: 1cm;
      margin-left: 1cm;
      margin-right: 1cm;
  }

  .question-page {
      font-size: 13px;
      page-break-after: always !important
  }

  .buttonIsHidden {
      visibility: hidden;
  }

  .img-container {
      text-align: center !important;
  }


  p {
    font-size: 13px;
    page-break-inside: avoid;
  }
}
</style>
