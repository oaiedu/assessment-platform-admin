<template>
  <v-card>
    <link rel="stylesheet" href="https://unpkg.com/katex@0.6.0/dist/katex.min.css" />
    <v-toolbar dark color="primary">
      <v-btn icon dark @click="close()">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn dark text @click="e1 = 2" v-if="e1 == 1">Continue</v-btn>
        <v-btn dark text @click="e1 = 3" v-if="e1 == 2">Continue</v-btn>
        <v-btn dark text @click="onEditQuestion()" v-if="e1 == 3">Editar Questão</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-container fluid>
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
                        <editor v-model="editedQuestionDescription" />
                      </v-row>

                      <v-row>
                        <v-file-input chips multiple label="Imagem" v-model="images" />
                      </v-row>

                      <v-main
                        v-if="this.editedImages !== '' && typeof this.editedImages !== 'undefined'"
                      >
                        <v-row justify="center">
                          <v-radio-group v-model="editedImageSize" row>
                            <v-radio label="1x" value="1x"></v-radio>
                            <v-radio label="2x" value="2x"></v-radio>
                            <v-radio label="3x" value="3x"></v-radio>
                          </v-radio-group>
                        </v-row>
                      </v-main>
                    </v-container>
                  </v-stepper-content>

                  <v-stepper-content step="3">
                    <v-container>
                      <v-main v-if="confirmTitle">
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
                      </v-main>

                      <v-main v-else>
                        <v-row v-for="(item, index) in editedAnswers" :key="index">
                          <v-col cols="12" md="1" sm="1" xs="1">
                            <v-radio-group v-model="radios">
                              <v-radio :value="editedAnswers[index].ansId"></v-radio>
                            </v-radio-group>
                          </v-col>
                          <v-col>
                            <v-text-field outlined v-model="editedAnswers[index].text"></v-text-field>
                          </v-col>
                        </v-row>
                      </v-main>
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
              DISCIPLINA: {{editedSubject}}
              <br />
              CONHECIMENTO: {{editedKnowledge}} [{{editedKnowledgePWR}}/{{editedKnowledgeBWR}}]
              <br />
              IQ: {{ id }}
              <br />
              <br />
              <vue-markdown :source="editedQuestionDescription" />
              <br />

              <v-row
                justify="center"
                style="margin-top: 20px"
                v-if="this.editedImages !== '' && typeof this.editedImages !== 'undefined'"
              >
                <img style="max-height: 250px; max-width: 180px" :src="this.editedImages" />
              </v-row>

              <v-main v-if="confirmTitle">
                <v-row>
                  <v-col cols="2"></v-col>
                  <v-col v-for="(item, index) in editedAnswers[0].text" :key="index" cols="2">
                    <vue-markdown :source="item.title" />
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="2">A -</v-col>
                  <v-col v-for="(item, index) in editedAnswers[0].text" :key="index" cols="2">
                    <vue-markdown :source="item.answerDescription" />
                  </v-col>
                </v-row>
                <br />

                <v-row>
                  <v-col cols="2">B -</v-col>
                  <v-col v-for="(item, index) in editedAnswers[1].text" :key="index" cols="2">
                    <vue-markdown :source="item.answerDescription" />
                  </v-col>
                </v-row>
                <br />

                <v-row>
                  <v-col cols="2">C -</v-col>
                  <v-col v-for="(item, index) in editedAnswers[2].text" :key="index" cols="2">
                    <vue-markdown :source="item.answerDescription" />
                  </v-col>
                </v-row>
                <br />

                <v-row>
                  <v-col cols="2">D -</v-col>
                  <v-col v-for="(item, index) in editedAnswers[3].text" :key="index" cols="2">
                    <vue-markdown :source="item.answerDescription" />
                  </v-col>
                </v-row>
              </v-main>

              <v-main v-else>
                <v-row v-for="(item, index) in editedAnswers" :key="index">
                  <v-col cols="1">{{ letters[index] }} -</v-col>
                  <v-col>
                    <vue-markdown :source="item.text" />
                  </v-col>
                </v-row>
              </v-main>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import { Editor } from "@toast-ui/vue-editor";
import VueMarkdown from "vue-markdown";
require("vue-markdown");

