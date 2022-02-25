<template>
  <v-container
    class="pa-0 px-4 ma-0"
    style="max-width: unset; min-height: 100%; background: #efefef"
  >
    <v-row class="pa-4 ma-0">
      <a @click="$router.push('/')">Início</a>

      <span class="mx-3 slash">/</span>

      <a @click="$router.push('/quizes')">Questionários</a>

      <span class="mx-3 slash">/</span>

      <a @click="$router.push('/quizes/' + $route.params.id)"
        >Detalhes do questionário</a
      >

      <span class="mx-3 slash">/</span>

      <a>{{ test ? test.title : "Questionário" }}</a>
    </v-row>

    <v-card v-if="examQuestions[current - 1]" flat class="mb-4" width="100%">
      <v-toolbar flat>
        <span class="quiz__current-question">
          Questão {{ current }} de {{ examQuestions.length }}
        </span>

        <v-spacer></v-spacer>

        <v-btn text color="error" @click="dialogEndQuiz = true"
          >Sair do Questionário</v-btn
        >
      </v-toolbar>

      <v-divider></v-divider>

      <div class="quiz__interaction-container">
        <div class="quiz__question-container py-4">
          <span class="quiz__subject px-4">
            <strong>Disciplina:</strong>
            {{ examQuestions[current - 1].subject }}
          </span>

          <vue-markdown
            class="pa-0 px-4 ma-0 mt-4"
            :source="examQuestions[current - 1].question"
          ></vue-markdown>

          <QuestionImage
            v-if="!!examQuestions[current - 1].image"
            class="px-4"
            :image="examQuestions[current - 1].image"
            :imageSize="examQuestions[current - 1].imageSize"
          />

          <v-radio-group v-model="currentAnswer" class="px-4">
            <v-radio
              v-for="(answer, i) in examQuestions[current - 1].answers"
              class="my-5"
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
            v-if="practice"
            elevation="0"
            width="220px"
            class="quiz__answer-button mx-4 mt-0 mb-8"
            @click="showAnswer = !showAnswer"
          >
            <v-icon class="mr-2">{{
              showAnswer ? mdiEyeOffOutline : mdiEyeOutline
            }}</v-icon>
            {{ showAnswer ? "Ocultar" : "Mostrar" }} resposta
          </v-btn>

          <v-divider></v-divider>

          <div v-if="practice && showAnswer">
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

          <v-row
            class="pa-0 px-4 ma-0 mt-4"
            align="center"
            justify="space-between"
          >
            <v-btn
              dark
              rounded
              width="130px"
              color="blue"
              class="pl-2"
              :class="{ hidden: current <= 1 }"
              @click="current - 1 < 1 ? current : current--"
            >
              <v-icon>{{ mdiChevronLeft }}</v-icon>
              Anterior
            </v-btn>

            <v-checkbox
              label="Marcar para revisão"
              :input-value="
                markedForReview.includes(examQuestions[current - 1].name)
              "
              @click="toggleReview(examQuestions[current - 1])"
            ></v-checkbox>

            <v-btn
              v-if="current < examQuestions.length"
              dark
              rounded
              width="120px"
              color="blue"
              class="pr-2"
              @click="current + 1 > examQuestions.length ? current : current++"
            >
              Próxima
              <v-icon>{{ mdiChevronRight }}</v-icon>
            </v-btn>

            <v-btn v-else dark rounded width="120px" color="blue">
              Enviar
            </v-btn>
          </v-row>
        </div>

        <v-divider vertical class="mr-4"></v-divider>

        <div class="quiz__question-control py-4">
          <span
            v-if="answeredAmount < examQuestions.length"
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

          <div class="quiz__question-matrix">
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
                answered: !!getAnswerByQuestionName(q.name)
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

        <span>
          Ao sair do questionário, todo o seu progresso será perdido. Tem
          certeza de que deseja sair?
        </span>

        <v-card-actions class="pa-0 mt-4">
          <v-btn text color="grey darken-2" @click="dialogEndQuiz = false">
            Cancelar
          </v-btn>

          <v-spacer></v-spacer>

          <v-btn text color="red" @click="$router.push('/quizes')">Sair</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import VueMarkdown from "vue-markdown";
