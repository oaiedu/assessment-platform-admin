<template>
  <div class="review-container">
    <div class="questions-list px-6">
      <div
        v-for="(question, index) in questions"
        class="question-container"
        :key="question.name"
      >
        <h3 class="name">{{ question.name }}</h3>
        <h4 class="subject">{{ question.subject }}</h4>

        <vue-markdown class="mt-10" :source="question.question"></vue-markdown>

        <QuestionImage
          v-if="!!question.image"
          :image="question.image"
          :imageSize="question.imageSize"
        />

        <v-spacer class="mt-10"></v-spacer>

        <v-radio-group v-model="answered[index]">
          <v-radio
            v-for="answer in question.answers"
            class="my-5"
            readonly
            :class="getAnswerCustomData(answer, answered[index]).class"
            :color="getAnswerCustomData(answer, answered[index]).color"
            :key="answer.ansId"
            :value="answer.ansId"
            :label="answer.text"
          ></v-radio>
        </v-radio-group>

        <v-divider
          v-if="index < questions.length - 1"
          class="my-10"
        ></v-divider>
      </div>
    </div>

    <v-btn text class="results-button mt-6" color="blue" @click="results()">
      Ver resultados
    </v-btn>
  </div>
</template>

<script>
import VueMarkdown from "vue-markdown";
import "vue-markdown";

import QuestionImage from "../Questions/QuestionImage.vue";

export default {
  name: "ExamReview",
  components: {
    QuestionImage,
    VueMarkdown
  },
  props: {
    questions: {
      type: Array,
      required: false,
      default: () => []
    },
    answers: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  data() {
    return {
      correctAnswer: null,
      answered: []
    };
  },
  methods: {
    getAnswerCustomData(answer, answered) {
      return answer.value
        ? { class: "correct", color: "#42d662" }
        : !answer.value && answer.ansId == answered
        ? { class: "incorrect", color: "#ff4141" }
        : { class: "", color: "" };
    },
    results() {
      this.$emit("viewResults");
    }
  },
  mounted() {
    this.answered = this.answers.map(a => a.value);
  }
};
</script>

<style scoped>
.review-container {
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
  min-height: 100%;
}

.questions-list {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;

  width: 100%;
  height: 100%;
}

.question-container {
  width: 100%;
}

.correct /deep/ label {
  color: #42d662 !important;
}

.incorrect /deep/ label {
  color: #ff4141 !important;
}

.results-button {
  font-size: 1rem;

  margin-bottom: 60px;
}
</style>
