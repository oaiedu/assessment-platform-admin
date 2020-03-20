
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
                        <v-text-field name="id" label="IQ" id="id" v-model="id" required></v-text-field>
                      </v-row>

                      <v-row>
                        <v-text-field
                          name="knowledge"
                          label="Conhecimento"
                          id="knowledge"
                          v-model="knowledge"
                          required
                        ></v-text-field>
                      </v-row>

                      <v-row>
                        <v-text-field
                          name="knowledgePWR"
                          label="Relevância OR"
                          id="knowledgePWR"
                          v-model="knowledgePWR"
                          required
                        ></v-text-field>
                      </v-row>

                      <v-row>
                        <v-text-field
                          name="knowledgeBWR"
                          label="Relevância OSR"
                          id="knowledgeBWR"
                          v-model="knowledgeBWR"
                          required
                        ></v-text-field>
                      </v-row>

                      <v-row>
                        <v-select
                          :items="subjectItems"
                          name="subject"
                          id="subject"
                          v-model="subject"
                          label="Disciplina"
                          solo
                        ></v-select>
                      </v-row>
                    </v-container>
                  </v-stepper-content>

                  <v-stepper-content step="2">
                    <v-container>
                      <v-row>
                        <Combined @inputData="updateData"></Combined>
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

                      <v-content v-if="confirmTitle">
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
                      </v-content>

                      <v-content v-else>
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
              DISCIPLINA: {{subject}}
              <br />
              CONHECIMENTO: {{knowledge}} [{{knowledgePWR}}/{{knowledgeBWR}}]
              <br />
              IQ: {{id}}
              <br />

              <br/>
                {{questionDescription}}
              <br/>

              <v-content v-if="confirmTitle">
                <v-row>
                  <v-col cols="2"></v-col>
                  <v-col v-for="(item, index) in answers[0].text" :key="index" cols="2">{{ item.title }}</v-col>
                </v-row>

                <v-row>
                  <v-col cols="2">A -</v-col>
                  <v-col
                    v-for="(item, index) in answers[0].text"
                    :key="index"
                    cols="2"
                  >{{ item.answerDescription }}</v-col>
                </v-row>
                <br />

                <v-row>
                  <v-col cols="2">B -</v-col>
                  <v-col
                    v-for="(item, index) in answers[1].text"
                    :key="index"
                    cols="2"
                  >{{ item.answerDescription }}</v-col>
                </v-row>
                <br />

                <v-row>
                  <v-col cols="2">C -</v-col>
                  <v-col
                    v-for="(item, index) in answers[2].text"
                    :key="index"
                    cols="2"
                  >{{ item.answerDescription }}</v-col>
                </v-row>
                <br />

                <v-row>
                  <v-col cols="2">D -</v-col>
                  <v-col
                    v-for="(item, index) in answers[3].text"
                    :key="index"
                    cols="2"
                  >{{ item.answerDescription }}</v-col>
                </v-row>
              </v-content>

              <v-content v-else>
                <v-row v-for="(item, index) in answers" :key="index">
                  <v-col cols="1">{{ letters[index] }} - </v-col>
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
import "tui-editor/dist/tui-editor.css";
import "tui-editor/dist/tui-editor-contents.css";
import "codemirror/lib/codemirror.css";
import { Viewer } from "@toast-ui/vue-editor";

export default {
  components: {'viewer': Viewer},
  data() {
    return {
      letters: ['A','B','C','D'],
      images: [],
      imagesAsURL: "",
      confirmTitle: false,
      questionDescription: "",
      e1: 1,
      test: null,
      columns: null,
      radios: '',
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
      id: "",
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
        this.id !== "" &&
        this.knowledge !== "" &&
        this.knowledgePWR !== "" &&
        this.knowledgeBWR !== "" &&
        this.subject !== ""
      );
    }
  },
  watch: {
    e1(val){
      console.log(val)
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
      }
      else {
        this.answers.forEach(element => {
          element.text = ""
        })
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
      console.log("1");
      this.answers.forEach(element => {
        console.log("2");

        if (element.ansId === val) {
          console.log("3");

          element.value = true;
        } else {
          console.log("4");

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
      console.log("value: ", this.answers[1].value)

    if ( typeof this.images[0] !== 'undefined') {
      const imageToUpload = {images: this.images[0]}
      var URL = this.$store.dispatch("uploadImage", imageToUpload)
      URL.then(result => {
        this.imagesAsURL = result
        console.log("Image as URL: ",this.imagesAsURL)
        const questionData = {
          id: this.id,
          subject: this.subject,
          questionDescription: this.questionDescription,
          knowledge: this.knowledge,
          knowledgePWR: this.knowledgePWR,
          knowledgeBWR: this.knowledgeBWR,
          answers: this.answers,
          images: this.imagesAsURL
        };

        let aux = this.$store.dispatch("createQuestion", questionData);
        aux.then(()=>{
          this.$emit("load");
          this.setInitialData();
          this.close();
        })
      })
    }

    else {
      const questionData = {
        id: this.id,
        subject: this.subject,
        questionDescription: this.questionDescription,
        knowledge: this.knowledge,
        knowledgePWR: this.knowledgePWR,
        knowledgeBWR: this.knowledgeBWR,
        answers: this.answers,
        images: ""
      };

      let aux = this.$store.dispatch("createQuestion", questionData);
      aux.then(()=>{
        this.$emit("load");
        this.setInitialData();
        this.close();
      })
    }

      // var reader = new FileReader();
      // reader.readAsDataURL(this.images[0]);
      // reader.onload = ()=> {
      //   this.imagesAsBase64 = reader.result
      //   console.log("Imagem dentro da Promisse: ",this.imagesAsBase64)
      //   this.sendToStore()
      // };
      // reader.onerror = function (error) {
      //   console.log('Error: ', error);
      // };
    },
    setInitialData() {
      this.confirmTitle = false;
      this.questionDescription = "";
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
      this.id = "";
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
      this.imagesAsBase64 = ""
    },
    close() {
      this.setInitialData();
      this.$emit("closeDialogNew");
    }
  }
};
</script>
