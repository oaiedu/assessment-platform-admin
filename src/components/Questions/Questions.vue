<template>
  <div>
    <v-container>
      <v-row class="mt-10 mb-5 pa-6" justify="space-between">
        <SearchBox
          :label="$t('QUESTIONS.search_id')"
          @enter="searchQuery($event)"
          @textChange="searchTextChange($event)"
        />

        <v-col class="ma-0 ml-4 pa-0" cols="4">
          <v-select
            v-model="selectedSubject"
            dense
            rounded
            outlined
            clearable
            label="Filter by subject"
            :items="subjects.map(s => s.name)"
          ></v-select>
        </v-col>
      </v-row>

      <v-container
        v-if="hasDeleteMarkQuestions && userClaims && userClaims['admin']"
      >
        <DeleteAlert
          :confirmCondition="deleteConfirmed"
          :itemsCondition="hasTrueMarkStatus"
          :itemsText="$t('QUESTIONS.delete_marked')"
          :items="markedQuestionsByUser"
        />

        <v-row justify="start" v-if="hasTrueMarkStatus">
          <v-btn
            class="ml-10"
            color="red"
            dark
            @click="
              deleteConfirmed = true
              deleteQuestions()
            "
          >
            {{ $t('AUTH.SUBJECT.confirm') }}
          </v-btn>
          <v-btn class="ml-3" color="grey darken-1" dark @click="restoreAll()">
            {{ $t('TEST.TESTS.restore') }}
          </v-btn>
        </v-row>
      </v-container>

      <QuestionsTable
        :items="isSearching ? filteredQuestions : questions"
        :page="isSearching ? searchPage : page"
        :itemsPerPage="itemsPerPage"
        :isActionsAvailable="true"
        @pdfClick="
          dialogPDF = true
          selectedEdit = $event
        "
        @editClick="
          dialogEditQuestion = true
          selectedEdit = $event
        "
        @deleteClick="
          deleteQuestionSnackBar = true
          deleteSelect = $event
        "
        @restoreClick="restoreQuestion($event)"
      />

      <v-tooltip
        left
        v-if="userClaims && (userClaims['appraiser'] || userClaims['admin'])"
      >
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            fixed
            dark
            fab
            bottom
            right
            color="blue"
            @click.stop="dialogNewQuestion = true"
          >
            <v-icon>{{ plusIcon }}</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('FAB.CREATE.new_question') }}</span>
      </v-tooltip>

      <v-dialog
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
        v-model="dialogNewQuestion"
      >
        <QuestionForm
          v-if="dialogNewQuestion"
          :page="page"
          @questionCreated="refetch()"
          @closeDialogNew="dialogNewQuestion = false"
        />
      </v-dialog>

      <v-dialog
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
        v-model="dialogEditQuestion"
      >
        <EditQuestion
          v-if="dialogEditQuestion"
          :question="selectedEdit"
          :userClaims="userClaims"
          :userInfo="userInfo"
          :isSearching="isSearching"
          @closeDialogEdit="
            dialogEditQuestion = false
            selectedEdit = {}
          "
        />
      </v-dialog>

      <v-dialog
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
        v-model="dialogPDF"
      >
        <PrintQuestion
          :question="selectedEdit"
          :showJustifications="userClaims && !userClaims['student']"
          @closeDialogPrint="dialogPDF = false"
        ></PrintQuestion>
      </v-dialog>

      <div class="text-center pt-2">
        <Paginator
          :disabled="loading"
          :page="!isSearching ? page : searchPage"
          :length="
            !isSearching
              ? pageAmount
              : Math.ceil(filteredQuestions.length / itemsPerPage)
          "
          @pageChange="
            !isSearching ? (page = $event.page) : (searchPage = $event.page)
            onPageChange($event)
          "
        />
      </div>

      <DeleteWarning
        :label="$t('QUESTIONS.delete_confirm')"
        :state="deleteQuestionSnackBar"
        @confirm="
          deleteQuestion(deleteSelect.name, deleteSelect.id)
          deleteQuestionSnackBar = false
        "
        @cancel="deleteQuestionSnackBar = false"
      />

      <v-snackbar
        v-model="deleteErrorAutoSnackBar"
        light
        color="red darken-2"
        right
        top
        vertical
        :timeout="15000"
      >
        <span style="color: white; font-size: 1rem">
          {{ $t('QUESTIONS.QUESTIONS.info_1') }}
          <br />
          {{ getQuestionTests }}
          <br /><br />
          {{ $t('QUESTIONS.QUESTIONS.info_2') }}
        </span>
        <template v-slot:action="{ attrs }">
          <v-btn
            dark
            color="white"
            text
            v-bind="attrs"
            @click="deleteErrorAutoSnackBar = false"
          >
            {{ $t('QUESTIONS.ANSWERS.justifications') }}
          </v-btn>
        </template>
      </v-snackbar>

      <v-snackbar
        v-model="deleteErrorSnackBar"
        light
        color="red darken-2"
        right
        top
        vertical
        :timeout="15000"
      >
        <span style="color: white; font-size: 1rem">
          {{ $t('QUESTIONS.QUESTIONS.test_1') }}
          <br />
          {{ getQuestionTests }}
          <br /><br />
          {{ $t('QUESTIONS.QUESTIONS.test_2') }}
        </span>
        <template v-slot:action="{ attrs }">
          <v-btn
            dark
            color="white"
            text
            v-bind="attrs"
            @click="deleteErrorSnackBar = false"
          >
            {{ $t('FAB.TEXT.close') }}
          </v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script>
