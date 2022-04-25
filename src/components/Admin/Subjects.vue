<template>
  <v-container class="subjects-table mt-4">
    <v-row class="ma-0 pa-0">
      <v-text-field
        v-model="search"
        clearable
        dense
        outlined
        rounded
        color="blue"
        style="max-width: 400px"
        :label="$t('ADMIN.search')"
      ></v-text-field>

      <v-spacer></v-spacer>

      <v-btn
        v-if="!addingSubject"
        dark
        rounded
        width="240"
        color="blue"
        @click="addingSubject = true"
      >
        {{ $t("ADMIN.SUBJECTS.add_subject") }}
        <v-icon right dark size="24">{{ mdiPlus }}</v-icon>
      </v-btn>

      <v-row v-else class="pa-0 ma-0" justify="end" align="end">
        <v-text-field
          autofocus
          style="max-width: 240px !important"
          v-model="subjectName"
          @keyup="!creationDisabled && $event.key === 'Enter' && addSubject()"
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
          <span>{{ $t("AUTH.SUBJECT.confirm") }}</span>
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
          <span>{{ $t("ADMIN.cancel") }}</span>
        </v-tooltip>
      </v-row>
    </v-row>

    <v-card outlined class="mt-5" style="border-radius: 26px; overflow: hidden">
      <v-data-table
        :loading-text="$t('ADMIN.SUBJECTS.loading_subjects')"
        :no-data-text="$t('ADMIN.SUBJECTS.no_subjects')"
        :headers="
          headers.map(h => ({
            ...h,
            text: $t('ADMIN.SUBJECTS.HEADERS.' + h.text)
          }))
        "
        :items="subjects"
        :loading="loading"
        :search="search"
      >
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
            <span>{{ $t("ADMIN.delete") }}</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <v-snackbar
      v-model="deleteSnackbar"
      color="white"
      light
      right
      top
      :timeout="15000"
    >
      {{ $t("ADMIN.SUBJECTS.warning") }}
      <v-btn
        dark
        class="ml-3"
        color="blue"
        text
        @click="deleteSubject(deleteItem)"
      >
        {{ $t("ADMIN.delete") }}
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
        {{ $t("ADMIN.cancel") }}
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
          {{ $t("ADMIN.SUBJECTS.text_1") }}
          <br />
          {{ $t("ADMIN.SUBJECTS.text_2") }}
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
    search: "",
    addingSubject: false,
    subjectName: "",
    deleteWarning: false,
    deleteSnackbar: false,
    deleteItem: null,
    headers: [
      { text: "name", align: "left", value: "name", sortable: true },
      { text: "questions", align: "center", value: "amount", sortable: true },
      { text: "actions", align: "right", value: "actions", sortable: false }
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

      await this.$store.dispatch("deleteSubject", subject);
    }
  }
};
</script>

<style>
.subjects-table .v-text-field__details {
  display: none !important;
}
</style>
