<template>
  <v-card outlined width="100%" height="100%" class="tests-table">
    <v-data-table
      hide-default-footer
      class="dashboard-tests-table"
      height="100%"
      style="height: calc(100% - 52px) !important;"
      :loading-text="$t('TEST.loading_quizzes')"
      :no-data-text="$t('TEST.no_quizzes')"
      :headers="
        headers.map(h => ({
          ...h,
          text: $t('DASHBOARD.TESTS_TABLE.HEADERS.' + h.text),
        }))
      "
      :items="tests"
      :loading="loading"
      :item-class="itemRowStyle"
      @click:row="onRowClick"
    >
      <template v-slot:top>
        <v-toolbar dense flat color="white" class="mt-1">
          <h1 class="table-title">
            {{ $t('DASHBOARD.TESTS_TABLE.recent_quizzes') }}
          </h1>
        </v-toolbar>

        <div class="title-divider" />
      </template>

      <template v-slot:[`item.type`]="{ item }">
        <div class="type-container">
          <div
            class="icon-container"
            :style="{ backgroundColor: getItemIconColor(item) + '44' }"
          >
            <v-icon
              v-if="item.type === 'selected'"
              size="20"
              :color="getItemIconColor(item)"
              >{{ mdiCheckboxMultipleMarked }}</v-icon
            >

            <v-icon
              v-else-if="item.type === 'random'"
              size="20"
              :color="getItemIconColor(item)"
            >
              {{ mdiShuffleVariant }}
            </v-icon>

            <v-icon v-else size="20" :color="getItemIconColor(item)">
              {{ mdiArrowDecisionAutoOutline }}
            </v-icon>
          </div>

          <span class="type-text">
            {{ $t('TEST.TYPE.' + item.type) }}
          </span>
        </div>
      </template>

      <template v-slot:[`item.level`]="{ item }">
        <span
          class="font-weight-medium"
          :class="getLevel(item).color + '--text'"
        >
          <v-icon size="20" class="mr-1" :color="getLevel(item).color">{{
            mdiDumbbell
          }}</v-icon>

          {{ $t('TEST.LEVEL.' + getLevel(item).label) }}
        </span>
      </template>

      <template v-slot:[`item.updated`]="{ item }">
        {{ formatDate(item.updated) }}
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import {
  mdiCheckboxMultipleMarked,
  mdiShuffleVariant,
  mdiArrowDecisionAutoOutline,
  mdiDumbbell,
} from '@mdi/js'

import { analytics } from '../../api/firebase'

export default {
  name: 'TestsTable',
  data() {
    return {
      headers: [
        { text: 'title', sortable: false, value: 'title', align: 'center' },
        { text: 'type', sortable: false, value: 'type', align: 'center' },
        {
          text: 'questions_amount',
          sortable: false,
          value: 'questionsAmount',
          align: 'center',
        },
        { text: 'level', sortable: false, value: 'level', align: 'center' },
        {
          text: 'last_update',
          sortable: false,
          value: 'updated',
          align: 'center',
        },
      ],
      mdiCheckboxMultipleMarked,
      mdiShuffleVariant,
      mdiArrowDecisionAutoOutline,
      mdiDumbbell,
    }
  },
  computed: {
    tests() {
      return this.$store.getters.getLastTests
    },
    loading() {
      return this.$store.getters.loading
    },
    months() {
      return this.$store.getters.getMonths
    },
    userClaims() {
      return this.$store.getters.getUserClaims
    },
    className() {
      return this.userClaims
        ? Object.entries(this.userClaims).filter(role => role[1])[0][0]
        : ''
    },
  },
  methods: {
    getLevel(item) {
      const level = item.level.index

      switch (level) {
        case 0:
          return {
            label: 'beginner',
            color: 'green',
          }
        case 1:
          return {
            label: 'intermediary',
            color: 'blue',
          }
        case 2:
          return {
            label: 'advanced',
            color: 'orange',
          }
        case 3:
          return {
            label: 'expert',
            color: 'red',
          }
      }
    },
    getItemIconColor(item) {
      if (item.toDelete) {
        if (item.toDelete.status) {
          return '#ff0000'
        } else {
          return '#c4c4c4'
        }
      }
      return item.type === 'random' ? '#2196F3' : '#6755FA'
    },
    itemRowStyle(item) {
      return item.toDelete
        ? item.toDelete.status
          ? 'item-to-delete'
          : 'item-deleted'
        : 'item-active ' + this.className
    },
    formatDate(date) {
      const year = date.substr(0, 4)
      const month = date.substr(5, 2)
      const day = date.substr(8, 2)

      const today = new Date()
      const testDate = new Date(`${month}/${day}/${year}`)

      const diffDays = Math.floor(
        Math.abs(today - testDate) / (1000 * 60 * 60 * 24),
      )

      const testTime = date
        .split('T')[1]
        .split('.')[0]
        .substr(0, 5)

      if (diffDays === 0) {
        return `${this.$t('SHARED.DATE.today_at')} ${testTime}`
      } else if (diffDays === 1) {
        return `${this.$t('SHARED.DATE.yesterday_at')} ${testTime}`
      } else {
        return `${this.$t(
          'SHARED.DATE.MONTH.' + this.months[parseInt(month)],
        ).substr(0, 3)} ${day} ${year}`
      }
    },
    onRowClick(item) {
      if (this.userClaims['appraiser']) {
        return
      }

      analytics.logEvent('select_item', {
        item_list_name: item.title,
        item_list_id: item.id,
        items: [item],
      })

      this.$router.push('/quizzes/' + item.id)
    },
  },
  created() {
    if (this.userClaims && this.userClaims['student']) {
      this.$store.dispatch('loadLastTests', 10)
    } else {
      this.$store.dispatch('loadLastTests', 5)
    }
  },
}
</script>

<style scoped>
.icon-container {
  display: flex;
  justify-content: center;
  align-items: center;

  height: 30px;
  width: 30px;

  border-radius: 60px;
  margin-right: 5px;

  animation: animate-icon 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.tests-table {
  border-radius: 26px;
  overflow: hidden;
}

.table-title {
  color: #555;
  font-size: 1.2rem;
  font-weight: 500;
}

.title-divider {
  height: 1px;
  width: 100%;

  background-color: #6755fa44;
}

.type-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}

@keyframes animate-icon {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}
</style>

<style>
.dashboard-tests-table .item-to-delete {
  color: #f00;
  background-color: white !important;
}

.dashboard-tests-table .item-deleted {
  color: #c4c4c4;
  background-color: white !important;
}

.dashboard-tests-table .item-active.admin,
.dashboard-tests-table .item-active.student {
  cursor: pointer !important;
}
</style>
