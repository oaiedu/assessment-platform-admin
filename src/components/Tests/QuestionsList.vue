<template>
  <div class="question-page">
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-center">QUESTÃO</th>
            <th class="text-center">DISCIPLINA</th>
            <th class="text-center">QUESTÃO DE REFERÊNCIA</th>
            <th class="text-center">Obs.</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in infoTable" :key="item.name">
            <td class="text-center">{{ item.question }}</td>
            <td class="text-center">{{ item.subject }}</td>
            <td class="text-center">{{ item.name }}</td>
            <td class="text-center">{{ item.obs }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </div>
</template>

<script>
export default {
  name: "QuestionsList",
  props: ["questions"],
  computed: {
    infoTable() {
      const result = [];

      for (let i = 0; i < this.questions.length; i++) {
        const data = { question: "", subject: "", name: "", obs: "" };
        data.question = i + 1;
        data.subject = this.questions[i].subject;
        data.name = this.questions[i].name;
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
