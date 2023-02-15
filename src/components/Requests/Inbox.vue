<template>
  <div>
    <v-container>
      <v-row class="mt-10 mb-5">
        <SearchBox
          class="mx-2"
          :label="$t('QUESTIONS.search_id')"
          @enter="searchQuery($event)"
          @textChange="searchTextChange($event)"
        />

        <v-col class="ma-0 mx-2 pa-0" cols="12" md="3" lg="3" xl="2">
          <v-select
            v-model="selectedStatus"
            dense
            rounded
            outlined
            clearable
            label="Filter by status"
            item-value="value"
            item-text="label"
            :items="
              statuses.map(s => ({
                value: s,
                label: $t(`REQUESTS.STATUS.${s}`),
              }))
            "
          ></v-select>
        </v-col>
      </v-row>

      <v-container
        v-if="hasApprovedRequests && userClaims && userClaims['appraiser']"
      >
        <v-alert text prominent type="warning" color="red" :icon="mdiAlert">
          {{ $t('REQUESTS.INBOX.request') }}
        </v-alert>
      </v-container>

      <v-container
        v-if="
          hasDeleteMarkRequests &&
            userClaims &&
            userClaims['appraiser'] &&
            (markedRequestsByUser ||
              deleteMarkRequests.filter(
                r => r.toDelete.userEmail === userInfo.email,
              ))
        "
      >
        <DeleteAlert
          :confirmCondition="deleteConfirmed"
          :itemsCondition="hasTrueMarkStatus && markedRequestsByUser"
          :itemsText="$t('REQUESTS.delete_marked')"
          :items="markedRequestsByUser"
        />

        <v-row justify="start" v-if="hasTrueMarkStatus && markedRequestsByUser">
          <v-btn
            class="ml-10"
            color="red"
            dark
            @click="
              deleteConfirmed = true
              deleteRequests()
            "
          >
            {{ $t('AUTH.SUBJECT.confirm') }}
          </v-btn>
          <v-btn class="ml-3" color="grey darken-1" dark @click="restoreAll()">
            {{ $t('TEST.TESTS.restore') }}
          </v-btn>
        </v-row>
      </v-container>

      <RequestsTable
        :items="isSearching ? filteredRequests : requests"
        :page="isSearching ? searchPage : page"
        :itemsPerPage="itemsPerPage"
        :rejectLoading="rejectLoading"
        @emailClick="sendEmail($event)"
        @pdfClick="printRequest($event)"
        @checkClick="checkRequest($event)"
        @editClick="editRequest($event)"
        @rejectClick="rejectRequest($event)"
        @deleteClick="askDelete($event)"
        @restoreClick="restoreRequest($event)"
      />

      <div class="text-center pt-2">
        <Paginator
          :page="!isSearching ? page : searchPage"
          :length="
            !isSearching
              ? pageAmount
              : Math.ceil(filteredRequests.length / itemsPerPage)
          "
          @pageChange="
            !isSearching ? (page = $event.page) : (searchPage = $event.page)
            onPageChange($event)
          "
        />
      </div>

      <v-dialog
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
        v-model="dialogEditRequest"
      >
        <EditQuestion
          :question="editItem"
          :userClaims="userClaims"
          :userInfo="userInfo"
          :isSearching="isSearching"
          @closeDialogEdit="dialogEditRequest = false"
        >
        </EditQuestion>
      </v-dialog>

      <v-dialog
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
        v-model="dialogPDF"
      >
        <PrintQuestion
          :question="editItem"
          :showJustifications="true"
          @closeDialogPrint="dialogPDF = false"
        ></PrintQuestion>
      </v-dialog>

      <DeleteWarning
        :label="$t('REQUESTS.delete_confirm')"
        :state="deleteRequestSnackBar"
        @confirm="
          deleteRequest(deleteItem)
          deleteRequestSnackBar = false
        "
        @cancel="
          deleteRequestSnackBar = false
          deleteItem = null
        "
      />

      <v-snackbar
        v-model="rejectErrorSnackBar"
        light
        color="red darken-2"
        right
        top
        vertical
        :timeout="15000"
      >
        <span style="color: white; font-size: 1rem">
          {{ $t('REQUESTS.INBOX.info_1') }}
          <br />
          {{ getQuestionTests }}
          <br /><br />
          {{ $t('REQUESTS.INBOX.info_2') }}
        </span>
        <template v-slot:action="{ attrs }">
          <v-btn
            dark
            color="white"
            text
            v-bind="attrs"
            @click="rejectErrorSnackBar = false"
          >
            {{ $t('FAB.TEXT.close') }}
          </v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script>
