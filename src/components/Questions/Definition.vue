<template>
  <div>
    <strong>{{ question.name }}</strong>
    <br />
    {{ question.subject }}
    <br />

    <br />
    <div
      v-if="question.question"
      v-html="question.question"
      class="definition-description"
    ></div>
    <br />
  </div>
</template>

<script>
export default {
  name: "Definition",
  props: ["question"]
};
</script>
