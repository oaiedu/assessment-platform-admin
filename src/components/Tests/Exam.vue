<template>
  <v-card flat tile class="pa-3" width="100%" min-height="100%">
    <v-toolbar flat dense class="pa-3">
      <v-card-title class="ma-0 pa-0">
        <img src="../../assets/LGlogo.png" class="lg-logo" />

        <span class="ml-2 blue--text">
          Liquid Galaxy -
          {{
            examName ||
              (showResults ? "Resultado" : showReview ? "Revisão" : "Prova")
          }}
        </span>
      </v-card-title>

      <v-spacer></v-spacer>

      <span v-if="!showResults" class="current-question mr-2">
        {{ current }} / {{ questions.length }}
      </span>

      <v-btn text color="grey" @click="close()">
        FECHAR
      </v-btn>
    </v-toolbar>

    <v-divider class="my-6"></v-divider>

    <Results
      v-if="showResults && !showReview"
      :questions="questions"
      :answers="answers"
      @review="
        showResults = false;
        showReview = true;
      "
    />

    <ExamReview
      v-if="showReview && !showResults"
      :questions="questions"
      :answers="answers"
      @viewResults="
        showReview = false;
        showResults = true;
      "
    />

    <div
      v-if="!showResults && !showReview"
      class="question-container px-6 pb-12"
    >
      <h3 class="name">{{ questions[current - 1].name }}</h3>
      <h4 class="subject">{{ questions[current - 1].subject }}</h4>
      <span class="updated"
        >Última modificação em
        {{ getDateSentence(questions[current - 1].updated) }}</span
      >

      <vue-markdown
        class="mt-10"
        :source="questions[current - 1].question"
      ></vue-markdown>

      <QuestionImage
        v-if="!!questions[current - 1].image"
        :image="questions[current - 1].image"
        :imageSize="questions[current - 1].imageSize"
      />

      <v-spacer class="mt-10"></v-spacer>

      <v-radio-group v-model="currentAnswer">
        <v-radio
          v-for="answer in questions[current - 1].answers"
          class="my-5"
          :key="answer.ansId"
          :value="answer.ansId"
          :label="answer.text"
        ></v-radio>
      </v-radio-group>
    </div>

    <v-tooltip v-if="!showResults && !showReview && current > 1" right>
      <template v-slot:activator="{ on }">
        <v-btn
          v-on="on"
          bottom
          fab
          fixed
          left
          elevation="0"
          color="grey lighten-2"
          @click="back()"
        >
          <v-icon color="blue">{{ mdiArrowLeft }}</v-icon>
        </v-btn>
      </template>
      <span>Voltar</span>
    </v-tooltip>

    <v-tooltip v-if="!showResults && !showReview" left>
      <template v-slot:activator="{ on }">
        <v-btn
          v-on="on"
          bottom
          fab
          fixed
          right
          elevation="0"
          color="blue darken-1"
          :dark="!!currentAnswer"
          :disabled="!currentAnswer"
          @click="current >= questions.length ? viewResults() : next()"
        >
          <v-icon>{{
            current >= questions.length ? mdiFileChart : mdiArrowRight
          }}</v-icon>
        </v-btn>
      </template>
      <span>{{
        current >= questions.length ? "Conferir resultado" : "Próximo"
      }}</span>
    </v-tooltip>
  </v-card>
</template>

<script>
import VueMarkdown from "vue-markdown";
import "vue-markdown";
import { mdiArrowLeft, mdiArrowRight, mdiFileChart } from "@mdi/js";

import QuestionImage from "../Questions/QuestionImage.vue";
import Results from "./Results.vue";
import ExamReview from "./ExamReview.vue";

export default {
  name: "Exam",
  components: {
    VueMarkdown,
    QuestionImage,
    ExamReview,
    Results
  },
  props: {
    examName: {
      type: String,
      required: false,
      default: ""
    },
    questions: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  data() {
    return {
      mdiArrowLeft,
      mdiArrowRight,
      mdiFileChart,
      showResults: false,
      showReview: false,
      started: new Date(),
      current: 1,
      currentAnswer: null,
      answers: []
    };
  },
  methods: {
    getDateSentence(isoString) {
      const date = new Date(isoString);

      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    },
    back() {
      this.current--;
      this.currentAnswer = this.answers[this.current - 1]
        ? this.answers[this.current - 1].value
        : null;
    },
    next() {
      this.current++;
      this.currentAnswer = this.answers[this.current - 1]
        ? this.answers[this.current - 1].value
        : null;
    },
    viewResults() {
      this.showResults = true;
    },
    close() {
      this.current = 1;
      this.currentAnswer = null;
      this.answers = [];

      this.$emit("closeDialog");
    }
  },
  watch: {
    currentAnswer(value) {
      this.answers[this.current - 1] = {
        questionName: this.questions[this.current - 1].name,
        value
      };
    }
  }
};
</script>

<style scoped>
.lg-logo {
  height: 40px;

  object-fit: cover;
}

.current-question {
  font-weight: medium;
  color: #5d5d5d;
}

.question-container {
  width: 100%;
}

.question-container .name {
  font-size: 1.2rem;
}

.question-container .subject {
  font-size: 1rem;
  font-weight: normal;
  color: #4d4d4d;
}

.question-container .updated {
  font-size: 0.9rem;
  color: #777;
}
</style>
