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
      <h2>{{ $t('FAB.CREATE.new_question') }}</h2>
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
          <v-icon color="blue">{{ mdiArrowLeft }}</v-icon>
        </v-btn>
      </template>
      <span>{{ $t('QUESTIONS.EDIT.back') }}</span>
    </v-tooltip>

    <v-tooltip left v-if="e1 < 2">
      <template v-slot:activator="{ on }">
        <v-btn
          color="blue"
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
      <span>{{ $t('USERNAME_MODAL.TEXT.continue') }}</span>
    </v-tooltip>

    <v-tooltip left v-else>
      <template v-slot:activator="{ on }">
        <v-btn
          color="blue"
          class="mr-4"
          v-on="on"
          fab
          fixed
          bottom
          right
          :dark="formIsValid"
          :disabled="!formIsValid"
          :loading="loading || createLoading"
          @click="onCreateQuestion()"
        >
          <v-icon color="white">{{ mdiContentSave }}</v-icon>
        </v-btn>
      </template>
      <span>{{ $t('TEST.TEST_FORM.save') }}</span>
    </v-tooltip>

    <v-container fluid>
      <v-row>
        <v-col :cols="$vuetify.breakpoint.width <= 794 ? 12 : void 0">
          <v-card>
            <form @submit.prevent="onCreateQuestion">
              <v-stepper alt-labels v-model="e1">
                <v-stepper-header>
                  <v-stepper-step editable :complete="e1 > 1" step="1">
                    {{ $t('TEST.QUIZ.info') }}
                  </v-stepper-step>

                  <v-divider class="mx-2" style="margin-top: 50px"></v-divider>

                  <v-stepper-step editable step="2">
                    {{ $t('TEST.QUIZ.answers') }}
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
                            label="ID"
                            :rules="[
                              v => !!v || $t('QUESTIONS.FORM.required'),
                              v =>
                                v.length < 8 || $t('QUESTIONS.FORM.max-length'),
                            ]"
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
                            :label="$t('QUESTIONS.FORM.subject')"
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
                            item-value="value"
                            item-text="label"
                            :label="$t('QUESTIONS.FORM.level')"
                            :items="
                              levels.map(l => ({
                                ...l,
                                label: $t('TEST.LEVEL.' + l.value.name),
                              }))
                            "
                          ></v-select>
                        </v-col>
                      </v-row>

                      <v-row justify="center" class="pa-0 ma-0">
                        <v-col cols="12" class="pa-0 ma-0">
                          <VueTextEditor
                            v-if="+e1 === 1"
                            outlined
                            :placeholder="$t('QUESTIONS.FORM.description')"
                            :groups="['format', 'align', 'list', 'format2']"
                            :value="questionDescription"
                            :height="300"
                            @textChange="questionDescription = $event"
                          />
                        </v-col>
                      </v-row>

                      <v-row justify="center" class="pa-0 ma-0 mt-6">
                        <v-col cols="12" class="pa-0 ma-0">
                          <v-file-input
                            v-model="image"
                            clearable
                            dense
                            outlined
                            rounded
                            accept="image/*"
                            :label="$t('QUESTIONS.FORM.image')"
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
                    <v-container class="px-8 pb-8 pt-4 ma-0">
                      <v-row class="pa-0 ma-0 mb-2">
                        <v-checkbox
                          v-model="multipleAnswers"
                          :label="$t('QUESTIONS.FORM.multi_answers')"
                        ></v-checkbox>
                      </v-row>

                      <v-row
                        v-for="(item, index) in answers"
                        :key="index"
                        class="pa-0 ma-0"
                        :class="{ 'pt-2': index > 0 }"
                      >
                        <v-checkbox
                          v-if="multipleAnswers"
                          v-model="selectedAnswers"
                          class="pa-0 pt-2 ma-0"
                          :value="item.ansId"
                        ></v-checkbox>

                        <v-radio-group
                          v-else
                          v-model="radios"
                          class="pa-0 pt-2 ma-0"
                        >
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
                            :placeholder="$t('QUESTIONS.FORM.justification')"
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row
                        class="question-form__answer-justification pa-0 ma-0 mt-2"
                      >
                        <VueTextEditor
                          v-if="+e1 === 2"
                          outlined
                          :placeholder="
                            $t('QUESTIONS.FORM.general_justification')
                          "
                          :height="300"
                          :value="answerJustification"
                          :groups="['format', 'list', 'format2']"
                          @textChange="answerJustification = $event"
                        />
                      </v-row>

                      <v-row class="pa-0 ma-0 mt-8">
                        <v-text-field
                          v-model="answerJustificationSource"
                          dense
                          outlined
                          rounded
                          class="pa-0 ma-0"
                          :label="$t('QUESTIONS.FORM.justification_source')"
                        ></v-text-field>
                      </v-row>
                    </v-container>
                  </v-stepper-content>
                </v-stepper-items>
              </v-stepper>
            </form>
          </v-card>
        </v-col>

        <v-col :cols="$vuetify.breakpoint.width <= 600 ? 12 : void 0">
          <Preview
            :name="name"
            :subject="subject"
            :questionDesc="questionDescription"
            :answers="answers"
            :answerJustification="answerJustification"
            :answerJustificationSource="answerJustificationSource"
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
          {{ $t('QUESTIONS.FORM.id_in_use') }}
          <br />
          {{ $t('QUESTIONS.FORM.change_id') }}
        </span>
        <template v-slot:action="{ attrs }">
          <v-btn
            dark
            color="white"
            text
            v-bind="attrs"
            @click="createErrorSnackBar = false"
          >
            {{ $t('FAB.TEXT.close') }}
          </v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </v-card>
