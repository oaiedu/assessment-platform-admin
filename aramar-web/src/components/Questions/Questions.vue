<template>
  <v-app>
    <v-container>
      <v-row justify="space-around">
        <v-btn to="/newquestion">
          <v-icon left>mdi-plus</v-icon>New Question
        </v-btn>
      </v-row>
      <v-row v-for="item in questions" :key="item">
        <v-container>
          <v-card>
            <v-card-title>{{ item.id }}</v-card-title>
            <v-card-subtitle>{{ item.data.subject }}</v-card-subtitle>
            <v-btn @click="deleteQuestion(item.id)" icon>
              <v-icon>mdi-delete</v-icon>
            </v-btn>
            <v-btn
              @click="sendQuestion"
              text
              icon
              :to="{ name: 'editquestions', params: {id: item.id} }"
              >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </v-card>
        </v-container>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
export default {
  computed: {
    questions() {
      return this.$store.getters.loadedQuestions;
    },
    loadQuestions() {
      this.$store.dispatch("loadedQuestions");
    }
  },
  methods: {
    deleteQuestion(id) {
      console.log("hey", id);
      this.$store.dispatch("deleteQuestion", id)
    }
  }
};
</script>