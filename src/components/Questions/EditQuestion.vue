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
      <h2>{{ $t('QUESTIONS.EDIT.edit_question') }}{{ name }}</h2>
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
          :loading="loading"
          @click="onEditQuestion()"
        >
          <v-icon color="white">{{ mdiContentSave }}</v-icon>
        </v-btn>
      </template>
      <span>{{ $t('TEST.TEST_FORM.save') }}</span>
    </v-tooltip>

    <v-container fluid>
      <v-row>
        <v-col>
          <v-card>
            <form @submit.prevent="onEditQuestion">
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
                          <v-select
                            v-model="editedSubject"
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
                            v-model="editedLevel"
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

                      <v-row class="pa-0 ma-0">
                        <v-col cols="12" class="pa-0 ma-0">
                          <VueTextEditor
                            v-if="ready && +e1 === 1"
                            outlined
                            :placeholder="$t('QUESTIONS.FORM.description')"
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
                            accept="image/*"
                            :label="$t('QUESTIONS.FORM.image')"
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
                    <v-container class="px-8 py-8 ma-0">
                      <v-row class="pa-0 ma-0 mb-2">
                        <v-checkbox
                          v-model="editedMultipleAnswers"
                          :label="$t('QUESTIONS.FORM.multi_answers')"
                        ></v-checkbox>
                      </v-row>

                      <v-row
                        v-for="(item, index) in editedAnswers"
                        :key="index"
                        class="pa-0 ma-0"
                        :class="{ 'pt-2': index > 0 }"
                      >
                        <v-checkbox
                          v-if="editedMultipleAnswers"
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
                          v-if="ready && +e1 === 2"
                          outlined
                          :placeholder="
                            $t('QUESTIONS.FORM.general_justification')
                          "
                          :height="300"
                          :value="editedAnswerJustification"
                          :groups="['format', 'list', 'format2']"
                          @textChange="editedAnswerJustification = $event"
                        />
                      </v-row>

                      <v-row class="pa-0 ma-0 mt-8">
                        <v-text-field
                          v-model="editedAnswerJustificationSource"
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

        <v-col>
          <Preview
            :name="name"
            :subject="editedSubject"
            :questionDesc="editedQuestionDescription"
            :answers="editedAnswers"
            :answerJustification="editedAnswerJustification"
            :answerJustificationSource="editedAnswerJustificationSource"
            :image="imagePreview"
          />
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import { mdiClose, mdiArrowLeft, mdiArrowRight, mdiContentSave } from '@mdi/js'

import Preview from './Preview'
import VueTextEditor from '../Shared/VueTextEditor.vue'