import { mdiAlert } from '@mdi/js'

import { QuestionEntity } from '../../entities/question.entity'

import PrintQuestion from '../Questions/PrintQuestion'
import EditQuestion from '../Questions/EditQuestion'
import RequestsTable from './RequestsTable'
import Paginator from '../Paginator'
import DeleteWarning from '../Shared/DeleteWarning'
import DeleteAlert from './DeleteAlertRequests'
import SearchBox from '../Shared/SearchBox'

import { analytics } from '../../api/firebase'

export default {
  components: {
    PrintQuestion,
    EditQuestion,
    Paginator,
    RequestsTable,
    DeleteWarning,
    DeleteAlert,
    SearchBox,
  },
  data() {
    return {
      mdiAlert,
      rejectLoading: false,
      page: 1,
      pageCount: 15,
      dialogPDF: false,
      editItem: null,
      dialogEditRequest: false,
      deleteItem: null,
      deleteConfirmed: false,
      deleteRequestSnackBar: false,
      isSearching: false,
      searchPage: 1,
      itemsPerPage: 8,
      questionTests: [],
      rejectErrorSnackBar: false,
      statuses: ['0-pendant', '1-rejected', '2-approved'],
      selectedStatus: null,
    }
  },
  computed: {
    loading() {
      return this.$store.getters.loading
    },
    requests() {
      return this.$store.getters.getCurrentRequestsPage
    },
    deleteMarkRequests() {
      return this.$store.getters.getDeleteMarkRequests
    },
    markedRequestsByUser() {
      if (this.hasDeleteMarkRequests) {
        const requests = this.deleteMarkRequests.filter(
          r => r.toDelete.userEmail === this.userInfo.email,
        )

        const names = requests.filter(r => r.toDelete && r.toDelete.status)

        return names.map(r => r.name).join(', ')
      } else {
        return []
      }
    },
    hasDeleteMarkRequests() {
      return this.deleteMarkRequests && this.deleteMarkRequests.length > 0
    },
    hasTrueMarkStatus() {
      const requests = this.deleteMarkRequests.map(q => q.toDelete.status)
      return requests.includes(true)
    },
    filteredRequests() {
      return this.$store.getters.getFilteredRequests
    },
    userClaims() {
      return this.$store.getters.getUserClaims
    },
    userInfo() {
      return this.$store.getters.userInfo
    },
    hasApprovedRequests() {
      let itHas = false
      this.requests.forEach(request => {
        if (request.status === '2-approved') {
          itHas = true
        }
      })
      return itHas
    },
    pageAmount() {
      const requestAmount = this.$store.getters.getDataSize['question-requests']

      const amount =
        this.userClaims && this.userClaims['admin']
          ? requestAmount.general
          : requestAmount.users[this.userInfo.id]

      return Math.ceil(amount / this.itemsPerPage) || 1
    },
    getQuestionTests() {
      const titles = this.questionTests.map(t => "'" + t.title + "'")
      titles.sort((t1, t2) => (t1 > t2 ? 1 : -1))
      return titles.join(', ')
    },
  },
  methods: {
    sendEmail(email) {
      const a = document.createElement('a')
      a.href = 'mailto:' + email
      a.click()
      a.remove()
    },
    printRequest(request) {
      this.dialogPDF = true
      this.editItem = request
    },
    deleteRequest(request) {
      this.deleteRequestSnackBar = false
      this.deleteItem = null
      this.$store.dispatch('deleteMarkRequest', {
        id: request.id,
        isSearching: this.isSearching,
        userEmail: this.userInfo.email,
      })
    },
    deleteRequests() {
      const requests = this.deleteMarkRequests

      this.$store.dispatch('changeDeleteStatusRequests', {
        names: requests
          .filter(
            r =>
              r.toDelete.status && r.toDelete.userEmail === this.userInfo.email,
          )
          .map(r => r.name),
        isSearching: this.isSearching,
      })
    },
    checkRequest(request) {
      const toCreate = new QuestionEntity({
        ...request,
        created: null,
        updated: null,
        toDelete: null,
      })

      this.$store
        .dispatch('getQuestionByName', request.name)
        .then(fQuestion => {
          if (fQuestion && fQuestion.toDelete) {
            this.$store
              .dispatch('restoreMarkedQuestion', {
                id: fQuestion.id,
                isSearching: false,
                isRequest: true,
              })
              .then(() => {
                this.$store.dispatch('updateQuestionRequest', {
                  mode: 'sttUpdate',
                  status: '2-approved',
                  request,
                  isSearching: this.isSearching,
                })
                this.$store.commit(
                  'setSuccess',
                  'Request successfully approved!',
                )
              })
          } else {
            this.$store
              .dispatch('createQuestion', {
                question: toCreate,
                isRequest: true,
              })
              .then(async () => {
                await this.$store.dispatch('updateQuestionRequest', {
                  mode: 'sttUpdate',
                  status: '2-approved',
                  request,
                  isSearching: this.isSearching,
                })
                this.$store.commit(
                  'setSuccess',
                  'Request successfully approved!',
                )
              })
          }
        })
    },
    editRequest(request) {
      this.dialogEditRequest = true
      this.editItem = request
    },
    askDelete(request) {
      this.deleteRequestSnackBar = true
      this.deleteItem = request
    },
    async rejectRequest(request) {
      this.rejectLoading = true

      this.questionTests = []

      const tests = await this.$store.dispatch('checkQuestionInTests', {
        name: request.name,
      })

      const allAuto = tests.reduce(
        (prev, curr) => curr.type === 'auto' && prev,
        true,
      )

      let error = false

      if (allAuto) {
        for (const t of tests) {
          const questionsNames = [...t.questionsNames]

          const index = questionsNames.indexOf(request.name)

          if (index === -1) {
            this.rejectLoading = false
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
        this.rejectErrorSnackBar = true
        this.rejectLoading = false
        return
      }

      if (!tests.length || allAuto) {
        await this.$store.dispatch('changeDeleteStatusQuestions', {
          names: [request.name],
          isSearching: false,
        })

        await this.$store.dispatch('updateQuestionRequest', {
          mode: 'sttUpdate',
          status: '1-rejected',
          request,
          isSearching: this.isSearching,
        })

        this.rejectLoading = false
        this.$store.commit('setSuccess', 'Request successfully rejected!')

        return
      }

      this.rejectLoading = false
      this.questionTests = [...tests]
      this.rejectErrorSnackBar = true
    },
    onPageChange(event) {
      if (this.isSearching) {
        return
      }

      const payload = {
        page: this.page,
        itemsPerPage: this.itemsPerPage,
        mode: event.mode,
        direction: event.direction,
        claims: this.userClaims,
        userInfo: this.userInfo,
      }

      this.$store.dispatch('loadRequestPage', payload)
    },
    searchTextChange(text) {
      this.search = text

      if (!text && !this.selectedStatus && this.isSearching) {
        this.isSearching = false
        this.searchPage = 1
        this.$store.commit('resetFilteredRequests')
      } else if (!text && this.selectedStatus) {
        this.searchQuery(text)
      }
    },
    searchQuery(text) {
      this.searchPage = 1
      this.$store.commit('resetFilteredRequests')

      if (text || this.selectedStatus) {
        this.isSearching = true
        this.$store.dispatch('searchRequests', {
          key: text,
          claims: this.userClaims,
          userInfo: this.userInfo,
          status: this.selectedStatus,
        })

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
    restoreRequest(item) {
      this.$store.dispatch('restoreMarkedRequest', {
        id: item.id,
        isSearching: this.isSearching,
      })
    },
    restoreAll() {
      this.$store.dispatch('restoreAllMarkedRequests', {
        user: this.userInfo,
        isSearching: this.isSearching,
      })
    },
  },
  watch: {
    selectedStatus() {
      this.searchQuery(this.search)
    },
  },
  async mounted() {
    this.deleteConfirmed = false

    this.$store.dispatch('checkDeleteMarkRequests')

    await this.$store.dispatch('loadRequestPage', {
      page: 1,
      itemsPerPage: this.itemsPerPage,
      mode: 'first',
      claims: this.userClaims,
      userInfo: this.userInfo,
    })

    const id = this.$route.params.id

    if (!id) {
      return
    }

    const request = await this.$store.dispatch('getRequestById', id)

    if (!request) {
      return
    }

    if (this.userClaims['admin']) {
      return this.printRequest(request)
    }

    this.editRequest(request)
  },
  beforeDestroy() {
    if (
      this.userClaims &&
      this.userClaims['appraiser'] &&
      this.hasApprovedRequests
    ) {
      this.$store.dispatch('deleteApprovedRequests', {
        userInfo: this.userInfo,
      })
    }

    if (this.deleteConfirmed) {
      this.$store.dispatch('deleteRequests')
      this.$store.dispatch('resetRequests')
      this.$store.dispatch('loadDataSize')
    }
  },
}
</script>

<style scoped>
.snackbar-text {
  color: black;
  font-size: 1rem;
}

.item-to-delete {
  color: #f00;
}

.item-deleted {
  color: #c4c4c4;
}
</style>
