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
      >
        <template v-slot:item.actions="{ item }">
          <v-icon small class="mr-2">mdi-pencil</v-icon>
          <v-icon small @click="deleteTestSnackBar = true; deleteSelect = item">mdi-delete</v-icon>
          <v-icon small class="mr-2" @click="generatePdf(item)">mdi-format-align-left</v-icon>
          <v-icon small class="mr-2" @click="generatePdf(item)">mdi-format-align-left</v-icon>
          <router-link :to="{name:'test',params:{testId:item.id}}" replace>Go</router-link>
        </template>
      </v-data-table>
    </v-card>

    <v-btn fixed dark fab bottom right color="cyan" @click.stop="dialogNewTest = true">
      <v-icon>mdi-plus</v-icon>
    </v-btn>

    <v-dialog v-model="dialogNewTest">
      <NewTest></NewTest>
    </v-dialog>

    <v-dialog v-model="dialogHtmlTest">
      <HtmlTest :test="selectedTest"></HtmlTest>
    </v-dialog>

    <div class="text-center pt-2">
      <v-pagination v-model="page" :length="pageCount"></v-pagination>
    </div>
    <v-snackbar v-model="deleteTestSnackBar" color="black" right top>
      Você realmente quer deletar esta pergunta?
      <v-btn dark color="yellow" text @click="deleteTask(deleteSelect.id)">Ok</v-btn>
      <v-btn dark color="yellow" text @click="deleteTestSnackBar = false">Cancelar</v-btn>
    </v-snackbar>

  </v-container>
</template>

<script>
import NewTest from './NewTestForm'
import HtmlTest from './HtmlToPdfTest'
export default {
  components: {
    NewTest,
    HtmlTest
  },
  data() {
    return {
    deleteTestSnackBar: false,
      dialogNewTest: false,
      dialogHtmlTest: false,
      page: 1,
      pageCount: 15,
      itemsPerPage: 10,
      selectedTest: null,
      headers: [
        { text: "Nome", align: "left",  value: "data.title" },
        { text: "Questions", align: "left",  value: "data.questions.length" },
        { text: "Type", align: "left",  value: "data.type" },
        { text: "Actions", value: "actions", sortable: false }
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

  },
  methods: {
    generatePdf(item){
      this.selectedTest = item
      this.dialogHtmlTest = true
    },
    deleteTask(id) {
      this.$store.dispatch("deleteTest", id);
      this.deleteTestSnackBar = false;
      this.loadTests();
    },
    loadTests() {
      this.$store.dispatch("loadedTests");
    },

  }
};
</script>
