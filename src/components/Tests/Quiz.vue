<template>
  <v-container
    class="pa-0 ma-0"
    :class="{ 'px-2': windowWidth <= 360, 'px-4': windowWidth > 360 }"
    style="max-width: unset; min-height: 100%; background: #efefef"
  >
    <v-row class="pa-4 ma-0">
      <a @click="exitQuiz('/')">Início</a>

      <span class="mx-3 slash">/</span>

      <a @click="exitQuiz('/quizzes')">Questionários</a>

      <span class="mx-3 slash">/</span>

      <a @click="exitQuiz('/quizzes/' + test.id)">Detalhes do questionário</a>

      <span class="mx-3 slash">/</span>

      <a>{{ test ? test.title : "Questionário" }}</a>
    </v-row>

    <v-progress-circular
      v-if="loadingQuiz"
      indeterminate
      size="100"
      width="7"
      color="blue"
      class="quiz__loading"
    ></v-progress-circular>

    <v-card
      v-else-if="examQuestions[current - 1]"
      flat
      class="mb-4"
      width="100%"
    >
      <v-toolbar flat class="">
        <span class="quiz__current-question">
          Questão {{ current }} de {{ examQuestions.length }}
        </span>

        <v-spacer></v-spacer>

        <Counter
          v-if="windowWidth > 400"
          class="mr-4"
          :countdown="countdown"
          :static="review"
          :time="review ? attempt.timeTaken : test.time"
          :paused="review || finished"
          @timeUp="
            timesUp = !review;
            finished = true;
          "
        />

        <v-btn
          text
          color="error"
          @click="exitQuiz(review ? '/quizzes/' + test.id : '/quizzes')"
          >Sair
          {{ !review && windowWidth > 540 ? "do Questionário" : "" }}</v-btn
        >
      </v-toolbar>

      <v-divider></v-divider>

      <div class="quiz__interaction-container">
        <div class="quiz__question-container py-4">
          <Counter
            v-if="windowWidth <= 400"
            class="mx-4"
            :countdown="countdown"
            :static="review"
            :time="review ? attempt.timeTaken : test.time"
            :paused="review || finished"
            @timeUp="
              timesUp = !review;
              finished = true;
            "
          />

          <span class="quiz__subject px-4">
            <strong>Disciplina:</strong>
            {{ examQuestions[current - 1].subject }}
          </span>

          <div
            v-html="examQuestions[current - 1].question"
            class="quiz__question-description pa-0 px-4 ma-0 mt-4"
          ></div>

          <QuestionImage
            v-if="!!examQuestions[current - 1].image"
            class="px-4"
            :image="examQuestions[current - 1].image"
            :imageSize="examQuestions[current - 1].imageSize"
          />

          <v-radio-group
            v-model="currentAnswer"
            class="px-4"
            :disabled="finished"
            :readonly="review"
          >
            <v-radio
              v-for="(answer, i) in examQuestions[current - 1].answers"
              class="quiz__answer my-5"
              :class="
                getAnswerCustomData(answer, currentAnswer) &&
                  getAnswerCustomData(answer, currentAnswer).class
              "
              :color="
                getAnswerCustomData(answer, currentAnswer) &&
                  getAnswerCustomData(answer, currentAnswer).color
              "
              :key="answer.ansId"
              :value="answer.ansId"
            >
              <template v-slot:label>
                <strong class="mr-1">{{ answersOptions[i] }}.</strong>
                <span>{{ answer.text }}</span>
              </template>
            </v-radio>
          </v-radio-group>

          <v-btn
            v-if="!review && practice"
            elevation="0"
            width="216px"
            class="quiz__answer-button mx-4 mt-0 mb-8"
            @click="showAnswer = !showAnswer"
          >
            <v-icon class="mr-2">{{
              showAnswer ? mdiEyeOffOutline : mdiEyeOutline
            }}</v-icon>
            {{ showAnswer ? "Ocultar" : "Mostrar" }} resposta
          </v-btn>

          <v-divider></v-divider>

          <div v-if="review || (practice && showAnswer)">
            <h2 class="ma-4 mt-5 quiz__answer-description-title">Explicação</h2>

            <span class="mx-4 quiz__answer-description">
              Resposta correta:
              {{
                answersOptions[
                  examQuestions[current - 1].answers.findIndex(a => a.value)
                ]
              }}
            </span>

            <div
              v-for="(answer, i) in examQuestions[current - 1].answers"
              class="mx-4 mt-1 mb-3 quiz__answer-description"
              :key="answer.ansId + '-desc'"
            >
              <strong
                class="mr-1"
                :class="{ correct: answer.value, incorrect: !answer.value }"
              >
                {{ answersOptions[i] }}.
              </strong>

              <span>{{ answer.description }}</span>
            </div>

            <v-divider class="mt-5"></v-divider>
          </div>

          <v-row v-if="!review && windowWidth <= 830" class="pa-0 px-4 ma-0">
            <v-checkbox
              label="Marcar para revisão"
              :disabled="finished"
              :input-value="
                markedForReview.includes(examQuestions[current - 1].name)
              "
              @click="toggleReview(examQuestions[current - 1])"
            ></v-checkbox>
          </v-row>

          <v-row
            align="center"
            justify="space-between"
            class="pa-0 px-4 ma-0 quiz__actions-row"
            :class="{ 'mt-4': windowWidth > 830 || review }"
          >
            <v-btn
              v-if="windowWidth > 340 || current > 1"
              rounded
              elevation="0"
              width="130px"
              color="blue"
              class="pl-2"
              :dark="!loadingFinish"
              :disabled="loadingFinish"
              :class="{ hidden: current <= 1 }"
              @click="current - 1 < 1 ? current : current--"
            >
              <v-icon>{{ mdiChevronLeft }}</v-icon>
              Anterior
            </v-btn>

            <v-checkbox
              v-if="!review && windowWidth > 830"
              label="Marcar para revisão"
              :disabled="finished"
              :input-value="
                markedForReview.includes(examQuestions[current - 1].name)
              "
              @click="toggleReview(examQuestions[current - 1])"
            ></v-checkbox>

            <v-btn
              v-if="current < examQuestions.length"
              dark
              rounded
              elevation="0"
              width="120px"
              color="blue"
              class="pr-2"
              @click="current + 1 > examQuestions.length ? current : current++"
            >
              Próxima
              <v-icon>{{ mdiChevronRight }}</v-icon>
            </v-btn>

            <v-btn
              v-else-if="!review"
              dark
              rounded
              elevation="0"
              width="120px"
              color="blue"
              :loading="loadingFinish"
              @click="finishQuiz()"
            >
              Enviar
            </v-btn>
          </v-row>
        </div>

        <v-divider
          class="mr-4 quiz__column-divider"
          :vertical="windowWidth > 700"
        ></v-divider>

        <div class="quiz__question-control py-4">
          <span
            v-if="timesUp"
            class="quiz__missing-questions orange--text font-weight-medium"
          >
            TEMPO ESGOTADO
          </span>

          <span
            v-else-if="review && answeredAmount < examQuestions.length"
            class="quiz__missing-questions"
          >
            {{ answeredAmount }} questões respondidas
          </span>

          <span
            v-else-if="answeredAmount < examQuestions.length"
            class="quiz__missing-questions"
          >
            Faltam {{ examQuestions.length - answeredAmount }} questões para
            responder
          </span>

          <span
            v-else-if="markedForReview.length > 0"
            class="quiz__missing-questions"
          >
            Há {{ markedForReview.length }} questões para revisar
          </span>

          <span v-else class="quiz__missing-questions">
            Todas as questões foram respondidas
          </span>

          <div
            class="quiz__question-matrix"
            :style="{
              'grid-template-columns': `repeat(${matrixColumns}, 1fr)`
            }"
          >
            <v-btn
              v-for="(q, i) in examQuestions"
              :key="q.name"
              fab
              icon
              width="30"
              height="30"
              elevation="0"
              class="quiz__question-number"
              :class="{
                current: current === i + 1,
                review: markedForReview.includes(q.name),
                answered: !!getAnswerByQuestionName(q.name),
                incorrect:
                  review &&
                  !!getAnswerByQuestionName(q.name) &&
                  !getAnswerByQuestionName(q.name).correct
              }"
              @click="current = i + 1"
            >
              {{ i + 1 }}
            </v-btn>
          </div>
        </div>
      </div>
    </v-card>

    <v-dialog v-model="dialogEndQuiz" width="300">
      <v-card class="pa-4">
        <v-card-title class="pa-0 mb-2">Espera...</v-card-title>

        <span v-if="!review">
          Ao sair do questionário, todo o seu progresso será perdido. Tem
          certeza de que deseja sair?
        </span>

        <span v-else>Tem certeza de que deseja sair?</span>

        <v-card-actions class="pa-0 mt-4">
          <v-btn text color="grey darken-2" @click="dialogEndQuiz = false">
            Cancelar
          </v-btn>

          <v-spacer></v-spacer>

          <v-btn text color="red" @click="$router.push(exitTo)">Sair</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import {
  mdiChevronLeft,
  mdiChevronRight,
  mdiEyeOutline,
  mdiEyeOffOutline,
  mdiFileChart
} from "@mdi/js";

