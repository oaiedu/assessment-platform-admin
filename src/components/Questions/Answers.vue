<template>
  <div>
    <v-row
      v-for="(item, index) in answers"
      class="answer-block pa-0 ma-0"
      :key="index"
    >
      <span>
        <strong class="mr-1">{{ letters[index] }}</strong>
        {{ item.text }}
      </span>
    </v-row>

    <h4 v-if="justifications" class="pa-0 ma-0 mt-6 mb-2">{{ $t('QUESTIONS.ANSWERS.justifications') }}</h4>

    <span v-if="justifications">
      {{ $t('TEST.QUIZ.correct_answer') }}
      {{ correctAnswerOption }}
    </span>

    <div
      v-if="justifications && answerJustification"
      v-html="answerJustification"
      class="answers__justification mt-2"
    ></div>

    <v-row
      v-for="(item, index) in answers"
      class="answer-block pa-0 ma-0"
      :class="{ 'pb-4': answers && index === answers.length - 1 }"
      :key="item.ansId + index"
    >
      <span v-if="justifications">
        <strong class="mr-1">{{ letters[index] }}</strong>
        {{ item.description }}
      </span>
    </v-row>

    <span
      v-if="justifications && answerJustificationSource"
      class="answers__source"
    >
      Link:
      <a
        target="blank"
        :href="justificationSourceUrl(answerJustificationSource)"
        :class="{ link: checkUrl(answerJustificationSource) }"
        >{{ answerJustificationSource }}</a
      >
    </span>
  </div>
</template>

<script>
export default {
  name: "Answers",
  props: {
    answers: Array,
    answerJustification: {
      type: String,
      required: false,
      default: ""
    },
    answerJustificationSource: {
      type: String,
      required: false,
      default: ""
    },
    justifications: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data() {
    return {
      letters: ["A. ", "B. ", "C. ", "D. "]
    };
  },
  computed: {
    correctAnswerOption() {
      const correctOptions = [];

      for (const index in this.answers) {
        const answer = this.answers[index];

        if (answer.value) {
          correctOptions.push(this.letters[index].split(".")[0]);
        }
      }

      return correctOptions.join(" - ");
    }
  },
  methods: {
    checkUrl(url) {
      const noHttp = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

      return noHttp.test(url);
    },
    justificationSourceUrl(url) {
      if (!url.startsWith("http")) {
        return `https://${url}`;
      }

      return url;
    }
  }
};
</script>

<style>
.answer-block {
  display: flex;
  flex-wrap: wrap;
}

.answers__justification {
  margin-bottom: 1rem;
}

.answers__source a {
  text-decoration: none;
  color: #0009 !important;

  pointer-events: none;
}

.answers__source a.link {
  text-decoration: underline;
  color: rgb(26, 174, 219) !important;

  pointer-events: all;
}
</style>
