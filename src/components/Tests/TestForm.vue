<template>
  <v-card>
    <v-form ref="formRef">
      <v-toolbar dark color="primary">
        <v-btn icon dark class="mr-2" @click="close()">
          <v-icon>{{ mdiClose }}</v-icon>
        </v-btn>
        <h2>
          {{ !test ? $t('FAB.CREATE.new_quiz') : $t('TEST.edit') }}
        </h2>
        <v-spacer></v-spacer>
      </v-toolbar>

      <v-tooltip left>
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            fab
            fixed
            bottom
            right
            color="blue"
            class="mr-4"
            :loading="loading"
            :disabled="
              randomQuestionsNumber < 1 ||
                randomQuestionsNumber > checkNumber ||
                !title ||
                (testType !== 'auto' &&
                  (testType === 'selected'
                    ? !selectedQuestions.length
                    : !selectedRandom.length))
            "
            :dark="
              randomQuestionsNumber > 0 &&
                randomQuestionsNumber <= checkNumber &&
                !!title &&
                testType !== 'auto' &&
                (testType === 'selected'
                  ? !!selectedQuestions.length
                  : !!selectedRandom.length)
            "
            @click="!test ? createTest() : editTest()"
          >
            <v-icon color="white">{{ mdiContentSave }}</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('TEST.TEST_FORM.save') }}</span>
      </v-tooltip>

      <v-container fluid class="pa-15 pt-10">
        <v-row>
          <v-col>
            <v-row class="pa-0 ma-0">
              <v-text-field
                v-model="title"
                rounded
                flat
                outlined
                dense
                required
                :label="$t('TEST.TEST_FORM.title')"
                :rules="textRule()"
              ></v-text-field>
            </v-row>

            <v-row class="ma-0 pa-0">
              <VueTextEditor
                v-if="ready"
                outlined
                :placeholder="$t('TEST.TEST_FORM.instructions')"
                :groups="['format', 'align', 'list', 'format2']"
                :value="instructions"
                :height="240"
                @textChange="instructions = $event"
              />
            </v-row>

            <v-row class="pa-0 ma-0 mt-8">
              <v-col class="pa-0 ma-0">
                <v-select
                  v-model="testType"
                  rounded
                  flat
                  outlined
                  dense
                  item-value="value"
                  item-text="label"
                  :items="
                    types.map(t => ({
                      ...t,
                      label: $t('TEST.TYPE.' + t.label),
                    }))
                  "
                  :label="$t('TEST.TEST_FORM.type')"
                >
                </v-select>
              </v-col>

              <v-col v-if="testType !== 'selected'" class="pa-0 ma-0 ml-4">
                <v-text-field
                  v-model="randomQuestionsNumber"
                  dense
                  outlined
                  rounded
                  id="randomQuestionsNumber"
                  name="randomQuestionsNumber"
                  type="number"
                  :label="$t('TEST.TEST_FORM.questions_amount')"
                  :rules="rule()"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row v-if="testType !== 'selected'" class="pa-0 ma-0">
              <v-select
                v-model="testSubjects"
                rounded
                flat
                outlined
                dense
                multiple
                :label="$t('TEST.TEST_FORM.subject')"
                :items="subjects.map(s => s.name)"
              >
                <template v-slot:selection="{ item, index }">
                  <span v-if="index === 0" style="margin-right: 5px;">
                    {{ item }}
                  </span>
                  <span v-if="index === 1" class="grey--text caption">
                    (+{{ testSubjects.length - 1 }} others)
                  </span>
                </template>
                <template v-slot:prepend-item>
                  <v-list-item ripple @click="toggle">
                    <v-list-item-action>
                      <v-icon :color="testSubjects.length > 0 ? 'blue' : ''">
                        {{ selectIcon }}
                      </v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ $t('TEST.GENERATE_CARD.select_all') }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-divider class="mt-2"></v-divider>
                </template>
              </v-select>
            </v-row>

            <v-row class="ma-0 pa-0">
              <v-select
                v-model="level"
                rounded
                flat
                outlined
                dense
                item-value="value"
                item-text="label"
                :label="$t('TEST.TEST_FORM.level')"
                :items="
                  levels.map(l => ({
                    ...l,
                    label: $t('TEST.LEVEL.' + l.label),
                  }))
                "
              ></v-select>
            </v-row>

            <v-row
              v-if="testType === 'random'"
              justify="center"
              class="ma-0 mb-6 pa-0"
            >
              <v-btn
                color="blue"
                :loading="loading"
                :dark="
                  !(
                    testSubjects.length === 0 ||
                    randomQuestionsNumber < 1 ||
                    randomQuestionsNumber > checkNumber
                  )
                "
                :disabled="
                  testSubjects.length === 0 ||
                    randomQuestionsNumber < 1 ||
                    randomQuestionsNumber > checkNumber
                "
                @click="selectRandom()"
              >
                {{ $t('TEST.TEST_FORM.start_selection') }}
              </v-btn>
            </v-row>

            <v-row class="ma-0 pa-0" style="color: #5d5d5d">
              {{ $t('TEST.TEST_FORM.approval_percentage') }}
            </v-row>

            <v-row class="ma-0 pa-0">
              <v-slider
                v-model="approvalPercentage"
                thumb-label
                min="5"
                max="100"
                color="blue"
                track-color="grey lighten-1"
                :step="5"
              ></v-slider>
            </v-row>

            <v-row class="ma-0 pa-0">
              <v-checkbox
                v-model="unlimitedTime"
                color="blue"
                :label="$t('TEST.TEST_FORM.unlimited_time')"
              ></v-checkbox>
            </v-row>

            <v-row class="ma-0 pa-0">
              <v-text-field
                v-model="time.hours"
                class="mr-3"
                type="number"
                style="width: 100px; flex: none"
                :label="$t('TEST.TEST_FORM.hours')"
                :rules="[v => v >= 0 || $t('TEST.TEST_FORM.RULES.invalid')]"
                :disabled="unlimitedTime"
              ></v-text-field>

              <v-text-field
                v-model="time.minutes"
                type="number"
                style="width: 100px; flex: none"
                :label="$t('TEST.TEST_FORM.minutes')"
                :rules="[
                  v => (v >= 0 && v < 60) || $t('TEST.TEST_FORM.RULES.invalid'),
                ]"
                :disabled="unlimitedTime"
              ></v-text-field>
            </v-row>
          </v-col>

          <v-col v-if="testType === 'auto'" class="pt-10">
            <p class="orange--text text-center pt-10">
              {{ $t('TEST.TEST_FORM.info_test') }}
            </p>
          </v-col>

          <v-col v-if="testType === 'random'">
            <v-container class="ma-0 pa-0">
              <v-card outlined style="border-radius: 26px; overflow: hidden">
                <v-data-table
                  v-model="selectedRandom"
                  show-select
                  hide-default-footer
                  item-key="name"
                  :no-data-text="$t('QUESTIONS.TABLE.no_questions')"
                  :loading-text="$t('QUESTIONS.TABLE.loading_questions')"
                  :item-class="itemRowStyle"
                  :items="selectedRandomQuestions"
                  :headers="
                    randomHeaders.map(h => ({
                      ...h,
                      text: $t('QUESTIONS.FORM.' + h.text),
                    }))
                  "
                  :items-per-page="itemsPerPage"
                  :loading="loading"
                  :page="randomizedPage"
                >
                  <template v-slot:[`item.level`]="{ item }">
                    {{
                      item.level.index || item.level.index === 0
                        ? levels[item.level.index].label
                        : levels[item.level].label
                    }}
                  </template>
                </v-data-table>
              </v-card>
            </v-container>

            <div class="text-center pt-2">
              <Paginator
                :page="randomizedPage"
                :length="
                  Math.ceil(selectedRandomQuestions.length / itemsPerPage) || 1
                "
                @pageChange="randomizedPage = $event.page"
              />
            </div>
          </v-col>

          <v-col v-if="testType === 'selected'">
            <v-container class="ma-0 pa-0">
              <v-text-field
                id="searchFieldNew"
                v-model="search"
                clearable
                rounded
                dense
                single-line
                outlined
                hide-details
                :label="$t('QUESTIONS.search_id')"
                :append-icon="mdiMagnify"
                @keydown="searchQuery($event)"
              ></v-text-field>
            </v-container>

            <v-container class="mt-6 mb-4 pa-0">
              <v-card
                v-if="selectedSubjects.length === 0"
                outlined
                style="border-radius: 26px; overflow: hidden"
              >
                <v-data-table
                  v-model="selectedQuestions"
                  show-select
                  hide-default-footer
                  item-key="name"
                  class="elevation-1"
                  :no-data-text="$t('QUESTIONS.TABLE.no_questions')"
                  :loading-text="$t('QUESTIONS.TABLE.loading_questions')"
                  :headers="
                    headers.map(h => ({
                      ...h,
                      text: $t('QUESTIONS.FORM.' + h.text),
                    }))
                  "
                  :items="isSearching ? filteredQuestions : questions"
                  :page="isSearching ? searchPage : page"
                  :items-per-page="itemsPerPage"
                  :loading="loading"
                  :item-class="itemRowStyle"
                  @toggle-select-all="selectAllToggle"
                >
                  <template
                    v-slot:[`item.data-table-select`]="{
                      item,
                      isSelected,
                      select,
                    }"
                  >
                    <v-simple-checkbox
                      :value="isSelected"
                      :readonly="!!item.toDelete"
                      :disabled="!!item.toDelete"
                      @input="select($event)"
                    >
                    </v-simple-checkbox>
                  </template>

                  <template v-slot:[`item.level`]="{ item }">
                    {{ $t('TEST.LEVEL.' + levels[item.level.index].label) }}
                  </template>
                </v-data-table>
              </v-card>
            </v-container>

            <div class="text-center pt-2">
              <Paginator
                :page="!isSearching ? page : searchPage"
                :length="
                  !isSearching
                    ? pageAmount
                    : Math.ceil(filteredQuestions.length / itemsPerPage) || 1
                "
                @pageChange="
                  !isSearching
                    ? (page = $event.page)
                    : (searchPage = $event.page)
                  onPageChange($event)
                "
              />
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-form>

    <v-snackbar
      v-model="createErrorSnackBar"
      light
      right
      top
      vertical
      color="red darken-2"
      :timeout="15000"
    >
      <span style="color: white; font-size: 1rem">
        {{ $t('TEST.TEST_FORM.title_already_in_use') }}
        <br />
        {{ $t('TEST.TEST_FORM.change_title') }}
      </span>
      <template v-slot:action="{ attrs }">
        <v-btn
          dark
          text
          color="white"
          v-bind="attrs"
          @click="createErrorSnackBar = false"
        >
          {{ $t('FAB.TEXT.close') }}
        </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script>
