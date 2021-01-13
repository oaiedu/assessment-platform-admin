 <template>
  <v-container>
    <link rel="stylesheet" href="https://unpkg.com/katex@0.6.0/dist/katex.min.css">
    <div id="example-1">
      <div v-if="premadePapers[0].value" class="question-page">
        <p class="centered-text">
          <b>
            MARINHA DO BRASIL
            <br>
            CENTRO TECNOLÓGICO DA MARINHA EM SÃO PAULO
            <br><br>
          </b>
            {{ testTitle }}
            <br>
            <b>{{ currentDate }}</b>
            <br>
            <br>
        </p>
        <p class="left-text">
          Responsável:    {{ testCreator }}
          <br>
          <br>
          Revisão:        {{ testEditedDate }}
          <br>
          <br>
          Propósito:      {{ testPurpose }}
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
                <th class="text-center">QUESTÃO</th>
                <th class="text-center">DISCIPLINA</th>
                <th class="text-center">QUESTÃO DE REFERÊNCIA</th>
                <th class="text-center">Obs.</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in infoTable" :key="item.iq">
                <td class="text-center">{{ item.question }}</td>
                <td class="text-center">{{ item.subject }}</td>
                <td class="text-center">{{ item.iq }}</td>
                <td class="text-center">{{ item.obs }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </div>

      <div v-if="premadePapers[2].value" class="question-page">
        <statistics-questions :statistics="statistics" :numberOfQuestions="numberOfQuestions"/>
      </div>

      <div v-for="(paper) in createdPapers" :key='paper.data.id' class=" question-page">
        <div v-if="paper.value">
          <v-row justify="center">
            <viewer v-if="checkImage(paper.data.image)" :value="paper.data.description" />

            <img v-else :src="paper.data.image" style="max-height: 1150px; max-width: 700px"/>
          </v-row>
        </div>
      </div>

      <div v-for="(question, index) in questions" :key="question.iq">
        <div class="question-page">
          QUESTÃO {{ index + 1 }}
          <br>
          <br>
          DISCIPLINA: {{ question.subject }}
          <br>

          CONHECIMENTO: {{ question.knowledge }} [ {{ question.knowledgePWR }} / {{ question.knowledgeBWR }} ]
          <br>

          IQ: {{ question.iq }}
          <br>

          <br>
            <vue-markdown :source="question.question"/>
          <br>

          <div class="img-container" v-if="confirmImage(question.image)">
            <img :src="question.image" style="max-height: 250px; max-width: 180px"/>
          </div>

          <div v-if="typeof question.answers[0].text !== 'string'">
            <v-row class='answer-block' >
              <v-col cols="1"></v-col>
              <v-col v-for="(item, index) in question.answers[0].text" :key="index">
                <vue-markdown :source="item.title"/>
              </v-col>
            </v-row>

            <v-row class='answer-block' >
              <v-col cols="1">A -</v-col>
              <v-col
                v-for="(item, index) in question.answers[0].text"
                :key="index"
              >
                <vue-markdown :source="item.answerDescription"/>
              </v-col>
            </v-row>

            <v-row class='answer-block' >
              <v-col cols="1">B -</v-col>
              <v-col
                v-for="(item, index) in question.answers[1].text"
                :key="index"
                >
                  <vue-markdown :source="item.answerDescription"/>
                </v-col>
            </v-row>

            <v-row class='answer-block' >
              <v-col cols="1">C -</v-col>
              <v-col
                v-for="(item, index) in question.answers[2].text"
                :key="index"
                >
                  <vue-markdown :source="item.answerDescription"/>
                </v-col>
            </v-row>

            <v-row class='answer-block' >
              <v-col cols="1">D -</v-col>
              <v-col
                v-for="(item, index) in question.answers[3].text"
                :key="index"
                >
                  <vue-markdown :source="item.answerDescription"/>
                </v-col>
            </v-row>
          </div>

          <div v-else-if="question && question.answers">
            <v-row v-for="(item, index) in question.answers" :key="index" class='answer-block' >
              <v-col cols="1">{{ letters[index] }} - </v-col>
              <v-col>
                <vue-markdown :source="item.text"/>
              </v-col>
            </v-row>
          </div>
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
              <tr v-for="item in table" :key="item.iq">
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
        <v-tooltip right>
            <template v-slot:activator='{ on }'>
                <v-btn
                    v-on="on"
                    fixed
                    fab
                    bottom
                    left
                    class="buttonIsHidden"
                    @click="back()" >
                    <v-icon>
                    mdi-arrow-left
                    </v-icon>
                </v-btn>
            </template>
            <span>Voltar</span>
        </v-tooltip>
    </v-row>

    <v-row>
        <v-tooltip left>
            <template v-slot:activator='{ on }'>
                <v-btn
                    v-on="on"
                    class="buttonIsHidden"
                    fab
                    dark
                    fixed
                    bottom
                    right
                    color="blue darken-1"
                    @click="toPrint()" >
                    <v-icon>mdi-file-outline</v-icon>
                </v-btn>
            </template>
            <span>Gerar PDF</span>
        </v-tooltip>

    </v-row>

    <v-row v-if="!userClaims.student">
        <v-tooltip left>
            <template v-slot:activator='{ on }'>
                <v-btn
                    v-on="on"
                    class="buttonIsHidden"
                    fab
                    dark
                    fixed
                    bottom
                    right
                    style="margin-bottom: 80px;"
                    color="grey darken-1"
                    @click="printDialog = true" >
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
            </template>
            <span>Editar</span>
        </v-tooltip>

    </v-row>

    <v-dialog v-model="printDialog" scrollable persistent max-width="300px">
      <v-card>
        <v-card-title>Selecione os documentos</v-card-title>

        <v-divider></v-divider>

        <v-card-text style="height: 300px">
          <div>
            <v-checkbox v-for="(item) in premadePapers" :key="item.id"
                class="ma-4"
                :label="item.id"
                :input-value="item.value"
                v-model="item.value" />
          </div>

          <!-- <div>
            <v-checkbox v-for="(item) in createdPapers" :key="item.data.id"
                class="ma-4"
                :label="item.id"
                :input-value="item.value"
                v-model="item.value" />
          </div> -->
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn color="blue darken-1" text @click="cancel()">Cancelar</v-btn>

          <v-spacer/>

          <v-btn color="blue darken-1" text @click="printDialog = false">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>


<script>
    import StatisticsQuestions from '@/components/Questions/StatisticsQuestions';
    import VueMarkdown from 'vue-markdown';
    require('vue-markdown');

    export default {
        name: 'PrintTest',
        components: { 'vue-markdown': VueMarkdown, StatisticsQuestions },
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
                testQuestions: null,
                letters: ['A','B','C','D'],
                testTitle: "",
                confirmTitle: false
            }
        },
        methods: {
            cancel() {
                this.premadePapers.forEach(element => {
                    element.value = false;
                });
                this.printDialog = false;
            },
            back() {
                this.$router.push("/tests");
            },
            toPrint() {
                window.print();
            },
            confirmImage(val) {
                if(typeof val == 'undefined' || val == "") {
                    return false;
                } else {
                    return true;
                }
            },
            checkImage(item) {
                if(item === '' || typeof item === 'undefined') {
                    return true;
                }
            }
        },
        computed: {
            userClaims() {
                return this.$store.getters.getUserClaims;
            },
            createdPapers() {
                let result = [];
                let papers = this.$store.getters.getPapersByPage(1) || [];
                papers.forEach(paper => {
                    result.push({ id: paper.name, value: false, data: paper });
                });
                return result;
            },
            premadePapers() {
                const result = [
                    {id: "Introdução", value: false, data: null},
                    {id: "Questões", value:  false, data: null},
                    {id: "Estatísticas", value:  false, data: null},
                    {id: "Gabarito", value:  false, data: null}
                ];
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
                var result = months[today.getMonth()] + " DE " + today.getFullYear();
                return result;
            },
            statistics() {
                let statisticsObj = [];
                const subject =  this.$store.getters.getSubjects;
                subject.forEach(element => {
                    const numberOfQuestions = this.$store.getters.getNumberOfQuestionBySubjectOnTest(element, this.questions);
                    statisticsObj.push({ name: element, questions: numberOfQuestions });
                })
                return statisticsObj;
            },
            numberOfQuestions() {
                return this.questions.length;
            },
            questions() {
                return this.$store.getters.getTestQuestions;
            },
            table() {
                const result = [];

                for ( let i = 0; i < this.questions.length; i++ ) {
                    let data = { question: "", iq: "", answer: ""}
                    data.question = i + 1;
                    data.iq = this.questions[i].iq;

                    for( let j = 0; j < 4; j++){
                        if(this.questions[i].answers[j].value == true) {
                            data.answer = this.letters[j];
                        }
                    }
                    result.push(data);
                }

                return result;
            },
            infoTable() {
                const result = [];

                for ( let i = 0; i < this.questions.length; i++ ) {
                    let data = { question: "", subject: "", iq: "", obs: ""}
                    data.question = i + 1;
                    data.subject = this.questions[i].subject;
                    data.iq = this.questions[i].iq;
                    result.push(data);
                }

                return result;
            }
        },
        mounted() {
            const test = this.$store.getters.findTestById(this.$route.params.testId);
            this.testTitle = test.title.toUpperCase();
            this.testPurpose = test.purpose;
            this.testEditedDate = test.edited;
            this.testCreator = test.user.name;

            this.$store.dispatch('loadTestQuestions', test);
        }
    }
</script>

<style>
    .answer-block {
        margin: 0 !important;
    }

    .answer-block .col {
        padding: 0 10px 0 10px !important;
    }

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
