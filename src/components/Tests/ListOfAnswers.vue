<template>
  <div class="question-page">
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">Questão</th>
            <th class="text-left">Nome</th>
            <th class="text-left">Resposta</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in table" :key="item.name">
            <td>{{ item.question }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.answer }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </div>
</template>

<script>
export default {
  name: "ListOfAnswersTest",
  props: ["questions"],
  data() {
    return {
      letters: ["A", "B", "C", "D"]
    };
  },
  computed: {
    table() {
      const result = [];

      for (let i = 0; i < this.questions.length; i++) {
        const data = { question: "", name: "", answer: "" };
        data.question = i + 1;
        data.name = this.questions[i].name;

        for (let j = 0; j < 4; j++) {
          if (this.questions[i].answers[j].value == true) {
            data.answer = this.letters[j];
          }
        }
        result.push(data);
      }

      return result;
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