import QuestionImage from "../Questions/QuestionImage.vue";
import Counter from "../Shared/Counter.vue";
import { analytics } from "../../main";

export default {
  name: "Exam",
  components: {
    QuestionImage,
    Counter
  },
  data() {
    return {
      mdiChevronLeft,
      mdiChevronRight,
      mdiEyeOutline,
      mdiEyeOffOutline,
      mdiFileChart,
      windowWidth: 831,
      loadingQuiz: false,
      showAnswer: false,
      dialogEndQuiz: false,
      exitTo: "/quizzes",
      practice: false,
      test: null,
      examQuestions: [],
      startedAt: new Date(),
      finishedAt: null,
      finished: false,
      loadingFinish: false,
      timesUp: false,
      current: 1,
      currentAnswer: null,
      answers: [],
      answersOptions: ["A", "B", "C", "D"],
      markedForReview: [],
      review: false,
      attempt: null
    };
  },
  computed: {
    userInfo() {
      return this.$store.getters.userInfo;
    },
    answeredAmount() {
      if (this.review) {
        return this.attempt.answers.length;
      }

      return this.answers.reduce(
        (prev, curr) => (!!curr.value ? prev + 1 : prev),
        0
      );
    },
    countdown() {
      return (
        (!this.practice || this.$route.params.id === "generated") &&
        !this.test.unlimitedTime
      );
    },
    matrixColumns() {
      const w = this.windowWidth;
      const full = w <= 700;

      if (!full) {
        return 7;
      }

      if (w > 580) {
        return 10;
      } else if (w > 480) {
        return 8;
      } else if (w > 360) {
        return 7;
      }

      return 5;
    },
    loading() {
      return this.$store.getters.loading;
    }
  },
  methods: {
    onResize() {
      this.windowWidth = window.innerWidth;
    },
    getAnswerCustomData(answer) {
      if (!this.review) {
        return { class: "", color: "" };
      }

      return answer.value
        ? { class: "correct", color: "#42d662" }
        : !answer.value && answer.ansId == this.currentAnswer
        ? { class: "incorrect", color: "#ff4141" }
        : { class: "", color: "" };
    },
    getDateSentence(isoString) {
      const date = new Date(isoString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    },
    getAnswerByQuestionName(questionName) {
      if (this.review) {
        return (
          this.attempt.answers.find(a => a.questionName === questionName) ||
          null
        );
      }

      const answer = this.answers.find(a => a.questionName === questionName);
      return answer ? answer.value : null;
    },
    checkAnswer(answer) {
      const question = this.examQuestions.find(
        q => q.name === answer.questionName
      );

      return question
        ? question.answers.find(a => a.ansId === answer.value).value
        : false;
    },
    toggleReview(question) {
      const index = this.markedForReview.indexOf(question.name);

      if (index === -1) {
        this.markedForReview.push(question.name);
      } else {
        this.markedForReview.splice(index, 1);
      }
    },
    async finishQuiz() {
      this.finished = true;

      this.loadingFinish = true;

      if (!this.finishedAt) {
        this.finishedAt = new Date();
      }

      const answers = [];

      let correct = 0;
      this.answers.forEach(a => {
        if (this.checkAnswer(a)) {
          correct++;
        }

        answers.push({
          questionName: a.questionName,
          answer: +a.value.split("-")[1],
          correct: this.checkAnswer(a)
        });
      });

      const score = (100 * correct) / this.test.questionsAmount;

      const diff =
        this.finishedAt.getTime() -
        this.startedAt.getTime() -
        (this.countdown ? 1000 : 0);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor(diff / 1000);

      const timeTaken = {
        hours,
        minutes: hours > 0 ? minutes - hours * 60 : minutes,
        seconds: minutes > 0 ? seconds - minutes * 60 : seconds
      };

      analytics.logEvent("quiz_complete", {
        timeTaken: `${timeTaken.hours}h ${timeTaken.minutes}m ${timeTaken.seconds}s`,
        score,
        correct
      });

      if (this.$route.params.id === "generated") {
        this.$router.push({
          name: "quiz.details",
          params: {
            id: "generated",
            results: {
              timeTaken,
              score,
              questionsAmount: this.test.questionsAmount,
              correctAnswers: correct
            },
            test: this.test
          }
        });

        return;
      }

      const attempt = {
        approved: score >= this.test.approvalPercentage,
        answers,
        date: new Date(this.finishedAt).toISOString(),
        mode: this.practice ? "practice" : "exam",
        questions: this.examQuestions.map(q => q.name),
        quizId: this.test.id,
        score,
        timeTaken,
        userId: this.userInfo.id
      };

      if (!this.test.userAttempts) {
        this.test.userAttempts = {};
      }

      const userAttempt = this.test.userAttempts[attempt.userId];

      if (!userAttempt) {
        this.test.userAttempts[attempt.userId] = 0;
      }

      this.test.userAttempts[attempt.userId] += 1;

      await this.$store.dispatch("updateUser", {
        attempts: [attempt, ...(this.userInfo.attempts || [])],
        noMessage: true
      });

      await this.$store.dispatch("updateTest", {
        testData: this.test,
        noMessage: true
      });

      this.loadingFinish = false;

      this.$router.push("/quizzes/" + this.test.id);
    },
    exitQuiz(to) {
      this.exitTo = to;
      this.dialogEndQuiz = true;
    },
    async selectQuestions() {
      this.$store.commit("setLoading", true);

      const questions = [];
      const temp = [];

      const selectedData = [];

      for (const subject of this.test.subjects) {
        const subQuestions = await this.$store.dispatch(
          "getSubjectQuestions",
          subject
        );

        subQuestions.forEach(q => {
          if (!this.test.questionsNames.includes(q.name)) {
            return;
          }

          questions.push({
            name: q.name,
            level: q.level,
            subject
          });
        });
      }

      while (temp.length < questions.length) {
        const index = Math.floor(Math.random() * questions.length);

        if (!temp.includes(questions[index].name)) {
          temp.push(questions[index].name);
        }
      }

      const randomQuestions = temp.map(questionName =>
        questions.find(q => q.name === questionName)
      );

      let loop = 0;

      while (
        selectedData.length < this.test.questionsAmount &&
        selectedData.length < randomQuestions.length &&
        loop < randomQuestions.length
      ) {
        const question = randomQuestions[loop];

        const questionData = await this.$store.dispatch(
          "getQuestionByName",
          question.name
        );

        if (randomQuestions[loop].level <= questionData.level.index) {
          selectedData.push(questionData);
        }

        loop++;
      }

      this.randomizeQuestions(selectedData);

      this.$store.commit("setLoading", false);
    },
    async selectReviewQuestions() {
      const questions = [];

      for (const q of this.attempt.questions) {
        const question = await this.$store.dispatch("getQuestionByName", q);
        questions.push(question);
      }

      this.examQuestions = questions;

      this.setCurrentAnswer();
    },
    setCurrentAnswer() {
      const questionName = this.examQuestions[0].name;

      const answer = this.attempt.answers.find(
        a => a.questionName === questionName
      );

      if (!answer) {
        this.currentAnswer = null;
        return;
      }

      this.currentAnswer = "radio-" + answer.answer;
    },
    randomizeQuestions(questions) {
      const randomQuestions = [];

      let i = 0;

      while (i < questions.length) {
        const rand = Math.floor(Math.random() * questions.length);

        if (!randomQuestions.find(q => q.name === questions[rand].name)) {
          randomQuestions.push(questions[rand]);
          i++;
        }
      }

      this.examQuestions = randomQuestions;

      if (this.review) {
        this.setCurrentAnswer();
      }
    }
  },
  async mounted() {
    this.onResize();
    window.addEventListener("resize", this.onResize, { passive: true });

    this.loadingQuiz = true;

    const id = this.$route.params.id;
    const mode = this.$route.params.mode;

    this.review = !!this.$route.params.review;
    this.attempt = this.$route.params.attempt;

    if (!mode) {
      this.$router.push("/quizzes/" + id);
    }

    this.practice = mode === "practice";

    if (id === "generated") {
      this.test = this.$route.params.test;
    } else {
      this.test = await this.$store.dispatch("getTestById", id);
    }

    if (id !== "generated" && this.test.type === "auto" && this.review) {
      await this.selectReviewQuestions();

      this.loadingQuiz = false;
      return;
    }

    if (id !== "generated" && this.test.type === "auto") {
      await this.selectQuestions();

      this.loadingQuiz = false;
      return;
    }

    this.randomizeQuestions([...this.test.questions]);

    this.loadingQuiz = false;
  },
  watch: {
    finished(value) {
      if (value) {
        this.finishedAt = new Date();
      }
    },
    current(value) {
      const questionName = this.examQuestions[value - 1].name;

      if (this.review && this.attempt) {
        const answer = this.attempt.answers.find(
          a => a.questionName === questionName
        );

        if (!answer) {
          this.currentAnswer = null;

          return;
        }

        this.currentAnswer = "radio-" + answer.answer;

        return;
      }

      const answer = this.answers.find(a => a.questionName === questionName);

      this.currentAnswer = answer ? answer.value : null;
    },
    currentAnswer(value) {
      if (!value) {
        return;
      }

      const questionName = this.examQuestions[this.current - 1].name;
      const index = this.answers.findIndex(
        a => a.questionName === questionName
      );

      if (index === -1) {
        this.answers.push({
          questionName: this.examQuestions[this.current - 1].name,
          value
        });
      } else {
        this.answers[index] = {
          questionName: this.examQuestions[this.current - 1].name,
          value
        };
      }
    }
  },
  beforeDestroy() {
    if (!window) {
      return;
    }

    window.removeEventListener("resize", this.onResize, { passive: true });
  }
};
</script>

<style scoped>
.quiz__current-question {
  color: #777;
  font-size: 1.1rem;
}

.quiz__subject strong {
  color: #3d3d3d;
  font-weight: 500;
}

.quiz__interaction-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.quiz__question-container {
  flex: 1;
}

.quiz__answer-button {
  background-color: #9455fa33 !important;

  color: #9455fa !important;
}

.quiz__answer-button:hover {
  background-color: #9455fa3f !important;
}

.quiz__question-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  width: 300px;
}

