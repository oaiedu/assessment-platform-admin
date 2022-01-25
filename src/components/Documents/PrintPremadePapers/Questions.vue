<template>
  <v-container>
    <QuestionsList :questions="questions" />

    <v-tooltip right>
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-on="on" v-bind="attrs" fixed fab bottom left @click="back()">
          <v-icon>{{ mdiArrowLeft }}</v-icon>
        </v-btn>
      </template>
      <span>Voltar</span>
    </v-tooltip>
  </v-container>
</template>

<script>
import { mdiArrowLeft } from "@mdi/js";
import QuestionsList from "../../Tests/QuestionsList";

export default {
  name: "PPQuestions",
  components: { QuestionsList },
  computed: {
    questions() {
      return [
        {
          subject: "Disciplina 1",
          name: "P0001"
        },
        {
          subject: "Disciplina 2",
          name: "P0002"
        },
        {
          subject: "Disciplina 3",
          name: "P0003"
        },
        {
          subject: "Disciplina 4",
          name: "P0004"
        }
      ];
    }
  },
  data() {
    return {
      mdiArrowLeft
    };
  },
  methods: {
    back() {
      this.$emit("closeDialogQuestions");
    }
  }
};
</script>

<style></style>