export default {
  name: 'EditQuestion',
  components: {
    Preview,
    VueTextEditor,
  },
  props: ['question', 'userClaims', 'userInfo', 'isSearching'],
  data() {
    return {
      mdiClose,
      mdiArrowLeft,
      mdiArrowRight,
      mdiContentSave,
      ready: false,
      dialogState: false,
      imagePreview: '',
      letters: ['A', 'B', 'C', 'D'],
      e1: 1,
      radios: null,
      chips: [],
      items: [],
      image: null,
      editedQuestionDescription: '',
      editedImage: null,
      editedName: null,
      editedSubject: null,
      editedImageSize: null,
      selectedAnswers: [],
      editedMultipleAnswers: [],
      editedAnswers: [
        { text: '', description: '', ansId: 'radio-1', value: false },
        { text: '', description: '', ansId: 'radio-2', value: false },
        { text: '', description: '', ansId: 'radio-3', value: false },
        { text: '', description: '', ansId: 'radio-4', value: false },
      ],
      editedAnswerJustification: '',
      editedAnswerJustificationSource: '',
      editedLevel: {
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
    hasImages() {
      return !!this.question.image
    },
    formIsValid() {
      return (
        !!this.editedName &&
        !!this.editedSubject &&
        (this.editedMultipleAnswers
          ? !!this.selectedAnswers.length
          : !!this.radios)
      )
    },
    name() {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.editedName = this.question.name
      return this.question.name
    },
    subjectItems() {
      return this.$store.state.Subject.subjects
    },
    loading() {
      return this.$store.getters.loading
    },
  },
  watch: {
    editedName(value) {
      if (value) this.update()
    },
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
  },
  methods: {
    update() {
      this.editedName = this.question.name
      this.editedSubject = this.question.subject
      this.editedImageSize = this.question.imageSize
      this.editedMultipleAnswers = this.question.multipleAnswers
      this.editedAnswers = [...this.question.answers]
      this.editedAnswerJustification = this.question.answerJustification
      this.editedAnswerJustificationSource = this.question.answerJustificationSource
      this.editedQuestionDescription = this.question.question
      this.editedLevel = { ...this.question.level }

      if (!this.question.image) this.editedImage = ''
      else this.editedImage = this.question.image

      this.imagePreview = this.editedImage || ''

      this.editedAnswers.forEach(element => {
        if (!element.value) {
          return
        }

        if (this.editedMultipleAnswers) {
          this.selectedAnswers.push(element.ansId)
        } else {
          this.radios = element.ansId
        }
      })

      this.ready = true
    },
    updateData(variable) {
      this.editedQuestionDescription = variable
    },
    setMultipleAnswers() {
      this.editedAnswers.forEach(element => {
        element.value = this.selectedAnswers.includes(element.ansId)
      })
    },
    setSingleAnswer() {
      this.editedAnswers.forEach(element => {
        element.value = element.ansId === this.radios
      })
    },
    async onEditQuestion() {
      let url = null

      if (this.image) {
        const imageToUpload = {
          image: this.image,
          name: this.question.name,
        }

        url = await this.$store.dispatch('uploadImageQuestion', imageToUpload)
      }

      this.editedImage = url || this.question.image

      const oldData = {
        id: this.question.id,
        name: this.question.name,
        created: this.question.created,
        subject: this.question.subject,
        level: this.question.level,
        question: this.question.question,
        multipleAnswers: this.question.multipleAnswers,
        answers: this.question.answers,
        answerJustification: this.question.answerJustification,
        answerJustificationSource: this.question.answerJustificationSource,
        image: this.question.image,
        imageSize: this.question.imageSize,
      }

      const questionData = {
        id: this.question.id,
        name: this.editedName,
        created: this.question.created,
        subject: this.editedSubject,
        question: this.editedQuestionDescription,
        level: this.editedLevel,
        multipleAnswers: this.editedMultipleAnswers,
        answers: this.editedAnswers,
        answerJustification: this.editedAnswerJustification,
        answerJustificationSource: this.editedAnswerJustificationSource,
        image: this.editedImage,
        imageSize: this.editedImageSize,
      }

      if (this.userClaims && this.userClaims['admin']) {
        const sendInfo = {
          oldData,
          questionData,
          user: this.$store.getters.user.id,
          isSearching: this.isSearching,
        }

        await this.$store.dispatch('editQuestion', sendInfo)
      } else {
        const request = {
          ...questionData,
          status: '0-pendant',
          userId: this.userInfo.id,
        }

        await this.$store.dispatch('updateQuestionRequest', {
          mode: 'reqUpdate',
          request,
          isSearching: this.isSearching,
        })
      }

      this.close()
    },
    setInitialData() {
      this.editedQuestionDescription = ''
      this.e1 = 1
      this.radios = null
      this.editedImage = null
      this.items = []
      this.image = null
      this.imagePreview = ''
      this.selectedAnswers = []
      this.editedMultipleAnswers = false
      this.editedAnswers = []
      this.editedAnswerJustification = ''
      this.editedAnswerJustificationSource = ''
      this.editedName = null
      this.editedSubject = null
      this.editedImageSize = null
      this.ready = false
      this.editedLevel = {
        index: 0,
        name: 'beginner',
      }
    },
    checkImageType(event) {
      if (event && event[0] && event[0].type) {
        if (!event[0].type.match(/image.*/)) {
          this.$store.commit('setError', {
            message: 'O arquivo inserido NÃO é uma imagem!',
          })
          this.image = null
        } else if (event[0].size > 2000000) {
          this.$store.commit('setError', {
            message: 'O tamanho da imagem deve ser no MÁXIMO 2 MB!',
          })
          this.image = null
        } else {
          const file = event[0]
          const reader = new FileReader()

          reader.onload = readerEvent => {
            this.imagePreview = readerEvent.target.result
          }

          reader.readAsDataURL(file)
        }
      } else if (this.imagePreview && this.imagePreview !== '') {
        this.imagePreview = this.editedImage || ''
      }
    },
    close() {
      this.setInitialData()
      this.$emit('closeDialogEdit')
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
</style>
