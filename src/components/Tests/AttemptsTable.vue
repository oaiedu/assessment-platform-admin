<template>
  <v-data-table
    hide-default-footer
    class="attempts-table"
    no-data-text="Não há tentativas no momento"
    :headers="headersAttempts"
    :items="attempts"
  >
    <template v-slot:[`item.index`]="{ item }">
      {{ item.index + 1 }}
    </template>

    <template v-slot:[`item.date`]="{ item }">
      {{ getDateSentence(item.date) }}
    </template>

    <template v-slot:[`item.answers`]="{ item }">
      {{ item.answers.length }}/{{ item.questions.length }}
    </template>

    <template v-slot:[`item.score`]="{ item }">
      <span
        :class="{
          'font-weight-medium': !item.score || item.score === 100,
          'green--text': item.score === 100,
          'red--text': !item.score
        }"
      >
        {{ item.score.toFixed(2) }}%
      </span>
    </template>

    <template v-slot:[`item.timeTaken`]="{ item }">
      {{ item.timeTaken.hours }}h {{ item.timeTaken.minutes }}m
      {{ item.timeTaken.seconds }}s
    </template>

    <template v-slot:[`item.mode`]="{ item }">
      {{ getModeSentence(item.mode) }}
    </template>

    <template v-slot:[`item.result`]="{ item }">
      <span
        class="font-weight-medium"
        :class="{
          'green--text': item.approved,
          'red--text': !item.approved
        }"
      >
        {{ item.approved ? "Passou" : "Falhou" }}
      </span>
    </template>

    <template v-slot:[`item.review`]="{ item }">
      <v-btn text small color="blue" @click="reviewAttempt(item)"
        >Revisar</v-btn
      >
    </template>
  </v-data-table>
</template>

<script>
import { months, weekDays } from "../../utils/date";

export default {
  name: "AttemptsTable",
  props: {
    attempts: Array
  },
  data() {
    return {
      headersAttempts: [
        { text: "#", value: "index", sortable: false, align: "center" },
        { text: "Data", value: "date", sortable: false, align: "center" },
        {
          text: "Respostas",
          value: "answers",
          sortable: false,
          align: "center"
        },
        {
          text: "Pontuação",
          value: "score",
          sortable: false,
          align: "center"
        },
        {
          text: "Tempo Gasto",
          value: "timeTaken",
          sortable: false,
          align: "center"
        },
        { text: "Modo", value: "mode", sortable: false, align: "center" },
        {
          text: "Resultado",
          value: "result",
          sortable: false,
          align: "center"
        },
        { text: "Revisar", value: "review", sortable: false, align: "center" }
      ]
    };
  },
  methods: {
    getDateSentence(iso) {
      const date = new Date(iso);

      return `${weekDays[date.getDay()].substring(
        0,
        3
      )}, ${date.getDate()} ${months[date.getMonth()].substring(
        0,
        3
      )} ${date.getFullYear()}`;
    },
    getModeSentence(mode) {
      switch (mode) {
        case "practice":
          return "Treino";
        case "exam":
          return "Exame";
        default:
          return "Indefinido";
      }
    },
    reviewAttempt(item) {
      this.$emit("reviewAttempt", item);
    }
  }
};
</script>

<style scoped>
.attempts-table /deep/ tbody tr {
  transition: background-color 0.1s ease;
}

.attempts-table /deep/ tbody tr:hover {
  background-color: #f7f7f7 !important;
}
</style>
