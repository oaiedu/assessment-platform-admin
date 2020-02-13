
<template>
  <v-card>
    <v-toolbar dark color="primary">
      <v-btn icon dark @click="close()">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn dark text @click="e1 = 2" v-if="e1 == 1">Continue</v-btn>
        <v-btn dark text @click="e1 = 3" v-if="e1 == 2">Continue</v-btn>
        <v-btn dark text @click="onEditQuestion()" v-if="e1 == 3">Edit Question</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-container>
      <v-row>
        <v-col>
          <v-card>
            <form @submit.prevent="onEditQuestion">
              <v-stepper v-model="e1">
                <v-stepper-header>
                  <v-stepper-step editable :complete="e1 > 1" step="1"></v-stepper-step>

                  <v-divider></v-divider>

                  <v-stepper-step editable :complete="e1 > 2" step="2"></v-stepper-step>

                  <v-divider></v-divider>

                  <v-stepper-step editable step="3"></v-stepper-step>
                </v-stepper-header>

                <v-stepper-items>
                  <v-stepper-content step="1">
                    <v-container>
                      <v-row>
                        <v-text-field
                          name="knowledge"
                          label="Conhecimento"
                          id="knowledge"
                          v-model="editedKnowledge"
                          required
                        ></v-text-field>
                      </v-row>

                      <v-row>
                        <v-text-field
                          name="knowledgePWR"
                          label="Relevância OR"
                          id="knowledgePWR"
                          v-model="editedKnowledgePWR"
                          required
                        ></v-text-field>
                      </v-row>

                      <v-row>
                        <v-text-field
                          name="knowledgeBWR"
                          label="Relevância OSR"
                          id="knowledgeBWR"
                          v-model="editedKnowledgeBWR"
                          required
                        ></v-text-field>
                      </v-row>

                      <v-row>
                        <v-select
                          :items="subjectItems"
                          name="subject"
                          id="subject"
                          v-model="editedSubject"
                          label="Disciplina"
                          solo
                        ></v-select>
                      </v-row>
                    </v-container>
                  </v-stepper-content>

                  <v-stepper-content step="2">
                    <v-container>
                      <v-row>
                        <Combined :questionDescription="editedQuestionDescription" @inputData="updateData"></Combined>
                      </v-row>

                      <v-row>
                        <v-file-input
                          chips
                          multiple
                          label="Imagem"
                          v-model="images"
                        />
                      </v-row>
                    </v-container>
                  </v-stepper-content>

                  <v-stepper-content step="3">
                    <v-container>
                      <v-content v-if="confirmTitle">
                        <v-row justify="end">
                          <v-col cols="1"></v-col>
                          <v-col v-for="i in number" :key="i">
                            <v-text-field outlined v-model="auxTitle[i-1]"></v-text-field>
                          </v-col>
                        </v-row>
                        <v-row v-for="(item, index) in editedAnswers" :key="index">
                          <v-col cols="12" md="1" sm="1" xs="1">
                            <v-radio-group v-model="radios">
                              <v-radio :value="item.ansId"></v-radio>
                            </v-radio-group>
                          </v-col>
                          <v-col v-for="(answerItem, index) in item.text" :key="index">
                            <v-text-field outlined v-model="answerItem.answerDescription"></v-text-field>
                          </v-col>
                        </v-row>
                      </v-content>

                      <v-content v-else>
                        <v-row v-for="(item, index) in editedAnswers" :key="index">
                          <v-col cols="12" md="1" sm="1" xs="1">
                            <v-radio-group v-model="radios">
                              <v-radio :value="item.ansId"></v-radio>
                            </v-radio-group>
                          </v-col>
                          <v-col>
                            <v-text-field outlined v-model="item.text"></v-text-field>
                          </v-col>
                        </v-row>
                      </v-content>
                    </v-container>
                  </v-stepper-content>
                </v-stepper-items>
              </v-stepper>
            </form>
          </v-card>
        </v-col>

        <v-col>
          <v-card fill>
            <v-card-title>Preview</v-card-title>
            <v-card-text>
              ASSUNTO: {{editedSubject}}
              <br />
              CONHECIMENTO: {{editedKnowledge}} [{{editedKnowledgePWR}}/{{editedKnowledgeBWR}}]
              <br />
              IQ: {{this.id}}
              <br />
              <br />
              {{editedQuestionDescription}}
              <br />

              <v-row justify="center" style="margin-top: 20px" v-if="this.editedImages !== '' || typeof this.editedImages !== 'undefined'">
                <img style="max-height: 180px" :src="this.editedImages">
              </v-row>

              <v-content v-if="confirmTitle">
                <v-row>
                  <v-col cols="2"></v-col>
                  <v-col v-for="(item, index) in editedAnswers[0].text" :key="index" cols="2">{{ item.title }}</v-col>
                </v-row>

                <v-row>
                  <v-col cols="2">A -</v-col>
                  <v-col
                    v-for="(item, index) in editedAnswers[0].text"
                    :key="index"
                    cols="2"
                  >{{ item.answerDescription }}</v-col>
                </v-row>
                <br />

                <v-row>
                  <v-col cols="2">B -</v-col>
                  <v-col
                    v-for="(item, index) in editedAnswers[1].text"
                    :key="index"
                    cols="2"
                  >{{ item.answerDescription }}</v-col>
                </v-row>
                <br />

                <v-row>
                  <v-col cols="2">C -</v-col>
                  <v-col
                    v-for="(item, index) in editedAnswers[2].text"
                    :key="index"
                    cols="2"
                  >{{ item.answerDescription }}</v-col>
                </v-row>
                <br />

                <v-row>
                  <v-col cols="2">D -</v-col>
                  <v-col
                    v-for="(item, index) in editedAnswers[3].text"
                    :key="index"
                    cols="2"
                  >{{ item.answerDescription }}</v-col>
                </v-row>
              </v-content>

              <v-content v-else v-for="(item, index) in editedAnswers" :key="index">
                <v-row>
                  <v-col cols="2">{{ letters[index] }} - </v-col>
                  <v-col>
                    {{ item.text }}
                  </v-col>
                </v-row>
              </v-content>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