export default {
  components: {
    Editor,
    "vue-markdown": VueMarkdown
  },
  props: ["question"],
  data() {
    return {
      letters: ["A", "B", "C", "D"],
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
      editedIq: null,
      editedSubject: null,
      editedKnowledge: null,
      editedKnowledgePWR: null,
      editedImageSize: null,
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
    hasImages() {
      if (
        typeof this.question.image === "undefined" ||
        this.question.image === ""
      )
        return false;
      else return true;
    },
    formIsValid() {
      return (
        this.editedIq !== "" &&
        this.editedKnowledge !== "" &&
        this.editedKnowledgePWR !== "" &&
        this.editedKnowledgeBWR !== "" &&
        this.editedSubject !== ""
      );
    },
    id() {
      var aux = this.question.iq;
      this.editedIq = aux;
      return aux;
    }
  },
  watch: {
    editedIq() {
      this.update();
    },
    auxTitle(val) {
      if (this.confirmTitle) {
        this.editedAnswers.forEach(element => {
          for (var i = 0; i < this.number; i++) {
            element.text[i].title = val[i];
          }
        });
      }
    },
    radios(val) {
      this.editedAnswers.forEach(element => {
        if (element.ansId === val) element.value = true;
        else element.value = false;
      });
    }
  },
  methods: {
    update() {
      console.log("AAAAAAAAA");
      this.editedIq = this.question.id;
      this.editedSubject = this.question.subject;
      this.editedKnowledge = this.question.knowledge;
      this.editedKnowledgePWR = this.question.knowledgePWR;
      this.editedKnowledgeBWR = this.question.knowledgeBWR;
      this.editedImageSize = this.question.imageSize;
      this.editedAnswers = JSON.parse(
        JSON.stringify(this.question.answers)
      );
      this.editedQuestionDescription = this.question.question;

      if (
        typeof this.question.image === "undefined" ||
        this.question.image === ""
      )
        this.editedImages = "";
      else this.editedImages = this.question.image;

      if (typeof this.question.answers[0].text == "string")
        this.number = 1;
      else this.number = this.question.answers[0].text.length;

      if (this.number > 1) this.confirmTitle = true;
      else this.confirmTitle = false;

      if (this.number > 1) {
        for (var i = 0; i < this.number; i++) {
          this.auxTitle[i] = this.question.answers[0].text[i].title;
        }
      }

      this.editedAnswers.forEach(element => {
        if (element.value === true) this.radios = element.ansId;
      });
    },
    updateData(variable) {
      this.editedQuestionDescription = variable;
    },
    onEditQuestion() {
      if (typeof this.images[0] !== "undefined") {
        const imageToUpload = { images: this.images[0], id: this.question.id };
        var URL = this.$store.dispatch("uploadImageQuestion", imageToUpload);
        URL.then(result => {
          this.editedImages = result;
          console.log("Image as URL: ", this.editedImages);
          if (this.question.imageSize === undefined) {
            var oldData = {
              iq: this.question.iq,
              subject: this.question.subject,
              questionDescription: this.question.question,
              knowledge: this.question.knowledge,
              knowledgePWR: this.question.knowledgePWR,
              knowledgeBWR: this.question.knowledgeBWR,
              answers: this.question.answers,
              images: this.question.image,
              edited: this.question.edited,
              imageSize: "1x"
            };
          }
          else {
            var oldData = {
              iq: this.question.iq,
              subject: this.question.subject,
              questionDescription: this.question.question,
              knowledge: this.question.knowledge,
              knowledgePWR: this.question.knowledgePWR,
              knowledgeBWR: this.question.knowledgeBWR,
              answers: this.question.answers,
              images: this.question.image,
              edited: this.question.edited,
              imageSize: this.question.imageSize,
            };
          }
          var questionData = {
            iq: this.editedIq,
            subject: this.editedSubject,
            questionDescription: this.editedQuestionDescription,
            knowledge: this.editedKnowledge,
            knowledgePWR: this.editedKnowledgePWR,
            knowledgeBWR: this.editedKnowledgeBWR,
            answers: this.editedAnswers,
            images: this.editedImages,
            imageSize: this.editedImageSize
          };
          var sendInfo = {
            oldData: {},
            questionData: {},
            user: ""
          };
          sendInfo.oldData = oldData;
          sendInfo.questionData = questionData;
          sendInfo.user = this.$store.getters.user.id;
          var storeAux = this.$store.dispatch("editQuestion", sendInfo);
          storeAux.then(() => {
            this.close();
          });
        });
      } else {
        var oldData = {
          iq: this.question.iq,
          subject: this.question.subject,
          questionDescription: this.question.question,
          knowledge: this.question.knowledge,
          knowledgePWR: this.question.knowledgePWR,
          knowledgeBWR: this.question.knowledgeBWR,
          answers: this.question.answers,
          images: this.question.image,
          edited: this.question.edited,
          imageSize: this.question.imageSize
        };
        var questionData = {
          id: this.editedIq,
          subject: this.editedSubject,
          questionDescription: this.editedQuestionDescription,
          knowledge: this.editedKnowledge,
          knowledgePWR: this.editedKnowledgePWR,
          knowledgeBWR: this.editedKnowledgeBWR,
          answers: this.editedAnswers,
          imageSize: this.editedImageSize,
          images: this.question.image
        };
        var sendInfo = {
          oldData: {},
          questionData: {},
          user: ""
        };
        sendInfo.oldData = oldData;
        sendInfo.questionData = questionData;
        sendInfo.user = this.$store.getters.user.id;
        var storeAux = this.$store.dispatch("editQuestion", sendInfo);
        storeAux.then(() => {
          this.close();
        });
      }
    },
    setInitialData() {
      this.confirmTitle = false;
      this.editedQuestionDescription = null;
      this.e1 = 1;
      this.radios = null;
      this.columns = this.number;
      this.multipleAnswer = false;
      this.auxTitle = [];
      this.editedImages = null;
      this.chips = [];
      this.items = [];
      this.images = [];
      this.editedAnswers = [];
      this.editedIq = null;
      this.editedSubject = null;
      this.editedKnowledge = null;
      this.editedKnowledgePWR = null;
      this.editedKnowledgeBWR = null;
      this.editedImageSize = null;
      this.number = 0;
    },
    close() {
      this.setInitialData();
      this.$emit("closeDialogEdit");
    }
  }
};
</script>
