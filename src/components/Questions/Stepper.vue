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
        <v-btn dark text @click="onCreateQuestion()" v-if="e1 == 3">Criar Questão</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-container fluid>
      <v-row>
        <v-col>
          <v-card>
            <form @submit.prevent="onCreateQuestion">
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
                        <v-col>
                          <v-text-field name="iq" label="IQ" id="iq" v-model="iq" required></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row>
                        <v-col>
                          <v-text-field
                            name="knowledge"
                            label="Conhecimento"
                            id="knowledge"
                            v-model="knowledge"
                            required
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row>
                        <v-col>
                          <v-text-field
                            name="knowledgePWR"
                            label="Relevância OR"
                            id="knowledgePWR"
                            v-model="knowledgePWR"
                            required
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row>
                        <v-col>
                          <v-text-field
                            name="knowledgeBWR"
                            label="Relevância OSR"
                            id="knowledgeBWR"
                            v-model="knowledgeBWR"
                            required
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row>
                        <v-col>
                          <v-select
                            :items="subjectItems"
                            name="subject"
                            id="subject"
                            v-model="subject"
                            label="Disciplina"
                            solo
                          ></v-select>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-stepper-content>

                  <v-stepper-content step="2">
                    <v-container>
                      <v-row justify="center">
                        <v-col cols="12">
                          <editor v-model="questionDescription" />
                        </v-col>
                      </v-row>
                      <v-row justify="center">
                        <v-col cols="12">
                          <v-file-input
                            chips
                            clearable
                            multiple
                            label="Imagem"
                            placeholder="Escolha uma imagem"
                            v-model="images"
                            @change="checkImageType"
                            accept='image/png, image/jpeg, image/bmp' />
                        </v-col>
                      </v-row>
                      <v-main v-if="images && images.length != 0">
                        <v-row justify="center">
                          <v-radio-group v-model="imageSize" row>
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
                      <v-row>
                        <v-container>
                          Colunas
                          <v-btn
                            @click="increaseColumns"
                            class="mx-2"
                            fab
                            dark
                            x-small
                            color="primary"
                          >
                            <v-icon dark>mdi-plus</v-icon>
                          </v-btn>

                          <v-btn
                            @click="decreaseColumns"
                            class="mx-2"
                            fab
                            dark
                            x-small
                            color="primary"
                          >
                            <v-icon dark>mdi-minus</v-icon>
                          </v-btn>
                        </v-container>
                      </v-row>

                      <v-main v-if="confirmTitle">
                        <v-row justify="end">
                          <v-col cols="1"></v-col>
                          <v-col v-for="i in number" :key="i">
                            <v-text-field outlined v-model="auxTitle[i-1]"></v-text-field>
                          </v-col>
                        </v-row>
                        <v-row v-for="(item, index) in answers" :key="index">
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
                        <v-row v-for="(item, index) in answers" :key="index">
                          <v-col cols="12" md="1" sm="1" xs="1">
                            <v-radio-group v-model="radios">
                              <v-radio :value="item.ansId"></v-radio>
                            </v-radio-group>
                          </v-col>
                          <v-col>
                            <v-text-field outlined v-model="item.text"></v-text-field>
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
              DISCIPLINA: {{ subject }}
              <br />
              CONHECIMENTO: {{ knowledge }} [{{ knowledgePWR }}/{{ knowledgeBWR }}]
              <br />
              IQ: {{ iq }}
              <br />

              <br />
              <vue-markdown :source="questionDescription" />
              <br />

              <v-content v-if="confirmTitle">
                <v-row>
                  <v-col cols="2"></v-col>
                  <v-col v-for="(item, index) in answers[0].text" :key="index" cols="2">
                    <vue-markdown :source="item.title" />
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="2">A -</v-col>
                  <v-col v-for="(item, index) in answers[0].text" :key="index" cols="2">
                    <vue-markdown :source="item.answerDescription" />
                  </v-col>
                </v-row>
                <br />

                <v-row>
                  <v-col cols="2">B -</v-col>
                  <v-col v-for="(item, index) in answers[1].text" :key="index" cols="2">
                    <vue-markdown :source="item.answerDescription" />
                  </v-col>
                </v-row>
                <br />

                <v-row>
                  <v-col cols="2">C -</v-col>
                  <v-col v-for="(item, index) in answers[2].text" :key="index" cols="2">
                    <vue-markdown :source="item.answerDescription" />
                  </v-col>
                </v-row>
                <br />

                <v-row>
                  <v-col cols="2">D -</v-col>
                  <v-col v-for="(item, index) in answers[3].text" :key="index" cols="2">
                    <vue-markdown :source="item.answerDescription" />
                  </v-col>
                </v-row>
              </v-content>

              <v-main v-else>
                <v-row v-for="(item, index) in answers" :key="index">
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
    props: ['questionRequest'],
    data() {
        return {
            letters: ["A", "B", "C", "D"],
            images: [],
            imagesAsURL: "",
            imageSize: "1x",
            confirmTitle: false,
            questionDescription: "",
            e1: 1,
            test: null,
            columns: null,
            radios: "",
            multipleAnswer: false,
            auxTitle: [],
            chips: [],
            items: [],
            answers: [
                { text: "", ansId: "radio-1", value: false },
                { text: "", ansId: "radio-2", value: false },
                { text: "", ansId: "radio-3", value: false },
                { text: "", ansId: "radio-4", value: false }
            ],
            iq: "",
            subject: "",
            knowledge: "",
            knowledgePWR: "",
            knowledgeBWR: "",
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
            number: 1
        };
    },
    computed: {
        formIsValid() {
            return (
                this.iq !== "" &&
                this.knowledge !== "" &&
                this.knowledgePWR !== "" &&
                this.knowledgeBWR !== "" &&
                this.subject !== ""
            );
        },
        userClaims() {
            return this.$store.getters.getUserClaims;
        },
        userInfo() {
            return this.$store.getters.userInfo;
        }
    },
    watch: {
        e1(val) {
            console.log(val);
        },
        images(val) {
            console.log("images: ", val.length);
        },
        number(val) {
            if (this.number > 1) {
            this.answers.forEach(element => {
                let aux = [];
                for (var i = 0; i < this.number; i++) {
                    aux.push({ title: "", answerDescription: "" });
                }
                element.text = aux;
            });
            this.confirmTitle = true;
            } else {
                this.answers.forEach(element => {
                    element.text = "";
                });
                this.confirmTitle = false;
            }
        },
        auxTitle(val) {
            this.answers.forEach(element => {
                for (var i = 0; i < this.number; i++) {
                    element.text[i].title = this.auxTitle[i];
                }
            });
        },
        radios(val) {
            this.answers.forEach(element => {
                if (element.ansId === val) {
                    element.value = true;
                } else {
                    element.value = false;
                }
            });
        }
    },
    methods: {
        decreaseColumns() {
            if (this.number > 1) this.number--;
        },
        increaseColumns() {
            if (this.number < 5) this.number++;
        },
        updateData(variable) {
            this.questionDescription = variable;
        },
        onCreateQuestion() {
            console.log("value: ", this.answers[1].value);

            if (this.images && this.images[0]) {
                const imageToUpload = { id: this.iq, images: this.images[0] };
                var URL = this.$store.dispatch("uploadImageQuestion", imageToUpload);
                URL.then(result => {
                    this.imagesAsURL = result;
                    const questionData = {
                        iq: this.iq,
                        subject: this.subject,
                        question: this.questionDescription,
                        knowledge: this.knowledge,
                        knowledgePWR: this.knowledgePWR,
                        knowledgeBWR: this.knowledgeBWR,
                        answers: this.answers,
                        image: this.imagesAsURL,
                        imageSize: this.imageSize,
                    };

                    let aux = null;

                    if(this.userClaims['admin']) {
                        aux = this.$store.dispatch("createQuestion", questionData);
                    } else {
                        aux = this.$store.dispatch('createQuestionRequest', {
                            ...questionData,
                            name: userInfo.name,
                            email: userInfo.email,
                            status: 'Pendente'
                        });
                    }

                    aux.then(() => {
                        this.setInitialData();
                        this.close();
                    });
                });
            } else {
                const questionData = {
                    iq: this.iq,
                    subject: this.subject,
                    question: this.questionDescription,
                    knowledge: this.knowledge,
                    knowledgePWR: this.knowledgePWR,
                    knowledgeBWR: this.knowledgeBWR,
                    answers: this.answers,
                    image: "",
                    imageSize: this.imageSize,
                };

                let aux = null;

                if(this.userClaims['admin']) {
                        aux = this.$store.dispatch("createQuestion", questionData);
                } else {
                    aux = this.$store.dispatch('createQuestionRequest', {
                        ...questionData,
                        name: this.userInfo.name,
                        email: this.userInfo.email,
                        status: 'Pendente'
                    });
                }

                aux.then(() => {
                    this.setInitialData();
                    this.close();
                });
            }
        },
        setInitialData() {
            this.confirmTitle = false;
            this.questionDescription = "";
            this.imageSize = "1x";
            this.e1 = 1;
            this.test = null;
            this.columns = null;
            this.radios = "aaaa";
            this.multipleAnswer = false;
            this.auxTitle = [];
            this.chips = [];
            this.items = [];
            this.answers = [
                { text: [], ansId: "radio-1", value: false },
                { text: [], ansId: "radio-2", value: false },
                { text: [], ansId: "radio-3", value: false },
                { text: [], ansId: "radio-4", value: false }
            ];
            this.iq = "";
            this.subject = "";
            this.knowledge = "";
            this.knowledgePWR = "";
            this.knowledgeBWR = "";
            this.subjectItems = [
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
            ];
            this.number = 0;
            this.images = [];
            this.imagesAsBase64 = "";
        },
        checkImageType(event) {
            if(event && event[0] && event[0].type) {
                if(!event[0].type.match(/image.*/)) {
                    alert('O arquivo inserido NÃO é uma imagem!');
                    this.images = [];
                } else if (event[0].size > 2000000) {
                    alert('O tamanho da imagem deve ser no MÁXIMO 2 MB!');
                    this.images = [];
                }
            }
        },
        close() {
            this.setInitialData();
            this.$emit("closeDialogNew");
        }
    }
};
</script>
