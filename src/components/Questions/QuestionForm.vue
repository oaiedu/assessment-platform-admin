<template>
  <v-card>
    <link
      rel="preload"
      as="style"
      type="text/css"
      onload="this.rel = 'stylesheet'"
      href="https://unpkg.com/katex@0.6.0/dist/katex.min.css"
    />
    <v-toolbar dark color="primary">
      <v-btn icon dark @click="close()" class="mr-2">
        <v-icon>{{ mdiClose }}</v-icon>
      </v-btn>
      <h2>Criar nova questão</h2>
      <v-spacer></v-spacer>
    </v-toolbar>

    <v-tooltip right v-if="e1 > 1">
      <template v-slot:activator="{ on }">
        <v-btn
          color="grey lighten-3"
          v-on="on"
          dark
          fab
          fixed
          bottom
          left
          @click="e1 = e1 - 1"
        >
          <v-icon color="blue darken-1">{{ mdiArrowLeft }}</v-icon>
        </v-btn>
      </template>
      <span>Voltar</span>
    </v-tooltip>

    <v-tooltip left v-if="e1 < 2">
      <template v-slot:activator="{ on }">
        <v-btn
          color="blue darken-1"
          class="mr-4"
          v-on="on"
          dark
          fab
          fixed
          bottom
          right
          @click="e1 = 2"
        >
          <v-icon color="white">{{ mdiArrowRight }}</v-icon>
        </v-btn>
      </template>
      <span>Continuar</span>
    </v-tooltip>

    <v-tooltip left v-else>
      <template v-slot:activator="{ on }">
        <v-btn
          color="blue darken-1"
          class="mr-4"
          v-on="on"
          dark
          fab
          fixed
          bottom
          right
          :loading="loading"
          @click="onCreateQuestion()"
        >
          <v-icon color="white">{{ mdiContentSave }}</v-icon>
        </v-btn>
      </template>
      <span>Salvar</span>
    </v-tooltip>

    <v-container fluid>
      <v-row>
        <v-col>
          <v-card>
            <form @submit.prevent="onCreateQuestion">
              <v-stepper alt-labels v-model="e1">
                <v-stepper-header>
                  <v-stepper-step editable :complete="e1 > 1" step="1">
                    Detalhes
                  </v-stepper-step>

                  <v-divider></v-divider>

                  <v-stepper-step editable step="2">
                    Respostas
                  </v-stepper-step>
                </v-stepper-header>

                <v-stepper-items>
                  <v-stepper-content step="1">
                    <v-container>
                      <v-row>
                        <v-col>
                          <v-text-field
                            name="name"
                            label="Nome"
                            id="name"
                            v-model="name"
                            required
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row>
                        <v-col>
                          <v-select
                            :items="subjectItems.map(s => s.name)"
                            name="subject"
                            id="subject"
                            v-model="subject"
                            label="Disciplina"
                            solo
                          ></v-select>
                        </v-col>
                      </v-row>

                      <v-row justify="center">
                        <v-col cols="12">
                          <VueSimplemde v-model="questionDescription" />
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
                            accept="image/png, image/jpeg, image/bmp"
                          />
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

                  <v-stepper-content step="2">
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
                            <v-icon dark>{{ mdiPlus }}</v-icon>
                          </v-btn>

                          <v-btn
                            @click="decreaseColumns"
                            class="mx-2"
                            fab
                            dark
                            x-small
                            color="primary"
                          >
                            <v-icon dark>{{ mdiMinus }}</v-icon>
                          </v-btn>
                        </v-container>
                      </v-row>

                      <v-main v-if="confirmTitle">
                        <v-row justify="end">
                          <v-col cols="1"></v-col>
                          <v-col v-for="i in number" :key="i">
                            <v-text-field
                              outlined
                              v-model="auxTitle[i - 1]"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                        <v-row v-for="(item, index) in answers" :key="index">
                          <v-col cols="12" md="1" sm="1" xs="1">
                            <v-radio-group v-model="radios">
                              <v-radio :value="item.ansId"></v-radio>
                            </v-radio-group>
                          </v-col>
                          <v-col
                            v-for="(answerItem, index) in item.text"
                            :key="index"
                          >
                            <v-text-field
                              v-if="answerItem"
                              outlined
                              v-model="answerItem.answerDescription"
                            ></v-text-field>
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
                            <v-text-field
                              outlined
                              v-model="item.text"
                            ></v-text-field>
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
          <Preview
            :name="name"
            :subject="subject"
            :questionDesc="questionDescription"
            :answers="answers"
            :image="imagePreview"
          />
        </v-col>
      </v-row>

      <v-snackbar
        v-model="createErrorSnackBar"
        light
        color="red darken-2"
        right
        top
        vertical
        :timeout="15000"
      >
        <span style="color: white; font-size: 1rem">
          Uma questão com este Nome já foi criada!
          <br />
          Por favor, mude o Nome.
        </span>
        <template v-slot:action="{ attrs }">
          <v-btn
            dark
            color="white"
            text
            v-bind="attrs"
            @click="createErrorSnackBar = false"
          >
            Fechar
          </v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </v-card>
</template>

<script>
import "simplemde/dist/simplemde.min.css";
import VueSimplemde from "vue-simplemde";
import {
  mdiClose,
  mdiPlus,
  mdiMinus,
  mdiArrowLeft,
  mdiArrowRight,
  mdiContentSave
} from "@mdi/js";
import Preview from "./Preview";

