<template>
  <v-container
    class="pa-0 ma-0"
    :class="{ 'px-2': windowWidth <= 390, 'px-4': windowWidth > 390 }"
    style="max-width: unset; min-height: 100%; background: #efefef"
  >
    <v-row class="pa-4 ma-0">
      <a @click="$router.push('/')">{{ $t('TEST.QUIZ.home') }}</a>

      <span class="mx-3 slash">/</span>

      <a @click="$router.push('/quizzes')">{{ $t('TEST.QUIZ.quizzes_t') }}</a>

      <span class="mx-3 slash">/</span>

      <a>{{ $t('TEST.QUIZ.quiz_info') }}</a>
    </v-row>

    <v-card flat width="100%">
      <v-card-title class="ma-0 pa-2 py-4">
        <v-icon x-large color="blue">{{ mdiFileDocumentOutline }}</v-icon>

        <span class="ml-3">
          <div class="quiz-detail__level">
            {{ $t('TEST.QUIZ.level') }}:
            {{
              test
                ? $t('TEST.LEVEL.' + getLevel(test).label)
                : $t('TEST.unavailable')
            }}
          </div>

          <div class="quiz-detail__title ma-0 mt-2 pa-0">
            {{ test ? test.title : $t('TEST.QUIZ.quiz_t') }}
          </div>
        </span>
      </v-card-title>
    </v-card>

    <v-card flat class="mt-4" width="100%">
      <v-row
        class="pa-0 ma-0 quiz-detail__detail-row"
        style="flex-wrap: nowrap"
      >
        <div class="quiz-detail__detail-column info-column">
          <span class="quiz-detail__info-title">{{
            $t('TEST.QUIZ.info')
          }}</span>

          <div class="quiz-detail__info-container">
            <div class="quiz-detail__info-column">
              <div class="quiz-detail__info">
                <div
                  class="quiz-detail__info-icon"
                  style="background: #9455FA33"
                >
                  <v-icon size="26" color="#9455FA">{{ mdiHelp }}</v-icon>
                </div>

                <div class="quiz-detail__info-stats">
                  <span class="quiz-detail__amount">{{
                    test ? test.questionsAmount : 0
                  }}</span>
                  <span class="quiz-detail__label">{{
                    $t('TEST.QUIZ.questions')
                  }}</span>
                </div>
              </div>

              <div class="quiz-detail__info">
                <div
                  class="quiz-detail__info-icon"
                  style="background: #FF559933"
                >
                  <v-icon size="26" color="#FF5599">{{ mdiBallot }}</v-icon>
                </div>

                <div class="quiz-detail__info-stats">
                  <span class="quiz-detail__amount">{{
                    test ? getSubjectsAmount(test) : 0
                  }}</span>
                  <span class="quiz-detail__label">{{
                    $t('TEST.QUIZ.subjects')
                  }}</span>
                </div>
              </div>
            </div>

            <div class="quiz-detail__info-column">
              <div class="quiz-detail__info">
                <div
                  class="quiz-detail__info-icon"
                  style="background: #FFAD3333"
                >
                  <v-icon size="26" color="#FFAD33">{{
                    mdiClockOutline
                  }}</v-icon>
                </div>

                <div class="quiz-detail__info-stats">
                  <span class="quiz-detail__amount">{{
                    test ? getTime(test) : 0
                  }}</span>
                  <span class="quiz-detail__label">{{
                    $t('PROFILE.DATA_INFO.time')
                  }}</span>
                </div>
              </div>

              <div class="quiz-detail__info">
                <div
                  class="quiz-detail__info-icon"
                  style="background: #81C49333"
                >
                  <v-icon size="26" color="#81C493">{{
                    mdiThumbUpOutline
                  }}</v-icon>
                </div>

                <div class="quiz-detail__info-stats">
                  <span class="quiz-detail__amount"
                    >{{ test ? test.approvalPercentage : 0 }}%</span
                  >
                  <span class="quiz-detail__label">{{
                    $t('TEST.QUIZ_DETAILS.for_approval')
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <v-btn
            dark
            rounded
            height="40px"
            class="mt-3"
            color="blue"
            elevation="0"
            @click="startDialog = true"
          >
            {{ $t('TEST.GENERATE_CARD.start') }}
            {{ windowWidth > 320 ? $t('TEST.QUIZ.quiz') : '' }}
          </v-btn>
        </div>

        <v-divider class="mx-0" :vertical="windowWidth > 700"></v-divider>

        <div class="quiz-detail__detail-column instructions-column">
          <span class="quiz-detail__info-title">{{
            $t('TEST.QUIZ_DETAILS.instructions')
          }}</span>

          <div
            v-if="test && test.instructions.trim().length"
            v-html="test.instructions"
            class="quiz-detail__instructions"
          ></div>

          <span v-else-if="test" class="quiz-detail__instructions">
            {{ $t('TEST.QUIZ_DETAILS.no_instructions') }}
          </span>
        </div>
      </v-row>
    </v-card>

    <v-card
      v-if="$route.params.id !== 'generated'"
      flat
      class="my-4"
      width="100%"
    >
      <v-card-title>
        <h3 class="quiz-detail__attempts-title">
          {{ $t('TEST.QUIZ_DETAILS.previous_attempts') }}
        </h3>
      </v-card-title>

      <AttemptsTable
        v-if="test && attempts"
        :attempts="attempts"
        @reviewAttempt="reviewAttempt($event)"
      />
    </v-card>

    <v-dialog v-model="resultsDialog" width="500px">
      <v-card v-if="resultsDialog" class="pa-4">
        <v-card-title class="pa-0 mt-0 mb-4">
          <v-row class="pa-0 ma-0" justify="center" style="position: relative">
            <h2 class="quiz-detail__results-title">
              {{ $t('TEST.QUIZ_DETAILS.outcome') }}
            </h2>

            <v-btn
              icon
              class="quiz-detail__results-close"
              @click="resultsDialog = false"
            >
              <v-icon>{{ mdiClose }}</v-icon>
            </v-btn>
          </v-row>
        </v-card-title>

        <v-row align="center" class="pa-0 px-4 ma-0">
          <div class="quiz-detail__score-container">
            <div
              class="quiz-detail__donut"
              :style="{
                background: `conic-gradient(
                    from 0deg at 50% 50%,
                    ${color(results.score)} 0%,
                    ${color(results.score)} ${results.score}%,
                    ${color(results.score)}20 ${results.score}%,
                    ${color(results.score)}20 100%
                  )`,
              }"
            >
              <span class="quiz-detail__score"
                >{{ results.score.toFixed(2) }}%</span
              >
            </div>
          </div>

          <div class="quiz-detail__time-taken">
            <span class="quiz-detail__time-taken-title">{{
              $t('TEST.QUIZ_DETAILS.time_spend')
            }}</span>

            <span class="quiz-detail__time">
              {{ results.timeTaken.hours }}h {{ results.timeTaken.minutes }}m
              {{ results.timeTaken.seconds }}s
            </span>
          </div>
        </v-row>

        <v-card-actions>
          <v-row class="pa-0 ma-0" justify="center">
            <v-btn
              dark
              rounded
              class="mt-6 mb-0"
              color="blue"
              @click="resultsDialog = false"
            >
              OK
            </v-btn>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="startDialog" width="500px">
      <v-card>
        <v-card-title class="pa-4 ma-0">
          <v-row
            class="pa-0 ma-0"
            style="position: relative"
            :justify="windowWidth > 340 ? 'center' : 'start'"
          >
            <h2 class="quiz-detail__start-title">
              {{ $t('TEST.QUIZ_DETAILS.before_start') }}
            </h2>

            <v-btn
              icon
              class="quiz-detail__start-close"
              @click="startDialog = false"
            >
              <v-icon>{{ mdiClose }}</v-icon>
            </v-btn>
          </v-row>
        </v-card-title>

        <v-card-text
          v-if="test"
          class="px-4"
          :class="{ 'pa-0': $route.params.id === 'generated' }"
        >
          <v-row
            class="pa-0 ma-0"
            :justify="windowWidth > 340 ? 'center' : 'start'"
          >
            <p
              v-if="test.unlimitedTime"
              class="quiz-detail__start-info"
              :class="{ 'text-center': windowWidth > 340 }"
            >
              {{ $t('TEST.QUIZ_DETAILS.info_no_limit_time') }}
            </p>

            <p
              v-else
              class="quiz-detail__start-info"
              :class="{ 'text-center': windowWidth > 340 }"
            >
              {{ $t('TEST.QUIZ_DETAILS.info_limit_time_1') }}
              <strong style="display: inline-flex">
                {{ test.time.hours }}h {{ test.time.minutes }}m
                {{ test.time.seconds }}s</strong
              >{{ $t('TEST.QUIZ_DETAILS.info_limit_time_2') }}
            </p>
          </v-row>
        </v-card-text>

        <v-row
          v-if="$route.params.id !== 'generated'"
          class="pa-0 ma-0 mb-6"
          justify="center"
        >
          <div
            class="quiz-detail__start-practice"
            @click="practice = !practice"
          >
            <v-checkbox v-model="practice" @click.stop></v-checkbox>

            <span>{{ $t('TEST.QUIZ_DETAILS.start_was_training') }}</span>
          </div>
        </v-row>

        <v-card-actions>
          <v-row class="pa-0 ma-0" justify="center">
            <v-btn
              dark
              rounded
              class="mt-0 mb-2"
              color="blue"
              @click="startQuiz()"
            >
              {{ $t('TEST.GENERATE_CARD.start') }}
            </v-btn>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import {
  mdiBallot,
  mdiClockOutline,
  mdiClose,
  mdiFileDocumentOutline,
  mdiHelp,
  mdiThumbUpOutline,
} from '@mdi/js'

import { analytics } from '../../api/firebase'

import AttemptsTable from './AttemptsTable.vue'

export default {
  name: 'QuizDetails',
  components: {
    AttemptsTable,
  },
  data() {
    return {
      mdiBallot,
      mdiClockOutline,
      mdiClose,
      mdiFileDocumentOutline,
      mdiHelp,
      mdiThumbUpOutline,
      results: null,
      test: null,
      startDialog: false,
      resultsDialog: false,
      practice: false,
      windowWidth: 701,
      attempts: [],
    }
  },
  computed: {
    userInfo() {
      return this.$store.getters.userInfo
    },
  },
  methods: {
    onResize() {
      this.windowWidth = window.innerWidth
    },
    color(score) {
      return score >= 100
        ? '#42D662'
        : score >= 80
        ? '#2196f3'
        : score >= 50
        ? '#edab00'
        : '#ff4141'
    },
    getTime(item) {
      return item.unlimitedTime ? 'Ilimitado' : this.getTimeFormatted(item.time)
    },
    getTimeFormatted(time) {
      return `${time.hours}h ${time.minutes}m ${time.seconds}s`
    },
    getLevel(item) {
      console.log(item)

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
    getSubjectsAmount(item) {
      const subjects = []

      item.questions.forEach(q => {
        if (!subjects.includes(q.subject)) {
          subjects.push(q.subject)
        }
      })

      return subjects.length || item.subjects.length
    },
    startQuiz() {
      const id = this.$route.params.id

      analytics.logEvent('start_quiz', {
        id,
        mode: id === 'generated' || this.practice ? 'practice' : 'exam',
      })

      if (id === 'generated') {
        this.$router.push({
          name: 'quiz.exam',
          params: {
            id: 'generated',
            test: this.test,
            mode: 'practice',
          },
        })
      } else {
        this.$router.push({
          name: 'quiz.exam',
          params: { id, mode: this.practice ? 'practice' : 'exam' },
        })
      }
    },
    reviewAttempt(item) {
      const id = this.$route.params.id

      this.$router.push({
        name: 'quiz.exam',
        params: { id, mode: 'practice', attempt: item, review: true },
      })
    },
  },
  async mounted() {
    this.onResize()
    window.addEventListener('resize', this.onResize, { passive: true })

    const id = this.$route.params.id

    if (id === 'generated') {
      this.test = this.$route.params.test
      this.results = this.$route.params.results
    } else {
      this.test = await this.$store.dispatch('getTestById', id)
    }

    if (this.results) {
      this.resultsDialog = true
    }

    if (this.userInfo && this.userInfo.attempts) {
      this.attempts = this.userInfo.attempts
        .filter(a => a.quizId === id)
        .map((a, i) => ({ index: i, ...a }))
    }
  },
  beforeDestroy() {
    if (!window) {
      return
    }

    window.removeEventListener('resize', this.onResize, { passive: true })
  },
}
</script>

<style scoped>
.quiz-detail__level {
  color: #afafaf;
  font-size: 0.8rem;
  line-height: 0.8rem;
}

.quiz-detail__title {
  color: #4d4d4d;
  font-size: 1.2rem;
  line-height: 1.2rem;
}

.quiz-detail__detail-column {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;

  height: 260px;

  padding: 1rem 1.5rem;
}

.quiz-detail__detail-column.info-column {
  position: sticky;
  top: 0;
}

.quiz-detail__detail-column.instructions-column {
  width: 100%;
  height: auto;
}

.quiz-detail__info-title {
  color: #5d5d5d;
  font-size: 0.95rem;
  font-weight: 500;
}

.quiz-detail__info-container {
  display: flex;
  justify-content: space-between;
  gap: 1rem;

  width: 300px;
  height: 100%;
}

.quiz-detail__info-column {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.6rem;
}

.quiz-detail__info {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.75rem;

  padding: 0.7rem 0;
}

.quiz-detail__info .quiz-detail__info-icon {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 40px;
  height: 40px;

  border-radius: 50%;
}

.quiz-detail__info .quiz-detail__info-stats {
  display: flex;
  flex-direction: column;
  justify-items: center;
  align-items: flex-start;
  gap: 0;
}

.quiz-detail__info .quiz-detail__amount {
  color: #4d4d4d;
  font-size: 1.2rem;
  line-height: 1.2rem;
  font-weight: 500;
}

.quiz-detail__info .quiz-detail__label {
  color: #afafaf;
  font-size: 0.8rem;
}

.quiz-detail__instructions {
  width: 100%;
  height: 100%;

  font-size: 0.9rem;
}

.quiz-detail__attempts-title,
.quiz-detail__start-title,
.quiz-detail__results-title {
  color: #3d3d3d;
  font-size: 1.2rem;
  font-weight: 500;
}

.quiz-detail__start-close,
.quiz-detail__results-close {
  position: absolute;
  right: 0;
}

.quiz-detail__start-info {
  width: 320px;
}

.quiz-detail__start-practice {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.3rem;

  width: 280px;
  height: 60px;

  border: 1px solid #cfcfcf;
  border-radius: 0.6rem;

  cursor: pointer;
}

.quiz-detail__score-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 60px;
  flex: 1;

  width: 100%;
}

.quiz-detail__donut {
  position: relative;

  width: 160px;
  height: 160px;

  border-radius: 50%;

  transition: background-color 1s ease;
}

.quiz-detail__donut::before {
  content: '';

  position: absolute;
  top: 50%;
  left: 50%;

  width: 80%;
  height: 80%;

  border-radius: 50%;
  background-color: #fff;

  transform: translate(-50%, -50%);
}

.quiz-detail__score {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  position: absolute;
  top: 50%;
  left: 50%;

  width: 80%;

  text-align: center;
  font-weight: medium;
  font-size: 1.6rem;
  color: #5d5d5d;

  transform: translate(-50%, -50%);
}

.quiz-detail__time-taken {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  flex: 1;

  width: 100%;
}

.quiz-detail__time-taken-title {
  font-weight: medium;
  font-size: 1.2rem;
  color: #5d5d5d;
}

.quiz-detail__time {
  font-weight: medium;
  font-size: 1.4rem;
  color: #3d3d3d;
}

a,
.slash {
  color: #9a9a9a !important;
  font-size: 0.9rem;
  text-decoration: none;
}

a:hover {
  color: #888 !important;
  text-decoration-line: underline;
}

@media (max-width: 700px) {
  .quiz-detail__detail-row {
    flex-direction: column !important;
  }

  .quiz-detail__info-container {
    justify-content: space-evenly;

    width: 100%;
  }

  .quiz-detail__detail-column {
    width: 100%;
  }

  .quiz-detail__detail-column.info-column {
    align-items: center;
    position: static;
  }

  .quiz-detail__detail-column.info-column .quiz-detail__info-title {
    align-self: flex-start;
  }
}

@media (max-width: 450px) {
  .quiz-detail__info-container {
    justify-content: space-between;
  }
}

@media (max-width: 390px) {
  .quiz-detail__info-container {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 6px;
  }

  .quiz-detail__detail-column.info-column {
    height: auto;
  }
}

@media (max-width: 340px) {
  .quiz-detail__start-info {
    width: 100%;
  }

  .quiz-detail__start-practice {
    width: 100%;

    margin: 0 1rem;
  }
}
</style>
