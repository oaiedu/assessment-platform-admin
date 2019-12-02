<template>
  <v-app>
    <v-form @submit.prevent="onCreateTest">
      <v-text-field
        filled
        dense
        label="Test Name"
        single-line
        hide-details
        rounded
        v-model="testName"
      ></v-text-field>
      <v-container>
        <v-container fluid>
          <v-card>
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

            <v-col>
              <v-menu close-on-click offset-x transition="slide-x-transition">
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on" fab small color="ligh purple">
                    <v-icon>mdi-playlist-plus</v-icon>
                  </v-btn>
                </template>

                <v-list>
                  <v-list-item v-for="(item,i) in items" :key="item" @click="selections(i)">
                    <v-list-item-title>{{ item }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-col>

            <v-container>
              <v-row>
                <v-chip
                  v-for="(tag,i) in selectedSubjects"
                  :key="tag"
                  class="ma-2"
                  close
                  @click:close="removeSelections(i)"
                >{{ tag }}</v-chip>
              </v-row>
            </v-container>
          </v-card>
        </v-container>

        <v-container fluid>
          <v-card v-if="selectedSubjects.length == 0 ">
            <v-data-table
              v-model="selectedQuestions"
              :headers="headers"
              :items="questions"
              :page.sync="page"
              :items-per-page="itemsPerPage"
              :search="search"
              show-select
              item-key="id"
              hide-default-footer
              class="elevation-1"
              @page-count="pageCount = $event"
            ></v-data-table>
          </v-card>

          <v-card v-else>
            <v-data-table
              v-model="selectedQuestions"
              :headers="headers"
              :items="showedQuestions"
              :page.sync="page"
              :items-per-page="itemsPerPage"
              :search="search"
              show-select
              item-key="id"
              hide-default-footer
              class="elevation-1"
              @page-count="pageCount = $event"
            ></v-data-table>
          </v-card>
        </v-container>

        <v-btn class="primary" type="submit">Create Test</v-btn>

        <div class="text-center pt-2">
          <v-pagination v-model="page" :length="pageCount"></v-pagination>
        </div>
      </v-container>
    </v-form>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      selectedSubjects: [],
      selectedQuestions: [],
      testItems: [],
      testName: "",
      items: [
        "Teoria do Reator",
        "Termodinâmica",
        "Instrumentação e Controle",
        "Válvulas e Bombas",
        "Eletricidade",
        "Mecânica dos Fluidos",
        "Tratamento Qúimico Refrigerante",
        "Análise Integrada",
        "Instrumentação Nuclear",
        "Física Nuclear",
        "Transferência de Calor",
        "Materiais"
      ],
      showedQuestions: [],
      search: "",
      page: 1,
      pageCount: 15,
      itemsPerPage: 10,
      headers: [
        { text: "IQ", align: "left", sortable: false, value: "id" },
        { text: "Conhecimento", value: "data.CONHECIMENTO" },
        { text: "Relevância OR", value: "data.RELEVANCIA_OR" },
        { text: "Relevância OSR", value: "data.RELEVANCIA_OSR" },
        { text: "Disciplina", value: "data.DISCIPLINA", sortable: false },
        { text: "", value: "actions", sortable: false }
      ]
    };
  },
  computed: {
    questions() {
      return this.$store.getters.loadedQuestions;
    },
    loadQuestions() {
      this.$store.dispatch("loadedQuestions");
    }
  },
  watch: {
    selectedSubjects(val) {
      this.questions.forEach(element => {
        for (let i = 0; i < this.selectedSubjects.length; i++) {
          if (element.data.DISCIPLINA == this.selectedSubjects[i]) {
            let aux = true;
            for (let k = 0; k < this.showedQuestions.length; k++) {
              if (element === this.showedQuestions[k]) aux = false;
            }
            if (aux == true) this.showedQuestions.push(element);
          }
        }
      });
    }
  },
  methods: {
    removeSelections(i) {
      let aux = this.showedQuestions.length;

      for (let j = 0; j < aux; j++) {
        if (
          this.showedQuestions[j].data.DISCIPLINA == this.selectedSubjects[i]
        ) {
          this.showedQuestions.splice(j, 1);
          j--;
          aux--;
        }
      }

      this.selectedSubjects.splice(i, 1);
    },
    selections(i) {
      let aux = false;
      for (let j = 0; j < this.selectedSubjects.length; j++) {
        if (this.items[i] == this.selectedSubjects[j]) aux = true;
      }

      if (aux == false) this.selectedSubjects.push(this.items[i]);
    },
    onCreateTest() {
      console.log("hey");
      this.selectedQuestions.forEach(element => {
        this.testItems.push(element.id);
      });

      const testData = { name: this.testName, questions: this.testItems };

      this.$store.dispatch("createTest", testData);
      this.$router.push("/questions");
      this.$store.dispatch("loadedTests");
    }
  }
};
</script>