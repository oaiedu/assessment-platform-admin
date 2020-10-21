<template>
  <div>
    <v-overlay :value="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <v-container>
      <v-container>
          <v-container>
            <v-text-field
              v-model="search"
              filled
              rounded
              dense
              append-icon="mdi-magnify"
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
            <template small v-slot:[`item.actions`]="{ item }">
              <v-row justify="end">
                <router-link class="mr-6" style="text-decoration: none;" :to="{name:'test',params:{testId:item.id}}" replace>
                  <v-icon>mdi-pdf-box</v-icon>
                </router-link>
                <v-icon @click="editTest(item)" class="mr-2">mdi-pencil</v-icon>
                <v-icon @click="deleteTestSnackBar = true; deleteSelect = item" class="mr-2">mdi-delete</v-icon>
              </v-row>
            </template>
          </v-data-table>
        </v-card>
      </v-container>

      <v-tooltip left>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" fixed dark fab bottom right color="cyan" @click.stop="dialogNewTest = true">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        <span>Criar Prova</span>
      </v-tooltip>

      <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialogNewTest">
        <NewTest @closeDialogNew="dialogNewTest = false"></NewTest>
      </v-dialog>

      <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialogHtmlTest">
        <HtmlTest :test="selectedTest"></HtmlTest>
      </v-dialog>

      <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialogEditTest">
        <EditTest @closeDialogNew="dialogEditTest = false" :test="selectedTest"></EditTest>
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
  </div>
</template>

<script>
    import NewTest from './NewTestForm'
    import HtmlTest from './HtmlToPdfTest'
    import EditTest from './EditTest'

export default {
    components: {
        NewTest,
        HtmlTest,
        EditTest
    },
    data() {
        return {
            search: "",
            deleteTestSnackBar: false,
            dialogNewTest: false,
            dialogHtmlTest: false,
            dialogEditTest: false,
            page: 1,
            pageCount: 15,
            itemsPerPage: 10,
            selectedTest: null,
            headers: [
                { text: "Nome", align: "start",  value: "data.title" },
                { text: "Questões", align: "left",  value: "data.questions.length" },
                { text: "Tipo", align: "left",  value: "data.type" },
                { text: "Ações", align:"right", value: "actions", sortable: false }
            ]
        }
    },
    computed: {
        loading () {
            return this.$store.getters.loading;
            this.$store.dispatch('clearLoading');
        },
        tests() {
            return this.$store.getters.loadedTests;
        }
    },
    methods: {
        editTest(item){
            this.selectedTest = item;
            this.dialogEditTest = true;
        },
        deleteTest(id) {
            let aux = this.$store.dispatch("deleteTest", id);
            aux.then(()=>{
                this.deleteTestSnackBar = false;
                this.loadTests();
            });
        },
        loadTests() {
            console.log("é mano");
            let aux = this.$store.dispatch("loadedTests");
            aux.then(()=>{
                return aux;
            });
        }
    },
    mounted() {
        this.loadTests();
    }
};
</script>
