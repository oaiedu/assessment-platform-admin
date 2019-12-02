<template>
  <v-container>
    <v-card>
      <v-data-table
        :headers="headers"
        :items="tests"
        :page.sync="page"
        :items-per-page="itemsPerPage"
        hide-default-footer
        class="elevation-1"
        @page-count="pageCount = $event"
      ></v-data-table>
    </v-card>

    <v-btn fixed dark fab bottom right color="cyan" @click.stop="dialog = true">
      <v-icon>mdi-plus</v-icon>
    </v-btn>

    <v-dialog v-model="dialog">
        <NewTest></NewTest>
    </v-dialog>

    <div class="text-center pt-2">
      <v-pagination v-model="page" :length="pageCount"></v-pagination>
    </div>
  </v-container>
</template>

<script>
import NewTest from './NewTestForm'
export default {
  components: {
    NewTest
  },
  data() {
    return {
      dialog: false,
      page: 1,
      pageCount: 15,
      itemsPerPage: 10,
      headers: [
        { text: "Nome", align: "left",  value: "data.TITULO" },
        { text: "Perguntas", value: "data.PERGUNTAS"}
      ]
    };
  },
  computed: {
    tests() {
      return this.$store.getters.loadedTests;
    },
    loadedTests() {
      this.$store.dispatch("loadedTests");
    }
  }
};
</script>