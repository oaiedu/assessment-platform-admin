<template>
  <v-container class="subjects-table">
    <v-data-table
      no-data-text="Não há assuntos"
      loading-text="Carregando assuntos"
      :headers="headers"
      :items="subjects"
      :loading="loading"
    >
      <template v-slot:top>
        <v-toolbar flat dense>
          <v-spacer></v-spacer>
          <v-btn
            v-if="!addingSubject"
            dark
            width="222"
            color="blue"
            @click="addingSubject = true"
          >
            Adicionar assunto
            <v-icon right dark size="24">{{ mdiPlus }}</v-icon>
          </v-btn>

          <v-row v-else class="pa-0 ma-0" justify="end" align="end">
            <v-text-field
              autofocus
              style="max-width: 222px !important"
              v-model="subjectName"
              @keyup="
                !creationDisabled && $event.key === 'Enter' && addSubject()
              "
            ></v-text-field>

            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  style="width: 40px; height: 40px"
                  v-on="on"
                  :disabled="creationDisabled"
                  @click="addSubject()"
                >
                  <v-icon color="green">{{ mdiCheck }}</v-icon>
                </v-btn>
              </template>
              <span>Confirmar</span>
            </v-tooltip>

            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  style="width: 40px; height: 40px"
                  v-on="on"
                  @click="
                    subjectName = '';
                    addingSubject = false;
                  "
                >
                  <v-icon color="red">{{ mdiClose }}</v-icon>
                </v-btn>
              </template>
              <span>Cancelar</span>
            </v-tooltip>
          </v-row>
        </v-toolbar>
      </template>

      <template v-slot:[`item.questions`]="{ item }">
        {{ item.questions.length }}
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              v-on="on"
              @click="
                deleteItem = item;
                deleteSnackbar = true;
              "
            >
              <v-icon color="red">{{ mdiDelete }}</v-icon>
            </v-btn>
          </template>
          <span>Excluir</span>
        </v-tooltip>
      </template>
    </v-data-table>

    <v-snackbar
      v-model="deleteSnackbar"
      color="white"
      light
      right
      top
      :timeout="15000"
    >
      Tem certeza de que deseja excluir este Assunto?

      <v-btn
        dark
        class="ml-3"
        color="blue"
        text
        @click="deleteSubject(deleteItem)"
      >
        Excluir
      </v-btn>

      <v-btn
        dark
        color="grey"
        text
        @click="
          deleteSnackbar = false;
          deleteItem = null;
        "
      >
        Cancelar
      </v-btn>
    </v-snackbar>

    <v-snackbar
      dark
      top
      color="orange"
      style="display: flex"
      v-model="deleteWarning"
      :timeout="15000"
    >
      <v-row class="pa-0 ma-0" align="center">
        <span class="font-weight-medium">
          Não é possível excluir assuntos que estão sendo usados em questões!
          <br />
          Certifique-se de que o número de questões seja igual a 0.
        </span>

        <v-btn dark class="ml-3" icon @click="deleteWarning = false">
          <v-icon dark>{{ mdiClose }}</v-icon>
        </v-btn>
      </v-row>
    </v-snackbar>
  </v-container>
</template>

<script>
import { mdiPlus, mdiPencil, mdiDelete, mdiCheck, mdiClose } from "@mdi/js";

export default {
  name: "Subjects",
  data: () => ({
    mdiPlus,
    mdiPencil,
    mdiDelete,
    mdiCheck,
    mdiClose,
    addingSubject: false,
    subjectName: "",
    deleteWarning: false,
    deleteSnackbar: false,
    deleteItem: null,
    headers: [
      { text: "Nome", align: "left", value: "name", sortable: true },
      { text: "Questões", align: "center", value: "amount", sortable: true },
      { text: "Ações", align: "right", value: "actions", sortable: false }
    ]
  }),
  computed: {
    subjects() {
      return [...this.$store.state.Subject.subjects]
        .sort((s1, s2) => (s1.name < s2.name ? -1 : 1))
        .map(s => ({ ...s, amount: this.getQuestionsAmount(s.name) }));
    },
    loading() {
      return this.$store.getters.loading;
    },
    creationDisabled() {
      return (
        this.subjectName.length === 0 ||
        this.subjects
          .map(s => s.name.toLowerCase())
          .includes(this.subjectName.toLowerCase())
      );
    }
  },
  methods: {
    getQuestionsAmount(subjectName) {
      return this.$store.getters.getNumberOfQuestionBySubject(subjectName);
    },
    async addSubject() {
      await this.$store.dispatch("createSubject", this.subjectName);
      this.subjectName = "";
      this.addingSubject = false;
    },
    async deleteSubject(subject) {
      this.deleteSnackbar = false;
      this.deleteItem = null;

      if (this.getQuestionsAmount(subject.name) > 0) {
        this.deleteWarning = true;
        return;
      }

      await this.$store.dispatch("deleteSubject", subject.id);
    }
  }
};
</script>

<style>
.subjects-table .v-text-field__details {
  display: none !important;
}
</style>
