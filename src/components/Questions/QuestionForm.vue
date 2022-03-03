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
                      <v-row class="pa-0 ma-0">
                        <v-col class="pa-0 ma-0">
                          <v-text-field
                            v-model="name"
                            dense
                            outlined
                            required
                            rounded
                            id="name"
                            name="name"
                            label="Nome"
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row class="pa-0 ma-0">
                        <v-col class="pa-0 ma-0">
                          <v-select
                            v-model="subject"
                            dense
                            flat
                            outlined
                            rounded
                            id="subject"
                            name="subject"
                            label="Disciplina"
                            :items="subjectItems.map(s => s.name)"
                          ></v-select>
                        </v-col>
                      </v-row>

                      <v-row class="pa-0 ma-0">
                        <v-col class="pa-0 ma-0">
                          <v-select
                            v-model="level"
                            dense
                            flat
                            outlined
                            rounded
                            label="Nível"
                            item-value="value"
                            item-text="label"
                            :items="levels"
                          ></v-select>
                        </v-col>
                      </v-row>

                      <v-row justify="center" class="pa-0 ma-0">
                        <v-col cols="12" class="pa-0 ma-0">
                          <VueSimplemde v-model="questionDescription" />
                        </v-col>
                      </v-row>

                      <v-row justify="center" class="pa-0 ma-0 mt-2">
                        <v-col cols="12" class="pa-0 ma-0">
                          <v-file-input
                            v-model="image"
                            clearable
                            dense
                            outlined
                            rounded
                            label="Imagem"
                            placeholder="Escolha uma imagem"
                            accept="image/*"
                            @change="checkImageType"
                          />
                        </v-col>
                      </v-row>

                      <v-row v-if="image" justify="center" class="pa-0 ma-0">
                        <v-radio-group
                          v-model="imageSize"
                          row
                          class="pa-0 ma-0"
                        >
                          <v-radio label="1x" value="1x"></v-radio>
                          <v-radio label="2x" value="2x"></v-radio>
                          <v-radio label="3x" value="3x"></v-radio>
                        </v-radio-group>
                      </v-row>
                    </v-container>
                  </v-stepper-content>

                  <v-stepper-content step="2" class="pa-0 ma-0">
                    <v-container class="pl-4 pr-9 py-8 ma-0">
                      <v-row
                        v-for="(item, index) in answers"
                        :key="index"
                        class="pa-0 ma-0"
                        :class="{ 'pt-2': index > 0 }"
                      >
                        <v-radio-group v-model="radios" class="pa-0 pt-2 ma-0">
                          <v-radio :value="item.ansId"></v-radio>
                        </v-radio-group>

                        <v-col class="pa-0 ma-0">
                          <v-text-field
                            v-model="item.text"
                            dense
                            outlined
                            rounded
                            class="pa-0 ma-0"
                            :placeholder="letters[index]"
                          ></v-text-field>

                          <v-text-field
                            v-model="item.description"
                            dense
                            outlined
                            rounded
                            class="pa-0 ma-0"
                            style="margin-top: -12px !important"
                            placeholder="Justificativa"
                          ></v-text-field>
                        </v-col>
                      </v-row>
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
      image: null,
      imagesAsURL: "",
      imageSize: "1x",
      questionDescription: "",
      createErrorSnackBar: false,
      e1: 1,
      test: null,
      radios: "",
      chips: [],
      items: [],
      letters: ["A", "B", "C", "D"],
      answers: [
        { text: "", description: "", ansId: "radio-1", value: false },
        { text: "", description: "", ansId: "radio-2", value: false },
        { text: "", description: "", ansId: "radio-3", value: false },
        { text: "", description: "", ansId: "radio-4", value: false }
      ],
      name: "",
      subject: "",
      level: {
        index: 0,
        name: "beginner"
      },
      levels: [
        {
          value: {
            index: 0,
            name: "beginner"
          },
          label: "Iniciante"
        },
        {
          value: {
            index: 1,
            name: "intermediary"
          },
          label: "Intermediário"
        },
        {
          value: {
            index: 2,
            name: "advanced"
          },
          label: "Avançado"
        },
        {
          value: {
            index: 3,
            name: "expert"
          },
          label: "Experiente"
        }
      ]
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
    radios(val) {
      this.answers.forEach(element => {
        element.value = element.ansId === val;
      });
    }
  },
  methods: {
    updateData(variable) {
      this.questionDescription = variable;
    },
    async onCreateQuestion() {
      const exist = await this.$store.dispatch("questionExists", this.name);

      if (exist) {
        this.createErrorSnackBar = true;
        return;
      }

      let url = "";

      if (this.image) {
        const imageToUpload = { name: this.name, image: this.image };
        url = await this.$store.dispatch("uploadImageQuestion", imageToUpload);

        this.imagesAsURL = url;
      }

      const questionData = {
        name: this.name.toUpperCase(),
        subject: this.subject,
        level: this.level,
        question: this.questionDescription,
        answers: this.answers,
        image: url,
        imageSize: this.imageSize
      };

      if (this.userClaims && this.userClaims["admin"]) {
        await this.$store.dispatch("createQuestion", {
          question: questionData,
          page: this.page
        });
      } else {
        await this.$store.dispatch("createQuestionRequest", {
          request: {
            ...questionData,
            userId: this.userInfo.id,
            status: "Pendente"
          },
          user: this.userInfo
        });
      }

      this.setInitialData();
      this.close();
    },
    setInitialData() {
      this.confirmTitle = false;
      this.questionDescription = "";
      this.imageSize = "1x";
      this.e1 = 1;
      this.test = null;
      this.level = {
        index: 0,
        name: "beginner"
      };
      this.radios = "";
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
      this.image = null;
      this.imagesAsBase64 = "";
    },
    checkImageType(file) {
      if (file && file.type) {
        if (!file.type.match(/image.*/)) {
          this.$store.commit("setError", {
            message: "O arquivo inserido NÃO é uma imagem!"
          });
          this.image = null;
        } else if (file.size > 2000000) {
          this.$store.commit("setError", {
            message: "O tamanho da imagem deve ser no MÁXIMO 2 MB!"
          });
          this.image = null;
        } else {
          const reader = new FileReader();

          reader.onload = readerEvent => {
            this.imagePreview = readerEvent.target.result;
          };

          reader.readAsDataURL(file);
        }
      } else if (this.imagePreview) {
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

.v-stepper__header {
  box-shadow: 0 1px 0 0 #cfcfcf !important;
}
</style>
