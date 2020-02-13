<template>
  <v-app>
    <v-container>
      <v-container>
          <v-container>
            <v-text-field
              v-model="search"
              filled
              rounded
              dense
              append-icon="mdi-magnify"
              label="Search for IQ"
              single-line
              hide-details
            ></v-text-field>
          </v-container>
      </v-container>

      <v-container>
        <v-card>
          <v-data-table
            :headers="headers"
            :items="tests"
            :page.sync="page"
            :items-per-page="itemsPerPage"
            :search="search"
            hide-default-footer
            class="elevation-1"
            @page-count="pageCount = $event"
          >
            <template small v-slot:item.actions="{ item }">
              <router-link class="mr-10" style="text-decoration: underline white;" :to="{name:'test',params:{testId:item.id}}" replace>
                <v-icon>mdi-pdf-box</v-icon>
              </router-link>
              <v-icon class="mr-2">mdi-pencil</v-icon>
              <v-icon @click="deleteTestSnackBar = true; deleteSelect = item">mdi-delete</v-icon>
              <!-- <v-icon small class="mr-2" @click="generatePdf(item)">mdi-format-align-left</v-icon>
              <v-icon small class="mr-2" @click="generatePdf(item)">mdi-format-align-left</v-icon> -->
            </template>
          </v-data-table>
        </v-card>
      </v-container>

      <v-btn fixed dark fab bottom right color="cyan" @click.stop="dialogNewTest = true">
        <v-icon>mdi-plus</v-icon>
      </v-btn>

      <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialogNewTest">
        <NewTest @closeDialogNew="dialogNewTest = false"></NewTest>
      </v-dialog>

      <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialogHtmlTest">
        <HtmlTest :test="selectedTest"></HtmlTest>
      </v-dialog>

      <div class="text-center pt-2">
        <v-pagination v-model="page" :length="pageCount"></v-pagination>
      </div>
      <v-snackbar v-model="deleteTestSnackBar" color="black" right top>
        Você realmente quer deletar esta prova?
        <v-btn dark color="yellow" text @click="deleteTest(deleteSelect.id)">Ok</v-btn>
        <v-btn dark color="yellow" text @click="deleteTestSnackBar = false">Cancelar</v-btn>
      </v-snackbar>

    </v-container>
  </v-app>
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
      search: "",
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
    }
  },
  methods: {
    generatePdf(item){
      this.selectedTest = item
      this.dialogHtmlTest = true
    },
    deleteTest(id) {
      this.$store.dispatch("deleteTest", id);
      this.deleteTestSnackBar = false;
      this.loadTests();
    },
    loadTests() {
      this.$store.dispatch("loadedTests");
    }
  }
};
</script>