.quiz__missing-questions {
  color: #777;

  margin-bottom: 0.5rem;
}

.quiz__question-matrix {
  display: grid;
  row-gap: 1rem;

  width: 100%;
}

.quiz__question-number {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 30px;
  height: 30px;

  margin: 0 auto;

  background-color: #cfcfcf44;
  border-radius: 50%;

  color: #777 !important;
}

.quiz__question-number.answered {
  background-color: #1ee55a44;

  color: #0ab93f !important;
}

.quiz__question-number.review {
  border: 2px solid #ec9512;
  background-color: #eca01244;

  color: #e48d0b !important;
}

.quiz__question-number.review.answered {
  border-color: #0ab93f;
}

.quiz__question-number.incorrect {
  background-color: #ff414144;

  color: #ff4141 !important;
}

.quiz__question-number.current {
  border: 2px solid #1e88e5;
  background-color: #1e88e544;

  color: #1278d1 !important;
}

.quiz__question-number.current.review {
  border-color: #ec9512;
}

.quiz__answer-description-title {
  color: #3d3d3d;
  font-size: 1.3rem;
}

.quiz__answer-description {
  color: #3d3d3d;
}

.quiz__answer-description strong.correct {
  color: #0ab93f;
}

.quiz__answer-description strong.incorrect {
  color: #4d4d4d;
}

.quiz__answer.correct /deep/ label {
  color: #42d662 !important;
}

.quiz__answer.incorrect /deep/ label {
  color: #ff4141 !important;
}

.quiz__loading {
  position: fixed;
  top: 50%;
  left: 50%;

  margin-top: 30px;

  transform: translate(-50%, -50%);
}

.quiz__actions-row .v-btn {
  width: 130px !important;
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

.hidden {
  opacity: 0;
  pointer-events: none;
}

@media (max-width: 700px) {
  .quiz__interaction-container {
    flex-direction: column;
  }

  .quiz__column-divider {
    width: 100%;
  }

  .quiz__question-control {
    width: 100%;
  }
}

@media (max-width: 340px) {
  .quiz__actions-row {
    flex-direction: column !important;
    align-items: center;
    gap: 10px;
  }

  .quiz__missing-questions {
    padding: 0 1rem;
    text-align: center;
  }
}
</style>
