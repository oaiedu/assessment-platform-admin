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
                      <v-row class="pa-0 ma-0">
                        <v-col class="pa-0 ma-0">
                          <v-select
                            v-model="editedSubject"
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
                            v-model="editedLevel"
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

                      <v-row class="pa-0 ma-0">
                        <v-col cols="12" class="pa-0 ma-0">
                          <VueTextEditor
                            v-if="ready"
                            outlined
                            placeholder="Descrição"
                            :groups="['format', 'align', 'list', 'format2']"
                            :value="editedQuestionDescription"
                            :height="300"
                            @textChange="editedQuestionDescription = $event"
                          />
                        </v-col>
                      </v-row>

                      <v-row class="pa-0 ma-0 mt-6">
                        <v-col class="pa-0 ma-0">
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

                      <v-row
                        v-if="image || editedImage"
                        justify="center"
                        class="pa-0 ma-0"
                      >
                        <v-radio-group
                          v-model="editedImageSize"
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
                        v-for="(item, index) in editedAnswers"
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
import { mdiClose, mdiArrowLeft, mdiArrowRight, mdiContentSave } from "@mdi/js";

import Preview from "./Preview";
import VueTextEditor from "../Shared/VueTextEditor.vue";

export default {
  name: "EditQuestion",
  components: {
    Preview,
    VueTextEditor
  },
  props: ["question", "userClaims", "userInfo", "isSearching"],
  data() {
    return {
      mdiClose,
      mdiArrowLeft,
      mdiArrowRight,
      mdiContentSave,
      ready: false,
      dialogState: false,
      imagePreview: "",
      letters: ["A", "B", "C", "D"],
      e1: 1,
      radios: null,
      chips: [],
      items: [],
      image: null,
      editedQuestionDescription: "",
      editedImage: null,
      editedName: null,
      editedSubject: null,
      editedImageSize: null,
      editedAnswers: [
        { text: "", description: "", ansId: "radio-1", value: false },
        { text: "", description: "", ansId: "radio-2", value: false },
        { text: "", description: "", ansId: "radio-3", value: false },
        { text: "", description: "", ansId: "radio-4", value: false }
      ],
      editedLevel: {
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
    radios(val) {
      this.editedAnswers.forEach(element => {
        element.value = element.ansId === val;
      });
    }
  },
  methods: {
    update() {
      this.editedName = this.question.name;
      this.editedSubject = this.question.subject;
      this.editedImageSize = this.question.imageSize;
      this.editedAnswers = [...this.question.answers];
      this.editedQuestionDescription = this.question.question;
      this.editedLevel = { ...this.question.level };

      if (!this.question.image) this.editedImage = "";
      else this.editedImage = this.question.image;

      this.imagePreview = this.editedImage || "";

      this.editedAnswers.forEach(element => {
        if (element.value === true) this.radios = element.ansId;
      });

      this.ready = true;
    },
    updateData(variable) {
      this.editedQuestionDescription = variable;
    },
    async onEditQuestion() {
      let url = null;

      if (this.image) {
        const imageToUpload = {
          image: this.image,
          name: this.question.name
        };

        url = await this.$store.dispatch("uploadImageQuestion", imageToUpload);
      }

      this.editedImage = url || this.question.image;

      const oldData = {
        name: this.question.name,
        created: this.question.created,
        subject: this.question.subject,
        level: this.question.level,
        question: this.question.question,
        answers: this.question.answers,
        image: this.question.image,
        imageSize: this.question.imageSize
      };

      const questionData = {
        name: this.editedName,
        created: this.question.created,
        subject: this.editedSubject,
        question: this.editedQuestionDescription,
        level: this.editedLevel,
        answers: this.editedAnswers,
        image: this.editedImage,
        imageSize: this.editedImageSize
      };

      if (this.userClaims && this.userClaims["admin"]) {
        const sendInfo = {
          oldData,
          questionData,
          user: this.$store.getters.user.id,
          isSearching: this.isSearching
        };

        await this.$store.dispatch("editQuestion", sendInfo);
      } else {
        const request = {
          ...questionData,
          status: "Pendente",
          userId: this.userInfo.id
        };

        await this.$store.dispatch("updateQuestionRequest", {
          mode: "reqUpdate",
          request,
          user: this.userInfo,
          isSearching: this.isSearching
        });
      }

      this.close();
    },
    setInitialData() {
      this.editedQuestionDescription = "";
      this.e1 = 1;
      this.radios = null;
      this.editedImage = null;
      this.items = [];
      this.image = null;
      this.imagePreview = "";
      this.editedAnswers = [];
      this.editedName = null;
      this.editedSubject = null;
      this.editedImageSize = null;
      this.ready = false;
      this.editedLevel = {
        index: 0,
        name: "beginner"
      };
    },
    checkImageType(event) {
      if (event && event[0] && event[0].type) {
        if (!event[0].type.match(/image.*/)) {
          this.$store.commit("setError", {
            message: "O arquivo inserido NÃO é uma imagem!"
          });
          this.image = null;
        } else if (event[0].size > 2000000) {
          this.$store.commit("setError", {
            message: "O tamanho da imagem deve ser no MÁXIMO 2 MB!"
          });
          this.image = null;
        } else {
          const file = event[0];
          const reader = new FileReader();

          reader.onload = readerEvent => {
            this.imagePreview = readerEvent.target.result;
          };

          reader.readAsDataURL(file);
        }
      } else if (this.imagePreview && this.imagePreview !== "") {
        this.imagePreview = this.editedImage || "";
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

.v-text-editor__container {
  border-radius: 28px;
}
</style>
