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
            :items="questions"
            :page.sync="page"
            :items-per-page="itemsPerPage"
            :search="search"
            hide-default-footer
            class="elevation-1"
            @page-count="pageCount = $event"
          >
            <template v-slot:item.actions="{ item }">
              <v-row justify="end">
                <v-icon class="mr-6" @click="console.log(item)">mdi-pdf-box</v-icon>
                <v-icon class="mr-2">mdi-check-bold</v-icon>
                <v-icon class="mr-2">mdi-delete</v-icon>
              </v-row>
            </template>
          </v-data-table>
        </v-card>
      </v-container>

      <div class="text-center pt-2">
        <v-pagination v-model="page" :length="pageCount" total-visible="7"></v-pagination>
      </div>
    </v-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      search: "",
      page: 1,
      pageCount: 15,
      itemsPerPage: 8,
      headers: [
        { text: "IQ", align: "left", sortable: false, value: "id" },
        { text: "Conhecimento", value: "data.CONHECIMENTO" },
        { text: "Relevância OR", value: "data.RELEVANCIA_OR" },
        { text: "Relevância OSR", value: "data.RELEVANCIA_OSR" },
        { text: "Disciplina", value: "data.DISCIPLINA", sortable: false },
        { text: "Ações", align: "right", value: "actions", sortable: false }
      ]
    };
  },
  computed: {
    loading() {
      return this.$store.getters.loading;
      this.$store.dispatch("clearLoading");
    },
    questions() {
      return this.$store.getters.loadedQuestions;
    }
  }
};
</script>