export default {
  name: "QuestionForm",
  components: {
    Preview,
    VueSimplemde
  },
  props: ["questionRequest", "page"],
  data() {
    return {
      mdiClose,
      mdiPlus,
      mdiMinus,
      mdiArrowLeft,
      mdiArrowRight,
      mdiContentSave,
      imagePreview: "",
      images: [],
      imagesAsURL: "",
      imageSize: "1x",
      confirmTitle: false,
      questionDescription: "",
      createErrorSnackBar: false,
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
      name: "",
      subject: "",
      number: 1
    };
  },
  computed: {
    formIsValid() {
      return this.name !== "" && this.subject !== "";
    },
    userClaims() {
      return this.$store.getters.getUserClaims;
    },
    userInfo() {
      return this.$store.getters.userInfo;
    },
    subjectItems() {
      return this.$store.state.Subject.subjects;
    },
    loading() {
      return this.$store.getters.loading;
    }
  },
  watch: {
    number(val, oldVal) {
      if (val > 1) {
        this.answers.forEach(element => {
          const aux = [];
          for (let i = 0; i < val; i++) {
            if (element.text || element.text[i]) {
              const text =
                element.text[i] && element.text[i].answerDescription
                  ? element.text[i].answerDescription
                  : i === 0 && oldVal === 1
                  ? element.text
                  : "";
              const title =
                element.text[i] && element.text[i].title
                  ? element.text[i].title
                  : "";
              aux.push({
                title: title || this.auxTitle[i] || "",
                answerDescription: text || ""
              });
            } else {
              aux.push({ title: "", answerDescription: "" });
            }
          }
          element.text = aux;
        });

        this.confirmTitle = true;
      } else {
        this.answers.forEach(element => {
          element.text =
            element.text && element.text[0]
              ? element.text[0].answerDescription
              : "";
        });
        this.confirmTitle = false;
      }
    },
    auxTitle(val) {
      if (this.auxTitle.length > 0) {
        this.answers.forEach(element => {
          for (let i = 0; i < this.number; i++) {
            element.text[i].title = this.auxTitle[i];
          }
        });
      }
    },
    radios(val) {
      this.answers.forEach(element => {
        element.value = element.ansId === val;
      });
    }
  },
  methods: {
    decreaseColumns() {
      if (this.number > 1) {
        this.number--;
      }
    },
    increaseColumns() {
      if (this.number < 5) {
        this.number++;
      }
    },
    updateData(variable) {
      this.questionDescription = variable;
    },
    onCreateQuestion() {
      this.$store.dispatch("questionExists", this.name).then(exist => {
        if (exist) {
          this.createErrorSnackBar = true;
        } else {
          if (this.images && this.images[0]) {
            const imageToUpload = { name: this.name, image: this.images[0] };
            const URL = this.$store.dispatch(
              "uploadImageQuestion",
              imageToUpload
            );

            URL.then(result => {
              this.imagesAsURL = result;
              const questionData = {
                name: this.name.toUpperCase(),
                subject: this.subject,
                question: this.questionDescription,
                answers: this.answers,
                image: this.imagesAsURL,
                imageSize: this.imageSize
              };

              let aux = null;

              if (this.userClaims && this.userClaims["admin"]) {
                aux = this.$store.dispatch("createQuestion", {
                  question: questionData
                });
              } else {
                aux = this.$store.dispatch("createQuestionRequest", {
                  request: {
                    ...questionData,
                    userId: this.userInfo.id,
                    status: "Pendente"
                  },
                  user: this.userInfo
                });
              }

              aux.then(() => {
                this.setInitialData();
                this.close();
              });
            });
          } else {
            const questionData = {
              name: this.name.toUpperCase(),
              subject: this.subject,
              question: this.questionDescription,
              answers: this.answers,
              image: "",
              imageSize: this.imageSize
            };

            let aux = null;

            if (this.userClaims && this.userClaims["admin"]) {
              aux = this.$store.dispatch("createQuestion", {
                question: questionData,
                page: this.page
              });
            } else {
              aux = this.$store.dispatch("createQuestionRequest", {
                request: {
                  ...questionData,
                  userId: this.userInfo.id,
                  status: "Pendente"
                },
                user: this.userInfo
              });
            }

            aux.then(() => {
              this.setInitialData();
              this.close();
            });
          }
        }
      });
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
      this.name = "";
      this.subject = "";
      this.number = 0;
      this.images = [];
      this.imagesAsBase64 = "";
    },
    checkImageType(event) {
      if (event && event[0] && event[0].type) {
        if (!event[0].type.match(/image.*/)) {
          this.$store.commit("setError", {
            message: "O arquivo inserido NÃO é uma imagem!"
          });
          this.images = [];
        } else if (event[0].size > 2000000) {
          this.$store.commit("setError", {
            message: "O tamanho da imagem deve ser no MÁXIMO 2 MB!"
          });
          this.images = [];
        } else {
          const file = event[0];
          const reader = new FileReader();

          reader.onload = readerEvent => {
            this.imagePreview = readerEvent.target.result;
          };

          reader.readAsDataURL(file);
        }
      } else if (this.imagePreview && this.imagePreview !== "") {
        this.imagePreview = "";
      }
    },
    close() {
      this.setInitialData();
      this.$emit("closeDialogNew");
    }
  }
};
</script>

<style>
.answer-block {
  margin: 0 !important;
}

.answer-block .col {
  padding: 0 10px 0 10px !important;
}
</style>
