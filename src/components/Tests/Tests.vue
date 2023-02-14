<template>
  <div>
    <v-container>
      <v-container class="mt-10 mb-5">
        <SearchBox
          :label="$t('TEST.search_title')"
          @enter="searchQuery($event)"
          @textChange="searchTextChange($event)"
        />
      </v-container>

      <v-container
        v-if="
          hasDeleteMarkTests &&
            ((userClaims && userClaims['admin']) ||
              (markedTestsByUser && markedTestsByUser.length > 0) ||
              deleteMarkTests.filter(
                t => userInfo && t.toDelete.userEmail === userInfo.email,
              ).length > 0)
        "
      >
        <DeleteAlert
          :confirmCondition="deleteConfirmed"
          :itemsCondition="hasTrueMarkStatus"
          :itemsText="$t('TEST.delete_marked')"
          :items="markedTestsByUser"
          :isAdmin="userClaims && userClaims['admin']"
          :adminItems="markedTestsAdmin"
        />

        <v-row
          justify="start"
          v-if="
            hasTrueMarkStatus &&
              ((userClaims && userClaims['admin']) || markedTestsByUser)
          "
        >
          <v-btn
            class="ml-10"
            color="red"
            :dark="
              !(
                userClaims &&
                userClaims['admin'] &&
                markedTestsAdmin.length === 0
              )
            "
            :disabled="
              userClaims && userClaims['admin'] && markedTestsAdmin.length === 0
            "
            @click="
              deleteConfirmed = true
              deleteTests(false)
            "
          >
            {{
              userClaims && userClaims['admin'] ? 'Confirmar Meus' : 'Confirmar'
            }}
          </v-btn>
          <v-btn
            v-if="userClaims && userClaims['admin']"
            class="ml-3"
            color="red"
            dark
            @click="
              deleteConfirmed = true
              deleteTests(true)
            "
          >
            {{ $t('AUTH.SUBJECT.confirm_all') }}
          </v-btn>
          <v-btn
            class="ml-3"
            color="grey darken-1"
            :dark="
              !(
                userClaims &&
                userClaims['admin'] &&
                markedTestsAdmin.length === 0
              )
            "
            :disabled="
              userClaims && userClaims['admin'] && markedTestsAdmin.length === 0
            "
            @click="restoreAll(false)"
          >
            {{
              userClaims && userClaims['admin'] ? 'Restaurar Meus' : 'Restaurar'
            }}
          </v-btn>
          <v-btn
            v-if="userClaims && userClaims['admin']"
            class="ml-3"
            color="grey darken-1"
            dark
            @click="restoreAll(true)"
          >
            {{ $t('TEST.TESTS.restore_all') }}
          </v-btn>
        </v-row>
      </v-container>

      <TestsTable
        :items="isSearching ? filteredTests : tests"
        :page="isSearching ? searchPage : page"
        :itemsPerPage="itemsPerPage"
        @doExam="
          generatedTest = $event
          dialogExam = true
        "
        @editClick="
          dialogEditTest = true
          selectedTest = $event
        "
        @deleteClick="
          deleteTestSnackBar = true
          deleteSelect = $event
        "
        @restoreClick="restoreTest($event)"
      />

      <v-tooltip left>
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            fixed
            dark
            fab
            bottom
            right
            color="blue"
            @click.stop="
              userClaims && !userClaims['student']
                ? (dialogTestForm = true)
                : (dialogGenerateTest = true)
            "
          >
            <v-icon>{{
              userClaims && !userClaims['student'] ? mdiPlus : mdiTextBoxPlus
            }}</v-icon>
          </v-btn>
        </template>
        <span>{{
          userClaims && !userClaims['student']
            ? $t('FAB.CREATE.new_quiz')
            : $t('TEST.GENERATE_CARD.generate_new')
        }}</span>
      </v-tooltip>

      <v-dialog v-model="dialogGenerateTest" width="500px" persistent>
        <GenerateCard
          @generated="generateExam($event)"
          @closeDialog="dialogGenerateTest = false"
        ></GenerateCard>
      </v-dialog>

      <v-dialog
        v-model="dialogTestForm"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
      >
        <TestForm
          v-if="dialogTestForm"
          @testCreated="refetch()"
          @closeDialogNew="dialogTestForm = false"
        ></TestForm>
      </v-dialog>

      <v-dialog
        v-model="dialogEditTest"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
      >
        <TestForm
          v-if="dialogEditTest"
          :test="selectedTest"
          :searching="isSearching"
          @closeDialogNew="dialogEditTest = false"
          @updateTest="updateTest($event)"
        ></TestForm>
      </v-dialog>

      <div class="text-center pt-2">
        <Paginator
          :page="!isSearching ? page : searchPage"
          :length="
            !isSearching
              ? pageAmount
              : Math.ceil(filteredTests.length / itemsPerPage)
          "
          @pageChange="
            !isSearching ? (page = $event.page) : (searchPage = $event.page)
            onPageChange($event)
          "
        />
      </div>

      <DeleteWarning
        :label="$t('TEST.delete_confirm')"
        :state="deleteTestSnackBar"
        @confirm="
          deleteTest(deleteSelect.id)
          deleteTestSnackBar = false
        "
        @cancel="deleteTestSnackBar = false"
      />
    </v-container>
  </div>
</template>

<script>
import { mdiPlus, mdiTextBoxPlus } from '@mdi/js'

import GenerateCard from './GenerateCard'
import TestForm from './TestForm'
import Paginator from '../Paginator'
import TestsTable from './TestsTable'
import DeleteWarning from '../Shared/DeleteWarning'
import DeleteAlert from './DeleteAlertTests'
import SearchBox from '../Shared/SearchBox'

import { TestEntity } from '../../entities/test.entity'