import "vue-markdown";
import {
  mdiChevronLeft,
  mdiChevronRight,
  mdiEyeOutline,
  mdiEyeOffOutline,
  mdiFileChart
} from "@mdi/js";

import QuestionImage from "../Questions/QuestionImage.vue";
import QuizResults from "./QuizResults.vue";
import QuizReview from "./QuizReview.vue";

export default {
  name: "Exam",
  components: {
    VueMarkdown,
    QuestionImage
    // QuizReview,
    // QuizResults
  },
  data() {
    return {
      mdiChevronLeft,
      mdiChevronRight,
      mdiEyeOutline,
      mdiEyeOffOutline,
      mdiFileChart,
      showAnswer: false,
      showResults: false,
      showReview: false,
      dialogEndQuiz: false,
      practice: false,
      test: null,
      examQuestions: [],
      started: new Date(),
      current: 1,
      currentAnswer: null,
      answers: [],
      answersOptions: ["A", "B", "C", "D"],
      markedForReview: []
    };
  },
  computed: {
    answeredAmount() {
      return this.answers.reduce(
        (prev, curr) => (!!curr.value ? prev + 1 : prev),
        0
      );
    },
    loading() {
      return this.$store.getters.loading;
    }
  },
  methods: {
    getDateSentence(isoString) {
      const date = new Date(isoString);

      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    },
    getAnswerByQuestionName(questionName) {
      const answer = this.answers.find(a => a.questionName === questionName);
      return answer ? answer.value : null;
    },
    toggleReview(question) {
      const index = this.markedForReview.indexOf(question.name);

      if (index === -1) {
        this.markedForReview.push(question.name);
      } else {
        this.markedForReview.splice(index, 1);
      }
    },
    viewResults() {
      this.showResults = true;
    },
    async selectQuestions() {
      this.$store.commit("setLoading", true);

      const questions = [];
      const selected = [];
      const selectedData = [];

      for (const subject of this.test.subjects) {
        const subQuestions = await this.$store.dispatch(
          "getSubjectQuestions",
          subject
        );

        subQuestions.forEach(q => {
          questions.push({
            name: q.name,
            level: q.level,
            subject
          });
        });
      }

      let loops = 0;

      while (
        selected.length < this.test.questionsAmount &&
        selected.length < questions.length &&
        loops < questions.length
      ) {
        const index = Math.floor(Math.random() * questions.length);

        if (!selected.includes(questions[index].name)) {
          const question = questions[index];
          selected.push(question.name);

          const questionData = await this.$store.dispatch(
            "getQuestionByName",
            question.name
          );

          if (questions[index].level <= questionData.level.index) {
            selectedData.push(questionData);
          }
        }

        loops++;
      }

      this.examQuestions = selectedData;

      this.$store.commit("setLoading", false);
    },
    randomizeQuestions() {
      const questions = [...this.test.questions];
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
    },
    close() {
      this.current = 1;
      this.currentAnswer = null;
      this.answers = [];

      this.$emit("closeDialog");
    }
  },
  async mounted() {
    const id = this.$route.params.id;
    const mode = this.$route.params.mode;

    if (!mode) {
      this.$router.push("/quizes/" + id);
    }

    this.practice = mode === "practice";

    if (id === "generated") {
      this.test = this.$route.params.test;
    } else {
      this.test = await this.$store.dispatch("getTestById", id);
    }
    console.log(this.test);

    if (this.test.type === "auto") {
      await this.selectQuestions();

      return;
    }

    this.randomizeQuestions();
  },
  watch: {
    current() {
      const questionName = this.examQuestions[this.current - 1].name;
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
  grid-template-columns: repeat(7, 1fr);
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

.quiz__question-number.current {
  border: 2px solid #1e88e5;
  background-color: #1e88e544;

  color: #1278d1 !important;
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
</style>
