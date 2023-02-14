<template>
  <v-container>
    <v-card outlined style="border-radius: 26px; overflow: hidden">
      <v-data-table
        hide-default-footer
        :no-data-text="$t('TEST.no_quizzes')"
        :loading-text="$t('TEST.loading_quizzes')"
        :headers="
          headers.map(h => ({
            ...h,
            text: h.text ? $t('TEST.TESTS_TABLE.HEADERS.' + h.text) : '',
          }))
        "
        :items="items"
        :page="page"
        :items-per-page="itemsPerPage"
        :loading="loading"
        :item-class="itemRowStyle"
      >
        <template v-slot:[`header.actions`]="{ header }">
          <v-row justify="center" class="ma-0 pa-0" style="width: 100px">
            {{ header.text }}
          </v-row>
        </template>

        <template v-slot:[`item.info`]="{ item }">
          <v-row class="test-info" justify="end">
            <span class="grey--text text--darken-2 font-weight-medium">
              <v-icon color="grey--darken-1">{{ mdiClipboardText }}</v-icon>

              {{ item.questionsAmount }}
            </span>

            <span class="grey--text text--darken-2 font-weight-medium ml-4">
              <v-icon color="grey--darken-1">{{ mdiClockOutline }}</v-icon>

              {{ getTime(item) }}
            </span>

            <v-divider vertical class="mx-4 my-0 pa-0"></v-divider>

            <span
              class="font-weight-medium"
              :class="getAttemptData(item).color + '--text'"
            >
              <v-icon :color="getAttemptData(item).color">{{
                getAttemptData(item).icon
              }}</v-icon>

              {{ getAttemptSentence(item) }}
            </span>
          </v-row>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-row
            v-if="!item.toDelete"
            class="ma-0 pa-0"
            justify="center"
            style="width: 100px"
          >
            <v-btn
              v-if="userClaims && userClaims['student']"
              rounded
              dark
              height="34px"
              width="100px"
              elevation="0"
              color="indigo lighten-2"
              @click="doExam(item)"
            >
              {{ $t('TEST.TESTS_TABLE.view') }}
            </v-btn>

            <v-tooltip top v-if="userClaims && !userClaims['student']">
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-on="on"
                  v-bind="attrs"
                  color="indigo lighten-2"
                  class="ml-2"
                  @click="doExam(item)"
                >
                  {{ mdiFileCompare }}
                </v-icon>
              </template>
              <span>{{ $t('TEST.TESTS_TABLE.view_quiz') }}</span>
            </v-tooltip>

            <v-tooltip top v-if="userClaims && !userClaims['student']">
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-on="on"
                  v-bind="attrs"
                  color="orange"
                  class="ml-2"
                  @click="onEditClick(item)"
                >
                  {{ mdiPencil }}
                </v-icon>
              </template>
              <span>{{ $t('REQUESTS.TABLE.edit') }}</span>
            </v-tooltip>

            <v-tooltip top v-if="userClaims && !userClaims['student']">
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-on="on"
                  v-bind="attrs"
                  color="red"
                  class="ml-2"
                  @click="onDeleteClick(item)"
                >
                  {{ mdiDelete }}
                </v-icon>
              </template>
              <span>{{ $t('TEST.TESTS_TABLE.delete') }}</span>
            </v-tooltip>
          </v-row>

          <v-row
            v-else-if="item.toDelete && item.toDelete.status"
            class="ma-0 ml-1 pa-0"
            justify="center"
            style="width: 100px"
          >
            <v-btn
              style="padding: 0 !important; font-weight: bold !important;"
              color="red"
              text
              :disabled="
                userClaims && item.toDelete.userEmail !== userInfo.email
              "
              @click="onRestoreClick(item)"
            >
              {{
                $t(
                  'TEST.' +
                    (userClaims && item.toDelete.userEmail !== userInfo.email
                      ? 'unavailable'
                      : 'restore'),
                )
              }}
            </v-btn>
          </v-row>

          <v-row
            v-else
            class="ma-0 ml-1 pa-0"
            justify="center"
            style="width: 100px"
          >
            <v-btn
              style="padding: 0 !important; font-weight: bold !important;"
              disabled
              text
            >
              {{ $t('TEST.TESTS_TABLE.deleted') }}
            </v-btn>
          </v-row>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import {
  mdiFileCompare,
  mdiPencil,
  mdiDelete,
  mdiCheckCircle,
  mdiCloseCircle,
  mdiCancel,
  mdiClockOutline,
  mdiClipboardText,
  mdiDumbbell,
} from '@mdi/js'

