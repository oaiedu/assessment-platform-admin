<template>
  <div>
    DISCIPLINA: {{ question.subject }}
    <br />
    <strong>{{ question.name }}</strong>
    <br />

    <br />
    <vue-markdown :source="question.question" />
    <br />
  </div>
</template>

<script>
import VueMarkdown from "vue-markdown";
import "vue-markdown";

export default {
  name: "Definition",
  props: ["question"],
  components: {
    "vue-markdown": VueMarkdown
  }
};
</script>
