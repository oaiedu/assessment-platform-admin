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
          <v-icon small class="mr-2">mdi-delete</v-icon>
          <v-icon small class="mr-2" @click="generatePdf(item)">mdi-format-align-left</v-icon>
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
      dialogNewTest: false,
      dialogHtmlTest: false,
      page: 1,
      pageCount: 15,
      itemsPerPage: 10,
      selectedTest: null,
      headers: [
        { text: "Nome", align: "left",  value: "data.title" },
        { text: "", value: "actions", sortable: false }
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
    }
  }
};
</script>
