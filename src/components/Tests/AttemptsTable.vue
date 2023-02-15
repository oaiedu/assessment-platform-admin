<template>
  <v-data-table
    hide-default-footer
    class="attempts-table"
    :no-data-text="$t('TEST.ATTEMPTS.no_attempts')"
    :headers="
      headersAttempts.map(h => ({
        ...h,
        text: $t('TEST.ATTEMPTS.HEADERS.' + h.text),
      }))
    "
    :items="attempts"
  >
    <template v-slot:[`item.index`]="{ item }">
      {{ item.index + 1 }}
    </template>

    <template v-slot:[`item.date`]="{ item }">
      {{ getDateSentence(item.date) }}
    </template>

    <template v-slot:[`item.answers`]="{ item }">
      {{ item.answers.length }}/{{ item.questions.length }}
    </template>

    <template v-slot:[`item.score`]="{ item }">
      <span
        :class="{
          'font-weight-medium': !item.score || item.score === 100,
          'green--text': item.score === 100,
          'red--text': !item.score,
        }"
      >
        {{ item.score.toFixed(2) }}%
      </span>
    </template>

    <template v-slot:[`item.timeTaken`]="{ item }">
      {{ item.timeTaken.hours }}h {{ item.timeTaken.minutes }}m
      {{ item.timeTaken.seconds }}s
    </template>

    <template v-slot:[`item.mode`]="{ item }">
      {{ $t('TEST.ATTEMPTS.MODE.' + (item.mode || 'undefined')) }}
    </template>

    <template v-slot:[`item.result`]="{ item }">
      <span
        class="font-weight-medium"
        :class="{
          'green--text': item.approved,
          'red--text': !item.approved,
        }"
      >
        {{ $t('TEST.ATTEMPTS.' + (item.approved ? 'approved' : 'failed')) }}
      </span>
    </template>

    <template v-slot:[`item.review`]="{ item }">
      <v-btn text small color="blue" @click="reviewAttempt(item)">
        {{ $t('TEST.ATTEMPTS.HEADERS.review') }}
      </v-btn>
    </template>
  </v-data-table>
</template>

<script>
import { months, weekDays } from '../../utils/date'

export default {
  name: 'AttemptsTable',
  props: {
    attempts: Array,
  },
  data() {
    return {
      headersAttempts: [
        { text: '#', value: 'index', sortable: false, align: 'center' },
        { text: 'date', value: 'date', sortable: false, align: 'center' },
        {
          text: 'answers',
          value: 'answers',
          sortable: false,
          align: 'center',
        },
        {
          text: 'score',
          value: 'score',
          sortable: false,
          align: 'center',
        },
        {
          text: 'time_taken',
          value: 'timeTaken',
          sortable: false,
          align: 'center',
        },
        { text: 'mode', value: 'mode', sortable: false, align: 'center' },
        {
          text: 'result',
          value: 'result',
          sortable: false,
          align: 'center',
        },
        { text: 'review', value: 'review', sortable: false, align: 'center' },
      ],
    }
  },
  methods: {
    getDateSentence(iso) {
      const date = new Date(iso)

      return `${this.$t(
        'SHARED.DATE.WEEKDAY.' + weekDays[date.getDay()],
      ).substring(0, 3)}, ${date.getDate()} ${this.$t(
        'SHARED.DATE.MONTH.' + months[date.getMonth()],
      ).substring(0, 3)} ${date.getFullYear()}`
    },
    reviewAttempt(item) {
      this.$emit('reviewAttempt', item)
    },
  },
}
</script>

<style scoped>
.attempts-table /deep/ tbody tr {
  transition: background-color 0.1s ease;
}

.attempts-table /deep/ tbody tr:hover {
  background-color: #f7f7f7 !important;
}
</style>