</template>

<script>
import {
  mdiClose,
  mdiPlus,
  mdiMinus,
  mdiArrowLeft,
  mdiArrowRight,
  mdiContentSave,
} from '@mdi/js'

import Preview from './Preview'
import VueTextEditor from '../Shared/VueTextEditor.vue'

export default {
  name: 'QuestionForm',
  components: {
    Preview,
    VueTextEditor,
  },
  props: ['questionRequest', 'page'],
  data() {
    return {
      mdiClose,
      mdiPlus,
      mdiMinus,
      mdiArrowLeft,
      mdiArrowRight,
      mdiContentSave,
      createErrorSnackBar: false,
      createLoading: false,
      imagePreview: '',
      image: null,
      imagesAsURL: '',
      imageSize: '1x',
      questionDescription: '',
      e1: 1,
      test: null,
      radios: '',
      chips: [],
      items: [],
      letters: ['A', 'B', 'C', 'D'],
      selectedAnswers: [],
      multipleAnswers: false,
      answers: [
        { text: '', description: '', ansId: 'radio-1', value: false },
        { text: '', description: '', ansId: 'radio-2', value: false },
        { text: '', description: '', ansId: 'radio-3', value: false },
        { text: '', description: '', ansId: 'radio-4', value: false },
      ],
      answerJustification: '',
      answerJustificationSource: '',
      name: '',
      subject: '',
      level: {
        index: 0,
        name: 'beginner',
      },
      levels: [
        {
          value: {
            index: 0,
            name: 'beginner',
          },
        },
        {
          value: {
            index: 1,
            name: 'intermediary',
          },
        },
        {
          value: {
            index: 2,
            name: 'advanced',
          },
        },
        {
          value: {
            index: 3,
            name: 'expert',
          },
        },
      ],
    }
  },
  computed: {
    formIsValid() {
      const name = (this.name ?? '').trim()

      return (
        !!name &&
        name.length < 8 &&
        !!this.subject &&
        (this.multipleAnswers ? !!this.selectedAnswers.length : !!this.radios)
      )
    },
    userClaims() {
      return this.$store.getters.getUserClaims
    },
    userInfo() {
      return this.$store.getters.userInfo
    },
    subjectItems() {
      return this.$store.state.Subject.subjects
    },
    loading() {
      return this.$store.getters.loading
    },
  },
  watch: {
    radios() {
      this.setSingleAnswer()
    },
    selectedAnswers() {
      this.setMultipleAnswers()
    },
    multipleAnswers(value) {
      if (value) {
        this.setMultipleAnswers()
        return
      }

      this.setSingleAnswer()
    },
    name(value) {
      this.name = value.trim().replace(/\s/g, '')
    },
  },
  methods: {
    updateData(variable) {
      this.questionDescription = variable
    },
    setMultipleAnswers() {
      this.answers.forEach(element => {
        element.value = this.selectedAnswers.includes(element.ansId)
      })
    },
    setSingleAnswer() {
      this.answers.forEach(element => {
        element.value = element.ansId === this.radios
      })
    },
    async onCreateQuestion() {
      this.createLoading = true

      const exist = await this.$store.dispatch('questionExists', this.name)

      if (exist) {
        this.createLoading = false
        this.createErrorSnackBar = true
        return
      }

      let url = ''

      if (this.image) {
        const imageToUpload = { name: this.name, image: this.image }
        url = await this.$store.dispatch('uploadImageQuestion', imageToUpload)

        this.imagesAsURL = url
      }

      const questionData = {
        name: this.name.toUpperCase(),
        subject: this.subject,
        level: this.level,
        question: this.questionDescription,
        multipleAnswers: this.multipleAnswers,
        answers: this.answers,
        answerJustification: this.answerJustification,
        answerJustificationSource: this.answerJustificationSource,
        image: url,
        imageSize: this.imageSize,
      }

      if (this.userClaims && this.userClaims['admin']) {
        await this.$store.dispatch('createQuestion', {
          question: questionData,
          page: this.page,
        })
      } else {
        await this.$store.dispatch('createQuestionRequest', {
          request: {
            ...questionData,
            userId: this.userInfo.id,
            status: '0-pendant',
          },
        })

        await this.$store.dispatch('refetchRequests')
      }

      this.$emit('questionCreated')

      this.createLoading = false

      this.setInitialData()
      this.close()
    },
    setInitialData() {
      this.confirmTitle = false
      this.questionDescription = ''
      this.imageSize = '1x'
      this.e1 = 1
      this.test = null
      this.level = {
        index: 0,
        name: 'beginner',
      }
      this.radios = ''
      this.chips = []
      this.items = []
      this.selectedAnswers = []
      this.multipleAnswers = false
      this.answers = [
        { text: '', ansId: 'radio-1', value: false },
        { text: '', ansId: 'radio-2', value: false },
        { text: '', ansId: 'radio-3', value: false },
        { text: '', ansId: 'radio-4', value: false },
      ]
      this.answerJustification = ''
      this.answerJustificationSource = ''
      this.name = ''
      this.subject = ''
      this.image = null
      this.imagesAsBase64 = ''
    },
    checkImageType(file) {
      if (file && file.type) {
        if (!file.type.match(/image.*/)) {
          this.$store.commit('setError', {
            message: 'O arquivo inserido NÃO é uma imagem!',
          })
          this.image = null
        } else if (file.size > 2000000) {
          this.$store.commit('setError', {
            message: 'O tamanho da imagem deve ser no MÁXIMO 2 MB!',
          })
          this.image = null
        } else {
          const reader = new FileReader()

          reader.onload = readerEvent => {
            this.imagePreview = readerEvent.target.result
          }

          reader.readAsDataURL(file)
        }
      } else if (this.imagePreview) {
        this.imagePreview = ''
      }
    },
    close() {
      this.setInitialData()
      this.$emit('closeDialogNew')
    },
  },
}
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

.v-text-editor__container {
  border-radius: 28px;
}

.question-form__answer-justification .v-text-editor {
  width: 100%;
}
</style>