export default {
  props: ["questions"],
  data() {
    return {
      letters: ['A','B','C','D'],
      confirmTitle: false,
      editedQuestionDescription: null,
      e1: 1,
      radios: null,
      columns: this.number,
      multipleAnswer: false,
      auxTitle: [],
      editedImages: null,
      chips: [],
      items: [],
      images: [],
      editedAnswers: [],
      editedId: null,
      editedSubject: null,
      editedKnowledge: null,
      editedKnowledgePWR: null,
      editedKnowledgeBWR: null,
      subjectItems: [
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
      number: 0
    };
  },
  computed: {
    hasImages(){
      if ( typeof this.questions.data.IMAGENS === 'undefined' || this.questions.data.IMAGENS === '')
        return false
      else
        return true
    },
    formIsValid() {
      return (
        this.editedId !== "" &&
        this.editedKnowledge !== "" &&
        this.editedKnowledgePWR !== "" &&
        this.editedKnowledgeBWR !== "" &&
        this.editedSubject !== ""
      );
    },
    id(){
      var aux = this.questions.id
      this.editedId = aux
      return aux
    }
    // editedQuestion() {
    //   var aux = this.$store.getters.findQuestionById(this.questions)
    //
    //   this.editedSubject = aux.data.DISCIPLINA
    //   this.editedKnowledge = aux.data.CONHECIMENTO
    //   this.editedKnowledgePWR = aux.data.RELEVANCIA_OR
    //   this.editedKnowledgeBWR = aux.data.RELEVANCIA_OSR
    //   this.editedAnswers = aux.data.RESPOSTAS
    //   this.editedQuestionDescription = aux.data.PERGUNTA
    //
    //   if(typeof aux.data.RESPOSTAS[0].text == "string")
    //     this.number = 1
    //   else
    //     this.number = auxdata.RESPOSTAS[0].text.length
    //
    //   if (this.number > 1) this.confirmTitle = true;
    //   else this.confirmTitle = false;
    //
    //   if(this.number>1){
    //     for(var i = 0; i < this.number; i++){
    //       this.auxTitle[i] = this.questionsdata.RESPOSTAS[0].text[i].title
    //     }
    //   }
    //
    //   this.editedAnswers.forEach( element => {
    //     if(element.value === true)
    //       this.radios = element.ansId
    //   })
    //
    //   return this.questions
    // }
  },
  watch: {
    questions(val) {
      this.editedId = val.id
    },
    editedId() {
      this.editedId = this.questions.id
      this.editedSubject = this.questions.data.DISCIPLINA
      this.editedKnowledge = this.questions.data.CONHECIMENTO
      this.editedKnowledgePWR = this.questions.data.RELEVANCIA_OR
      this.editedKnowledgeBWR = this.questions.data.RELEVANCIA_OSR
      this.editedAnswers = this.questions.data.RESPOSTAS
      this.editedQuestionDescription = this.questions.data.PERGUNTA

      if ( typeof this.questions.data.IMAGENS === 'undefined' || this.questions.data.IMAGENS === '')
        this.editedImages = ""
      else
        this.editedImages = this.questions.data.IMAGENS

      if(typeof this.questions.data.RESPOSTAS[0].text == "string")
        this.number = 1
      else
        this.number = this.questions.data.RESPOSTAS[0].text.length

      if (this.number > 1) this.confirmTitle = true;
      else this.confirmTitle = false;

      if(this.number>1){
        for(var i = 0; i < this.number; i++){
          this.auxTitle[i] = this.questions.data.RESPOSTAS[0].text[i].title
        }
      }

      this.editedAnswers.forEach( element => {
        if(element.value === true)
          this.radios = element.ansId
      })
    },
    auxTitle(val) {
      this.editedAnswers.forEach(element => {
        for (var i = 0; i < this.number; i++) {
          element.text[i].title = val[i];
        }
      })
    },
    radios(val) {
      this.editedAnswers.forEach(element => {

        if (element.ansId === val)
          element.value = true;

        else
          element.value = false;
      });
    }
  },
  methods: {
    updateData(variable) {
      this.editedQuestionDescription = variable;
    },
    onEditQuestion() {
      if ( typeof this.images[0] !== 'undefined') {
        const imageToUpload = {images: this.images[0]}
        var URL = this.$store.dispatch("uploadImage", imageToUpload)
        URL.then(result => {
          this.editedImages = result
          console.log("Image as URL: ",this.editedImages)
          const questionData = {
            id: this.editedId,
            subject: this.editedSubject,
            questionDescription: this.editedQuestionDescription,
            knowledge: this.editedKnowledge,
            knowledgePWR: this.editedKnowledgePWR,
            knowledgeBWR: this.editedKnowledgeBWR,
            answers: this.editedAnswers,
            images: this.editedImages
          };

          this.$store.dispatch("createQuestion", questionData);
          this.close();
        })
      }

      else {
        const questionData = {
          id: this.editedId,
          subject: this.editedSubject,
          questionDescription: this.editedQuestionDescription,
          knowledge: this.editedKnowledge,
          knowledgePWR: this.editedKnowledgePWR,
          knowledgeBWR: this.editedKnowledgeBWR,
          answers: this.editedAnswers,
          images: ""
        };
        this.images = []
        this.$store.dispatch("createQuestion", questionData);
        this.close();
      }
    },
    close() {
      this.$store.dispatch("loadedQuestions");
      this.$emit("closeDialogEdit");
    }
  }
};
</script>
