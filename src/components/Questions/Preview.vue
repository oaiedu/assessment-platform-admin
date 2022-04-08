<template>
  <v-card fill>
    <v-card-title>Preview</v-card-title>
    <v-card-text>
      {{ $t('TEST.QUIZ.subject') }} {{ subject }}
      <br />
      ID: {{ name }}
      <br />

      <br />
      <div
        v-if="questionDesc"
        v-html="questionDesc"
        class="preview-description"
      ></div>
      <br />

      <v-row justify="center" v-if="image && image !== ''">
        <img
          style="max-height: 360px; max-width: 480px"
          :src="image"
          alt="image"
        />
      </v-row>

      <Answers
        :answers="answers"
        :answerJustification="answerJustification"
        :answerJustificationSource="answerJustificationSource"
        :style="{ marginTop: (image ? 30 : 0) + 'px' }"
      />
    </v-card-text>
  </v-card>
</template>

<script>
import Answers from "./Answers";

export default {
  name: "PreviewQuestions",
  props: {
    name: String,
    subject: String,
    questionDesc: String,
    answers: Array,
    image: String,
    answerJustification: {
      type: String,
      required: false,
      default: ""
    },
    answerJustificationSource: {
      type: String,
      required: false,
      default: ""
    }
  },
  components: { Answers }
};
</script>

<style>
.answer-block {
  margin: 0 !important;
}

.answer-block .col {
  padding: 0 10px 0 10px !important;
}
</style>