import { analytics } from '../../api/firebase'

export default {
  name: 'Tests',
  components: {
    GenerateCard,
    TestForm,
    Paginator,
    TestsTable,
    DeleteWarning,
    DeleteAlert,
    SearchBox,
  },
  data() {
    return {
      mdiPlus,
      mdiTextBoxPlus,
      isSearching: false,
      deleteConfirmed: false,
      deleteTestSnackBar: false,
      dialogTestForm: false,
      dialogEditTest: false,
      dialogGenerateTest: false,
      page: 1,
      searchPage: 1,
      itemsPerPage: 10,
      selectedTest: null,
      generatedTest: null,
    }
  },
  computed: {
    loading() {
      return this.$store.getters.loading
    },
    tests() {
      return this.$store.getters.getCurrentTestsPage
    },
    deleteMarkTests() {
      return this.$store.getters.getDeleteMarkTests
    },
    markedTestsAdmin() {
      const tests = this.deleteMarkTests.filter(
        t => this.userInfo && t.toDelete.userEmail === this.userInfo.email,
      )
      const titles = tests.filter(t => t.toDelete && t.toDelete.status)
      return titles.map(t => t.title).join(', ')
    },
    markedTestsByUser() {
      const isAdmin = this.userClaims && this.userClaims['admin']
      const tests = isAdmin
        ? this.deleteMarkTests
        : this.deleteMarkTests.filter(
            t => this.userInfo && t.toDelete.userEmail === this.userInfo.email,
          )

      const titles = []

      titles.push(...tests.filter(t => t.toDelete && t.toDelete.status))

      return titles
        .map(t => (isAdmin ? `${t.title} (${t.toDelete.userEmail})` : t.title))
        .join(', ')
    },
    hasDeleteMarkTests() {
      return this.deleteMarkTests && this.deleteMarkTests.length > 0
    },
    hasTrueMarkStatus() {
      const tests = this.deleteMarkTests.map(t => t.toDelete.status)
      return tests.includes(true)
    },
    filteredTests() {
      return this.$store.getters.getFilteredTests
    },
    userClaims() {
      return this.$store.getters.getUserClaims
    },
    userInfo() {
      return this.$store.getters.userInfo
    },
    pageAmount() {
      const testsAmount = this.$store.getters.getDataSize.tests
      return Math.ceil(testsAmount / this.itemsPerPage) || 1
    },
  },
  methods: {
    async refetch() {
      this.page = 1
      await this.$store.dispatch('refetchTests')

      this.deleteConfirmed = false
    },
    generateExam(data) {
      const test = new TestEntity({
        id: 'generated',
        title: 'Questionário de treino',
        type: 'auto',
        level: data.level,
        instructions:
          'Esse questionário é apenas para <b>treino</b> e <b>não</b> ficará em seu histórico de tentativas.',
        questions: data.questions,
        questionsAmount: data.questions.length,
        questionsNames: data.questions.map(q => q.name),
        approvalPercentage: 50,
        unlimitedTime: data.unlimitedTime,
        time: data.time,
        userId: this.userInfo.id,
        userAttempts: [],
      })

      this.$router.push({
        name: 'quiz.details',
        params: {
          id: 'generated',
          test,
          mode: 'practice',
        },
      })
    },
    deleteTest(id) {
      this.deleteTestSnackBar = false
      this.$store.dispatch('deleteMarkTest', {
        id,
        isSearching: this.isSearching,
        userEmail: this.userInfo.email,
      })
    },
    deleteTests(all) {
      const tests = this.deleteMarkTests
      tests.forEach(test => {
        if (
          test.toDelete.status &&
          (this.userInfo.email === test.toDelete.userEmail || all)
        ) {
          this.$store.dispatch('changeDeleteStatusTests', {
            id: test.id,
            isSearching: this.isSearching,
          })
        }
      })
    },
    onPageChange(event) {
      const payload = {
        page: this.page,
        itemsPerPage: this.itemsPerPage,
      }

      if (this.isSearching) {
        return
      }

      if (!event.mode) {
        return void this.$store.dispatch('loadTestPage', {
          ...payload,
          direction: event.direction,
        })
      }

      this.$store.dispatch('loadTestPage', {
        ...payload,
        mode: event.mode,
      })
    },
    searchTextChange(text) {
      if ((text === null || text.length === 0) && this.isSearching) {
        this.isSearching = false
        this.searchPage = 1
        this.$store.commit('resetFilteredTests')
      }
    },
    searchQuery(text) {
      this.searchPage = 1
      this.$store.commit('resetFilteredTests')

      if (text && text.length > 0) {
        this.isSearching = true
        this.$store.dispatch('searchTests', text)

        analytics.logEvent('search', {
          search_term: text,
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
    restoreTest(item) {
      this.$store.dispatch('restoreMarkedTest', {
        id: item.id,
        isSearching: this.isSearching,
      })
    },
    restoreAll(all) {
      this.$store.dispatch('restoreAllMarkedTests', {
        all,
        user: this.userInfo,
        isSearching: this.isSearching,
      })
    },
  },
  mounted() {
    this.deleteConfirmed = false
    this.$store.dispatch('checkDeleteMarkTests')
    this.$store.dispatch('loadTestPage', {
      page: 1,
      itemsPerPage: this.itemsPerPage,
      mode: 'first',
    })
  },
  beforeDestroy() {
    this.search = ''
    this.isSearching = false
    this.page = 1
    this.$store.commit('resetFilteredTests')
    this.$store.commit('resetCurrentTestsPage')

    if (this.deleteConfirmed) {
      this.$store.dispatch('deleteTests')
      this.$store.dispatch('resetTests')
      this.$store.dispatch('loadDataSize')
    }
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
