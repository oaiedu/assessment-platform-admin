<template>
  <div>
    <div v-for="(question, index) in questions" :key="question.name">
      <div class="question-page">
        QUESTÃO {{ index + 1 }}
        <br />
        <br />

        <Definition :question="question" />

        <CustomImage
          v-if="confirmImage(question.image)"
          :image="question.image"
          :imageSize="question.imageSize"
        />

        <br />

        <Answers :answers="question.answers" />
      </div>
    </div>
  </div>
</template>

<script>
import Definition from "../Questions/Definition";
import CustomImage from "../Questions/QuestionImage";
import Answers from "../Questions/Answers";

export default {
  name: "TestQuestions",
  props: ["questions"],
  components: { Definition, CustomImage, Answers },
  methods: {
    confirmImage(image) {
      return image && image.length > 0;
    }
  }
};
</script>

<style>
@media print {
  .question-page {
    font-size: 13px;
    page-break-after: always !important;
  }
}
</style>