import { mdiPlus } from '@mdi/js'

import Paginator from '../Paginator'
import QuestionsTable from './QuestionsTable'
import DeleteWarning from '../Shared/DeleteWarning'
import DeleteAlert from './DeleteAlertQuestions'
import SearchBox from '../Shared/SearchBox'
import QuestionForm from './QuestionForm'
import EditQuestion from './EditQuestion'
import PrintQuestion from './PrintQuestion'

import { analytics } from '../../api/firebase'

export default {
  name: 'Questions',
  components: {
    Paginator,
    QuestionsTable,
    DeleteWarning,
    DeleteAlert,
    SearchBox,
    QuestionForm,
    EditQuestion,
    PrintQuestion,
  },
  data() {
    return {
      plusIcon: mdiPlus,
      loadedPages: [1],
      deleteSelect: '',
      selectedEdit: {},
      questionTests: [],
      deleteConfirmed: false,
      deleteErrorSnackBar: false,
      deleteErrorAutoSnackBar: false,
      deleteQuestionSnackBar: false,
      selected: [],
      dialogNewQuestion: false,
      dialogEditQuestion: false,
      dialogPDF: false,
      showedQuestions: [],
      search: '',
      isSearching: false,
      page: 1,
      searchPage: 1,
      itemsPerPage: 8,
      selectedSubject: null,
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
    deleteMarkQuestions() {
      return this.$store.getters.getDeleteMarkQuestions
    },
    markedQuestionsByUser() {
      const isAdmin = this.userClaims && this.userClaims['admin']
      const questions = isAdmin
        ? this.deleteMarkQuestions
        : this.deleteMarkQuestions.filter(
            q => q.toDelete.userEmail === this.userInfo.email,
          )

      const names = []

      if (isAdmin) {
        names.push(...questions.filter(q => q.toDelete && q.toDelete.status))
      }

      return names.map(q => `${q.name} (${q.toDelete.userEmail})`).join(', ')
    },
    hasDeleteMarkQuestions() {
      return this.deleteMarkQuestions && this.deleteMarkQuestions.length > 0
    },
    hasTrueMarkStatus() {
      const questions = this.deleteMarkQuestions.map(q => q.toDelete.status)
      return questions.includes(true)
    },
    filteredQuestions() {
      return this.$store.getters.getFilteredQuestions
    },
    userClaims() {
      return this.$store.getters.getUserClaims
    },
    userInfo() {
      return this.$store.getters.userInfo
    },
    pageAmount() {
      const questionAmount = this.$store.getters.getDataSize.questions.general
      return Math.ceil(questionAmount / this.itemsPerPage) || 1
    },
    getQuestionTests() {
      const titles = this.questionTests.map(t => "'" + t.title + "'")
      titles.sort((t1, t2) => (t1 > t2 ? 1 : -1))
      return titles.join(', ')
    },
  },
  watch: {
    selected(val) {
      this.questions.forEach(element => {
        for (let i = 0; i < this.selected.length; i++) {
          if (element.data.DISCIPLINA == this.selected[i]) {
            let aux = true
            for (let k = 0; k < this.showedQuestions.length; k++) {
              if (element === this.showedQuestions[k]) aux = false
            }
            if (aux == true) this.showedQuestions.push(element)
          }
        }
      })
    },
    selectedSubject() {
      this.searchQuery(this.search)
    },
  },
  methods: {
    async refetch() {
      this.page = 1
      await this.$store.dispatch('refetchQuestions')

      this.deleteConfirmed = false
    },
    editQuestions(val) {
      this.selectedEdit = val
      this.dialogEditQuestion = true
    },
    generatePDF(val) {
      this.selectedEdit = val
      this.dialogPDF = true
    },
    async deleteQuestion(name, id) {
      this.deleteQuestionSnackBar = false
      this.questionTests = []

      const tests = await this.$store.dispatch('checkQuestionInTests', {
        name,
      })

      const allAuto = tests.reduce(
        (prev, curr) => curr.type === 'auto' && prev,
        true,
      )

      let error = false

      if (allAuto) {
        for (const t of tests) {
          const questionsNames = [...t.questionsNames]

          const index = questionsNames.indexOf(name)

          if (index === -1) {
            return
          }

          questionsNames.splice(index, 1)

          if (questionsNames.length < t.questionsAmount) {
            this.questionTests.push(t)
            error = true
            continue
          }

          await this.$store.dispatch('updateTest', {
            testData: { ...t, questionsNames },
            noMessage: true,
          })
        }
      }

      if (error) {
        this.deleteErrorAutoSnackBar = true
        return
      }

      if (!tests.length || allAuto) {
        this.$store.dispatch('deleteMarkQuestion', {
          id,
          isSearching: this.isSearching,
          userEmail: this.userInfo.email,
        })

        return
      }

      this.questionTests = [...tests]
      this.deleteErrorSnackBar = true
    },
    async deleteQuestions() {
      await this.$store.dispatch('changeDeleteStatusQuestions', {
        names: this.deleteMarkQuestions
          .filter(q => q.toDelete.status)
          .map(q => q.name),
        isSearching: this.isSearching,
      })

      this.$store.commit('setSuccess', 'Question successfully deleted!')
    },
    onPageChange(event) {
      if (this.isSearching) {
        return
      }

      this.$store.dispatch('loadQuestionPage', {
        page: this.page,
        itemsPerPage: this.itemsPerPage,
        mode: event.mode,
        direction: event.direction,
      })
    },
    searchTextChange(text) {
      this.search = text

      if (!text && !this.selectedSubject && this.isSearching) {
        this.isSearching = false
        this.searchPage = 1
        this.$store.commit('resetFilteredQuestions')
      } else if (!text && this.selectedSubject) {
        this.searchQuery(text)
      }
    },
    searchQuery(text) {
      this.searchPage = 1
      this.$store.commit('resetFilteredQuestions')

      if (text || this.selectedSubject) {
        this.isSearching = true
        this.$store.dispatch('searchQuestions', {
          query: text,
          subject: this.selectedSubject,
        })

        analytics.logEvent('search', {
          search_term: text,
          subject: this.selectedSubject,
        })
      } else {
        this.isSearching = false
      }
    },
    itemRowStyle(item) {
      return item.toDelete
        ? item.toDelete.status
          ? 'item-to-delete'
          : 'item-deleted'
        : ''
    },
    restoreQuestion(item) {
      this.$store.dispatch('restoreMarkedQuestion', {
        id: item.id,
        isSearching: this.isSearching,
      })
    },
    restoreAll() {
      this.$store.dispatch('restoreAllMarkedQuestions', {
        isSearching: this.isSearching,
      })
    },
  },
  mounted() {
    this.deleteConfirmed = false
    this.$store.dispatch('checkDeleteMarkQuestions')
    this.$store.dispatch('loadQuestionPage', {
      page: 1,
      itemsPerPage: this.itemsPerPage,
      mode: 'first',
    })
  },
  beforeDestroy() {
    this.search = ''
    this.isSearching = false
    this.page = 1
    this.$store.commit('resetFilteredQuestions')
    this.$store.commit('resetCurrentQuestionsPage')

    if (this.deleteConfirmed) {
      this.$store.dispatch('deleteQuestions')
      this.$store.dispatch('resetQuestions')
      this.$store.dispatch('loadDataSize')
    }
  },
}
</script>

<style>
li button.v-pagination__item:focus {
  outline: none !important;
}

.item-to-delete {
  color: #f00;
}

.item-deleted {
  color: #c4c4c4;
}
</style>