import { analytics } from '../../api/firebase'

export default {
  name: 'TestsTable',
  props: ['items', 'itemsPerPage', 'page'],
  data() {
    return {
      mdiFileCompare,
      mdiPencil,
      mdiDelete,
      mdiCheckCircle,
      mdiCloseCircle,
      mdiCancel,
      mdiClockOutline,
      mdiClipboardText,
      mdiDumbbell,
      headers: [
        { text: 'title', align: 'start', value: 'title' },
        {
          text: '',
          align: 'right',
          value: 'info',
          sortable: false,
        },
        {
          text: 'actions',
          align: 'center',
          value: 'actions',
          sortable: false,
          class: 'test-actions',
        },
      ],
    }
  },
  computed: {
    loading() {
      return this.$store.getters.loading
    },
    userClaims() {
      return this.$store.getters.getUserClaims
    },
    userInfo() {
      return this.$store.getters.userInfo
    },
  },
  methods: {
    getAttemptData(item) {
      const attempts = this.getUserAttempts(item)

      if (!attempts) {
        return {
          color: 'grey',
          icon: this.mdiCancel,
        }
      }

      if (this.hasApprovedAttempt(item)) {
        return {
          color: 'green',
          icon: this.mdiCheckCircle,
        }
      }

      return {
        color: 'red',
        icon: this.mdiCloseCircle,
      }
    },
    getAttemptSentence(item) {
      const attempts = this.getUserAttempts(item)

      if (!attempts) {
        return this.$t('TEST.TESTS_TABLE.no_attempts')
      }

      return (
        attempts +
        ' ' +
        this.$t('TEST.TESTS_TABLE.attempt') +
        (attempts !== 1 ? 'S' : '')
      )
    },
    getUserAttempts(item) {
      let attempts = 0

      if (this.userInfo && this.userInfo.attempts) {
        this.userInfo.attempts.forEach(a => {
          if (a.quizId === item.id) {
            attempts++
          }
        })
      }

      return attempts
    },
    hasApprovedAttempt(item) {
      let has = false

      if (!this.userInfo || !this.userInfo.attempts) {
        return false
      }

      for (const attempt of this.userInfo.attempts) {
        if (attempt.quizId === item.id && attempt.approved) {
          has = true
          break
        }
      }

      return has
    },
    getTime(item) {
      return item.unlimitedTime
        ? this.$t('TEST.QUIZ.unlimited')
        : `${item.time.hours}h ${item.time.minutes}m ${item.time.seconds}s`
    },
    itemRowStyle(item) {
      return item.toDelete
        ? item.toDelete.status
          ? 'item-to-delete'
          : 'item-deleted'
        : ''
    },
    onEditClick(item) {
      this.$emit('editClick', item)
    },
    onDeleteClick(item) {
      this.$emit('deleteClick', item)
    },
    onRestoreClick(item) {
      this.$emit('restoreClick', item)
    },
    doExam(item) {
      analytics.logEvent('select_item', {
        item_list_name: item.title,
        item_list_id: item.id,
        items: [item],
      })

      this.$router.push('/quizzes/' + item.id)
    },
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

th.test-actions {
  width: 100px;
}

.test-info {
  font-size: 0.9rem;
}
</style>
