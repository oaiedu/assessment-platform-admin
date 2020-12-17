<template>
  <p>
    DISCIPLINA: {{question.subject}}
    <br />
    CONHECIMENTO: {{question.knowledge}} [{{question.knowledgePWR}}/{{question.knowledgePWR}}]
    <br />
    IQ: {{question.iq}}
    <br />

    <br/>
      {{question.question}}
    <br/>
  </p>
</template>

<script>
export default {
  props: ["question"]
}
</script>
