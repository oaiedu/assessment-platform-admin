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
      <h2>Editar questão - {{ name }}</h2>
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
          @click="onEditQuestion()"
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
            <form @submit.prevent="onEditQuestion">
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
                        <v-select
                          :items="subjectItems.map(s => s.name)"
                          name="subject"
                          id="subject"
                          v-model="editedSubject"
                          label="Disciplina"
                          solo
                        ></v-select>
                      </v-row>

                      <v-row>
                        <VueSimplemde v-model="editedQuestionDescription" />
                      </v-row>

                      <v-row>
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
                      </v-row>

                      <v-main v-if="editedImages">
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

                  <v-stepper-content step="2">
                    <v-container>
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
                        <v-row
                          v-for="(item, index) in editedAnswers"
                          :key="index"
                        >
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
                        <v-row
                          v-for="(item, index) in editedAnswers"
                          :key="index"
                        >
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
            :subject="editedSubject"
            :questionDesc="editedQuestionDescription"
            :answers="editedAnswers"
            :image="imagePreview"
          />
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import "simplemde/dist/simplemde.min.css";
import VueSimplemde from "vue-simplemde";
import { mdiClose, mdiArrowLeft, mdiArrowRight, mdiContentSave } from "@mdi/js";
import Preview from "./Preview";

export default {
  components: {
    VueSimplemde,
    Preview
  },
  props: ["question", "userClaims", "userInfo", "isSearching"],
  data() {
    return {
      mdiClose,
      mdiArrowLeft,
      mdiArrowRight,
      mdiContentSave,
      imagePreview: "",
      letters: ["A", "B", "C", "D"],
      confirmTitle: false,
      editedQuestionDescription: "",
      e1: 1,
      radios: null,
      columns: this.number,
      multipleAnswer: false,
      auxTitle: [],
      editedImages: null,
      chips: [],
      items: [],
      images: [],
      editedAnswers: [
        { text: "", ansId: "radio-1", value: false },
        { text: "", ansId: "radio-2", value: false },
        { text: "", ansId: "radio-3", value: false },
        { text: "", ansId: "radio-4", value: false }
      ],
      editedName: null,
      editedSubject: null,
      editedImageSize: null,
      number: 0,
      dialogState: false
    };
  },
  computed: {
    hasImages() {
      return !!this.question.image;
    },
    formIsValid() {
      return this.editedName !== "" && this.editedSubject !== "";
    },
    name() {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.editedName = this.question.name;
      return this.question.name;
    },
    subjectItems() {
      return this.$store.state.Subject.subjects;
    },
    loading() {
      return this.$store.getters.loading;
    }
  },
  watch: {
    editedName(value) {
      if (value) this.update();
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
      this.editedName = this.question.name;
      this.editedSubject = this.question.subject;
      this.editedImageSize = this.question.imageSize;
      this.editedAnswers = JSON.parse(JSON.stringify(this.question.answers));
      this.editedQuestionDescription = this.question.question;

      if (
        typeof this.question.image === "undefined" ||
        this.question.image === ""
      )
        this.editedImages = "";
      else this.editedImages = this.question.image;

      this.imagePreview = this.editedImages || "";

      if (typeof this.question.answers[0].text == "string") this.number = 1;
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
      if (this.images[0]) {
        const imageToUpload = {
          image: this.images[0],
          name: this.question.name
        };
        const URL = this.$store.dispatch("uploadImageQuestion", imageToUpload);

        URL.then(result => {
          this.editedImages = result;

          const oldData = {
            name: this.question.name,
            created: this.question.created || null,
            subject: this.question.subject,
            question: this.question.question,
            answers: this.question.answers,
            image: this.question.image,
            edited: this.question.edited,
            imageSize: this.question.imageSize || "1x"
          };

          const questionData = {
            name: this.editedName,
            created: this.question.created || null,
            subject: this.editedSubject,
            question: this.editedQuestionDescription,
            answers: this.editedAnswers,
            image: this.editedImages,
            imageSize: this.editedImageSize
          };

          let aux = null;

          if (this.userClaims && this.userClaims["admin"]) {
            const sendInfo = {
              oldData,
              questionData,
              user: this.$store.getters.user.id,
              isSearching: this.isSearching
            };

            aux = this.$store.dispatch("editQuestion", sendInfo);
          } else {
            const request = {
              ...questionData,
              status: "Pendente",
              userId: this.userInfo.id
            };
            aux = this.$store.dispatch("updateQuestionRequest", {
              mode: "reqUpdate",
              request,
              user: this.userInfo,
              isSearching: this.isSearching
            });
          }
          aux.then(() => {
            this.close();
          });
        });
      } else {
        const oldData = {
          name: this.question.name,
          created: this.question.created || null,
          subject: this.question.subject,
          question: this.question.question,
          answers: this.question.answers,
          image: this.question.image,
          edited: this.question.edited,
          imageSize: this.question.imageSize
        };

        const questionData = {
          name: this.editedName,
          created: this.question.created || null,
          subject: this.editedSubject,
          question: this.editedQuestionDescription,
          answers: this.editedAnswers,
          imageSize: this.editedImageSize,
          image: this.question.image
        };

        let aux = null;

        if (this.userClaims && this.userClaims["admin"]) {
          const sendInfo = {
            oldData,
            questionData,
            user: this.$store.getters.user.id,
            isSearching: this.isSearching
          };

          aux = this.$store.dispatch("editQuestion", sendInfo);
        } else {
          const request = {
            ...questionData,
            status: "Pendente",
            userId: this.userInfo.id
          };
          aux = this.$store.dispatch("updateQuestionRequest", {
            mode: "reqUpdate",
            request,
            user: this.userInfo,
            isSearching: this.isSearching
          });
        }
        aux.then(() => {
          this.close();
        });
      }
    },
    setInitialData() {
      this.confirmTitle = false;
      this.editedQuestionDescription = "";
      this.e1 = 1;
      this.radios = null;
      this.columns = this.number;
      this.multipleAnswer = false;
      this.auxTitle = [];
      this.editedImages = null;
      this.chips = [];
      this.items = [];
      this.images = [];
      this.imagePreview = "";
      this.editedAnswers = [];
      this.editedName = null;
      this.editedSubject = null;
      this.editedImageSize = null;
      this.number = 0;
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
        this.imagePreview = this.editedImages || "";
      }
    },
    close() {
      this.setInitialData();
      this.$emit("closeDialogEdit");
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
