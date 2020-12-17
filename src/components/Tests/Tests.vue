<template>
  <div>
    <v-container>
      <v-container>
          <h1 class="text-center blue--text">Gerenciar Provas</h1>
      </v-container>

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
            :loading="loading"
            loading-text="Carregando provas..."
            hide-default-footer
            class="elevation-1"
            @page-count="pageCount = $event"
          >
            <template v-slot:[`item.type`]='{ item }'>
                {{ item.type === 'selected' ? 'Selecionado' : 'Aleatório' }}
            </template>

            <template small v-slot:[`item.actions`]="{ item }">
              <v-row justify="end">
                <router-link class="mr-6" style="text-decoration: none;" :to="`/tests/${item.id}`" replace>
                  <v-icon>mdi-pdf-box</v-icon>
                </router-link>
                <v-icon
                    v-if='!userClaims["student"]'
                    @click="editTest(item)"
                    class="mr-2">
                    mdi-pencil
                </v-icon>
                <v-icon
                    v-if='!userClaims["student"]'
                    @click="deleteTestSnackBar = true; deleteSelect = item"
                    class="mr-2">
                    mdi-delete
                </v-icon>
              </v-row>
            </template>
          </v-data-table>
        </v-card>
      </v-container>

      <v-tooltip left v-if='!userClaims["student"]'>
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
                { text: "Nome", align: "start",  value: "title" },
                { text: "Questões", align: "left",  value: "questions.length" },
                { text: "Tipo", align: "left",  value: "type" },
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
        },
        userClaims() {
            return this.$store.getters.getUserClaims;
        }
    },
    methods: {
        editTest(item){
            this.selectedTest = item;
            this.dialogEditTest = true;
        },
        deleteTest(id) {
            this.$store.dispatch("deleteTest", id).then(() => {
                this.deleteTestSnackBar = false;
                this.loadTests();
            });
        }
    },
    mounted() {
        this.$store.dispatch("loadedTests");
    }
};
</script>
