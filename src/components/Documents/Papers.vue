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
            :items="papers"
            :page.sync="page"
            :items-per-page="itemsPerPage"
            :search="search"
            hide-default-footer
            class="elevation-1"
            @page-count="pageCount = $event"
          >
            <template small v-slot:item.actions="{ item }">
              <v-row justify="end">
                <v-icon class="mr-2" @click="editPaper(item)">mdi-pencil</v-icon>
                <v-icon @click="deletePaperSnackBar = true; deleteSelect = item" class="mr-2">mdi-delete</v-icon>
              </v-row>
            </template>
          </v-data-table>
        </v-card>
      </v-container>

      <v-tooltip left>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" fixed dark fab bottom right color="cyan" @click.stop="dialogNewPaper = true">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        <span>Criar Documento</span>
      </v-tooltip>

      <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialogNewPaper">
        <NewPaper @closeDialogNew="dialogNewPaper = false"></NewPaper>
      </v-dialog>

      <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialogEditPaper">
        <EditPaper :paper="selectedEdit" @closeDialogEdit="dialogEditPaper = false"></EditPaper>
      </v-dialog>

      <div class="text-center pt-2">
        <v-pagination v-model="page" :length="pageCount"></v-pagination>
      </div>
      <v-snackbar v-model="deletePaperSnackBar" color="black" right top>
        Você realmente quer deletar esta prova?
        <v-btn dark color="yellow" text @click="deletePaper(deleteSelect.id)">Ok</v-btn>
        <v-btn dark color="yellow" text @click="deletePaperSnackBar = false">Cancelar</v-btn>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script>
import NewPaper from './CreatePaper'
import EditPaper from './EditPaper'

export default {
  components: {
    NewPaper,
    EditPaper
  },
  data: () => ({
    dialogNewPaper: false,
    dialogEditPaper: false,
    selectedEdit: {},
    headers: [
      { text: "Nome", align: "left",  value: "data.name" },
      { text: "Ações", align:"right", value: "actions", sortable: false }
    ],
    page: 1,
    pageCount: 15,
    itemsPerPage: 10,
    search: "",
    deletePaperSnackBar: false,
    deleteSelect: "",
  }),
  computed: {
    loading () {
        return this.$store.getters.loading
        this.$store.dispatch('clearLoading')
    },
    papers () {
      return this.$store.getters.loadedPapers
    }
  },
  methods: {
    editPaper(val){
      this.selectedEdit = val;
      this.loadPapers();
      this.dialogEditPaper = true;
    },
    loadPapers() {
      console.log("é mano")
      let aux = this.$store.dispatch("loadedPapers");
      aux.then(()=>{
        return aux
      })
    },
    setLoader(){
      this.loadQuestions()
    },
    deletePaper(id) {
      console.log(id);
      let aux = this.$store.dispatch("deletePaper", id);
      aux.then(()=>{
        this.deletePaperSnackBar = false;
        this.loadPapers();
      })
    }
  }
}
</script>