import {
  mdiClose,
  mdiContentSave,
  mdiMagnify,
  mdiCloseBox,
  mdiMinusBox,
  mdiCheckboxBlankOutline,
} from '@mdi/js'
import Ripple from 'vuetify/lib/directives/ripple'

import { analytics } from '../../api/firebase'

import Paginator from '../Paginator'
import VueTextEditor from '../Shared/VueTextEditor.vue'
import { Entity } from '../../entities/base.entity'

export default {
  directives: { Ripple },
  components: { Paginator, VueTextEditor },
  props: {
    test: {
      type: Object,
      required: false,
      default: null,
    },
    searching: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      mdiClose,
      mdiContentSave,
      mdiMagnify,
      ready: false,
      testType: 'selected',
      randomizedPage: 1,
      randomQuestionsNumber: 1,
      createErrorSnackBar: false,
      selectedSubjects: [],
      selectedRandom: [],
      selectedRandomQuestions: [],
      selectedQuestions: [],
      testItems: [],
      title: '',
      instructions: '',
      approvalPercentage: 50,
      unlimitedTime: true,
      time: {
        hours: 0,
        minutes: 0,
        seconds: 0,
      },
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
          label: 'beginner',
        },
        {
          value: {
            index: 1,
            name: 'intermediary',
          },
          label: 'intermediary',
        },
        {
          value: {
            index: 2,
            name: 'advanced',
          },
          label: 'advanced',
        },
        {
          value: {
            index: 3,
            name: 'expert',
          },
          label: 'expert',
        },
      ],
      testSubjects: [],
      types: [
        {
          value: 'selected',
          label: 'selected',
        },
        {
          value: 'random',
          label: 'random',
        },
        {
          value: 'auto',
          label: 'auto',
        },
      ],
      showedQuestions: [],
      search: '',
      isSearching: false,
      page: 1,
      searchPage: 1,
      pageCount: 15,
      itemsPerPage: 8,
      headers: [
        { text: 'id', align: 'left', sortable: false, value: 'name' },
        {
          text: 'subject',
          align: 'center',
          sortable: false,
          value: 'subject',
        },
        { text: 'level', align: 'center', value: 'level' },
      ],
      randomHeaders: [
        { text: 'id', align: 'center', value: 'name' },
        { text: 'subject', align: 'center', value: 'subject' },
        { text: 'level', align: 'center', value: 'level' },
      ],
    }
  },
  computed: {
    loading() {
      return this.$store.getters.loading
    },
    subjects() {
      return this.$store.state.Subject.subjects
    },
    questions() {
      return this.$store.getters.getCurrentQuestionsPage
    },
    disabledCount() {
      return this.questions.filter(q => !!q.toDelete).length
    },
    filteredQuestions() {
      return this.$store.getters.getFilteredQuestions
    },
    checkNumber() {
      const subjects = this.testSubjects
      let amount = 0

      subjects.forEach(sub => {
        amount += this.$store.getters.getNumberOfQuestionBySubjectAndLevel(
          sub,
          this.level.index,
        )
      })

      return amount
    },
    pageAmount() {
      const questionAmount = this.$store.getters.getDataSize.questions.general
      return Math.ceil(questionAmount / this.itemsPerPage) || 1
    },
    selectedAllSubjects() {
      return this.testSubjects.length === this.subjects.length
    },
    selectedSomeSubject() {
      return this.testSubjects.length > 0 && !this.selectedAllSubjects
    },
    selectIcon() {
      if (this.selectedAllSubjects) return mdiCloseBox
      if (this.selectedSomeSubject) return mdiMinusBox
      return mdiCheckboxBlankOutline
    },
  },
  watch: {
    testType(value) {
      if (value !== 'selected') {
        return
      }

      this.selectedSubjects = []
    },
    selectedSubjects() {
      this.questions.forEach(element => {
        for (let i = 0; i < this.selectedSubjects.length; i++) {
          if (element.subject === this.selectedSubjects[i]) {
            let aux = true

            for (let k = 0; k < this.showedQuestions.length; k++) {
              if (element === this.showedQuestions[k]) aux = false
            }

            if (aux === true) this.showedQuestions.push(element)
          }
        }
      })
    },
    search(text) {
      if ((text === null || text.length === 0) && this.isSearching) {
        this.isSearching = false
        this.searchPage = 1
        this.$store.commit('resetFilteredQuestions')
      }
    },
  },
  methods: {
    textRule() {
      return [v => !!v || this.$t('TEST.TEST_FORM.RULES.required')]
    },
    rule() {
      return [
        v => v >= 1 || this.$t('TEST.TEST_FORM.RULES.positive'),
        v =>
          v <= this.checkNumber ||
          this.$t('TEST.TEST_FORM.RULES.not_enough_questions'),
      ]
    },
    onPageChange(event) {
      const payload = {
        page: this.page,
        itemsPerPage: this.itemsPerPage,
      }

      if (!this.isSearching) {
        if (!event.mode) {
          this.$store.dispatch('loadQuestionPage', {
            ...payload,
            direction: event.direction,
          })
        } else {
          this.$store.dispatch('loadQuestionPage', {
            ...payload,
            mode: event.mode,
          })
        }
      }
    },
    toggle() {
      this.$nextTick(() => {
        if (this.selectedAllSubjects) {
          this.testSubjects = []
        } else {
          this.testSubjects = this.subjects.slice()
        }
      })
    },
    searchQuery(event) {
      if (event.key === 'Enter') {
        document.getElementById('searchFieldNew').blur()

        this.searchPage = 1
        this.$store.commit('resetFilteredQuestions')

        if (this.search.length > 0) {
          this.isSearching = true
          this.$store.dispatch('searchQuestions', this.search)

          analytics.logEvent('search', {
            search_term: text,
          })
        } else {
          this.isSearching = false
        }
      }
    },
    close() {
      this.setInitialData()
      this.$emit('closeDialogNew')
    },
    setInitialData() {
      this.ready = false
      this.testType = 'selected'
      this.randomQuestionsNumber = null
      this.selectedSubjects = []
      this.selectedRandom = []
      this.selectedRandomQuestions = []
      this.selectedQuestions = []
      this.testItems = []
      this.title = ''
      this.instructions = ''
      this.approvalPercentage = 50
      this.time = {
        hours: 0,
        minutes: 0,
        seconds: 0,
      }
      this.level = {
        index: 0,
        name: 'beginner',
      }
      this.showedQuestions = []
      this.search = ''
    },
    async selectRandom() {
      const amount =
        this.randomQuestionsNumber > this.checkNumber
          ? this.checkNumber
          : this.randomQuestionsNumber

      const subjects = this.testSubjects
      const selected = []
      const allQuestions = []

      this.selectedRandomQuestions = []

      this.$store.commit('setLoading', true)

      const promises = subjects.map(subject => {
        return this.$store
          .dispatch('getSubjectQuestions', subject)
          .then(questions => {
            questions.forEach(question => {
              if (question.level <= this.level.index) {
                allQuestions.push({
                  name: question.name,
                  level: question.level,
                  subject,
                })
              }
            })
          })
      })

      await Promise.all(promises)

      while (
        selected.length < amount &&
        selected.length < allQuestions.length
      ) {
        const index = Math.floor(Math.random() * allQuestions.length)
        if (!selected.includes(allQuestions[index].name)) {
          const question = allQuestions[index]
          selected.push(question.name)
          this.selectedRandomQuestions.push({
            name: question.name,
            level: question.level,
            subject: question.subject,
          })
        }
      }
      this.selectedRandom = [...this.selectedRandomQuestions]
      this.$store.commit('setLoading', false)
    },
    async createTest() {
      if (!this.$refs.formRef.validate()) {
        return
      }

      this.$store.commit('setLoading', true)

      const exist = await this.$store.dispatch('testExists', this.title)

      if (exist) {
        this.createErrorSnackBar = true
        return
      }

      if (this.testType === 'random') {
        this.selectedQuestions = []

        const promises = this.selectedRandom.map(question => {
          return this.$store
            .dispatch('getQuestionByName', question.name)
            .then(q => {
              this.selectedQuestions.push(q)
            })
        })

        await Promise.all(promises)
      }

      if (this.testType !== 'auto') {
        this.selectedQuestions.forEach(element => {
          this.testItems.push(element)
        })
      }

      const testData = {
        title: this.title,
        instructions: this.instructions,
        approvalPercentage: this.approvalPercentage,
        questions: this.testItems,
        questionsNames: this.testItems.map(q => q.name),
        questionsAmount: this.testItems.length || +this.randomQuestionsNumber,
        type: this.testType,
        level: this.level,
        unlimitedTime: this.unlimitedTime,
        time: {
          hours: +this.time.hours,
          minutes: +this.time.minutes,
          seconds: +this.time.seconds,
        },
        userId: this.$store.getters.user.id,
      }

      if (this.testType === 'auto') {
        testData.subjects = [...this.testSubjects]

        testData.questionsNames = this.subjects
          .filter(s => this.testSubjects.includes(s.name))
          .map(s => s.questions)
          .flat()
          .filter(q => q.level <= this.level.index)
          .map(q => q.name)
      }

      if (!this.time.hours && !this.time.minutes) {
        testData.unlimitedTime = true
      }

      await this.$store.dispatch('createTest', {
        testData,
      })

      this.$store.commit('setLoading', false)

      this.$emit('testCreated')

      this.close()
    },
    async editTest() {
      if (!this.$refs.formRef.validate()) {
        return
      }

      const amount = await this.$store.dispatch('testExists', this.title)

      if (
        (this.test.title !== this.title && amount) ||
        (this.test.title === this.title && amount > 1)
      ) {
        this.createErrorSnackBar = true
        return
      }

      if (this.testType === 'random') {
        this.selectedQuestions = []

        for (const question of this.selectedRandom) {
          const q = await this.$store.dispatch(
            'getQuestionByName',
            question.name,
          )
          this.selectedQuestions.push(q.toMap())
        }
      }

      this.selectedQuestions.forEach(element => {
        this.testItems.push(
          element instanceof Entity ? element.toMap() : element,
        )
      })

      const testData = {
        id: this.test.id,
        title: this.title,
        instructions: this.instructions,
        approvalPercentage: this.approvalPercentage,
        questions: this.testItems,
        questionsNames: this.testItems.map(q => q.name),
        questionsAmount: this.testItems.length || +this.randomQuestionsNumber,
        type: this.testType,
        level: this.level,
        unlimitedTime: this.unlimitedTime,
        time: {
          hours: +this.time.hours,
          minutes: +this.time.minutes,
          seconds: 0,
        },
        userId: this.test.userId,
        created: this.test.created,
        uuid: this.test.uuid,
      }

      if (this.testType === 'auto') {
        testData.subjects = [...this.testSubjects]

        testData.questionsNames = this.subjects
          .filter(s => this.testSubjects.includes(s.name))
          .map(s => s.questions)
          .flat()
          .filter(q => q.level <= this.level.index)
          .map(q => q.name)
      }

      await this.$store.dispatch('updateTest', {
        testData,
        isSearching: this.searching,
      })

      this.close()
    },
    itemRowStyle(item) {
      return item.toDelete
        ? item.toDelete.status
          ? 'item-to-delete'
          : 'item-deleted'
        : ''
    },
    selectAllToggle(props) {
      if (
        this.selectedQuestions.length !=
        this.questions.length - this.disabledCount
      ) {
        this.selectedQuestions = []

        props.items.forEach(item => {
          if (!item.toDelete) {
            this.selectedQuestions.push(item)
          }
        })
      } else {
        this.selectedQuestions = []
      }
    },
    setTest() {
      if (!this.test) {
        return
      }

      this.title = this.test.title
      this.instructions = this.test.instructions
      this.approvalPercentage = this.test.approvalPercentage
      this.testType = this.test.type
      this.level = this.test.level
      this.unlimitedTime = this.test.unlimitedTime
      this.time = this.test.time

      if (this.test.type !== 'selected') {
        this.randomQuestionsNumber = this.test.questionsAmount
      }

      if (this.test.questions) {
        this.test.questions.forEach(element => {
          this.selectedQuestions.push(element)
          this.selectedRandom.push(element)
          this.selectedRandomQuestions.push(element)

          if (
            this.test.type !== 'selected' &&
            !this.testSubjects.includes(element.subject)
          ) {
            this.testSubjects.push(element.subject)
            this.selectedSubjects.push(element.subject)
          }
        })
      }

      if (this.test.subjects) {
        this.testSubjects = [...this.test.subjects]
        this.selectedSubjects = [...this.test.subjects]
      }
    },
  },
  mounted() {
    this.$store.dispatch('loadQuestionPage', {
      page: 1,
      itemsPerPage: this.itemsPerPage,
      mode: 'first',
    })

    this.testSubjects = this.subjects.length > 0 ? [this.subjects[0].name] : []
    this.setTest()

    this.ready = true
  },
  beforeDestroy() {
    this.search = ''
    this.isSearching = false
    this.page = 1
    this.$store.commit('resetFilteredQuestions')
    this.$store.commit('resetCurrentQuestionsPage')
  },
}
</script>

<style>
.item-to-delete {
  color: #f00;
}

.item-deleted {
  color: #c4c4c4;
}
</style>
