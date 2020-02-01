<template>
  <p>
    ASSUNTO: {{question.data.DISCIPLINA}}
    <br />
    CONHECIMENTO: {{question.data.CONHECIMENTO}} [{{question.data.RELEVANCIA_OR}}/{{question.data.RELEVANCIA_OSR}}]
    <br />
    IQ: {{question.id}}
    <br />

    <br/>
      {{question.data.PERGUNTA}}
    <br/>
  </p>
</template>

<script>
export default {
  data() {
    return {

    }
  },
  props: ["question"]
}
</script>
