<template>
  <v-app>
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
                v-for="(tag,i) in selected"
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
        <v-card v-if="selected.length == 0 ">
          <v-data-table
            :headers="headers"
            :items="questions"
            :page.sync="page"
            :items-per-page="itemsPerPage"
            :search="search"
            hide-default-footer
            class="elevation-1"
            @page-count="pageCount = $event"
          ></v-data-table>
        </v-card>

        <v-card v-else>
          <v-data-table
            :headers="headers"
            :items="showedQuestions"
            :page.sync="page"
            :items-per-page="itemsPerPage"
            :search="search"
            hide-default-footer
            class="elevation-1"
            @page-count="pageCount = $event"
          ></v-data-table>
        </v-card>
      </v-container>

      <v-btn fixed dark fab bottom right color="cyan" @click.stop="dialog = true">
        <v-icon>mdi-plus</v-icon>
      </v-btn>

      <v-dialog v-model="dialog">
        <NewQuestion></NewQuestion>
      </v-dialog>

      <div class="text-center pt-2">
        <v-pagination v-model="page" :length="pageCount"></v-pagination>
      </div>
    </v-container>
  </v-app>
</template>

<script>
import NewQuestion from "./NewQuestion";
export default {
  components: {
    NewQuestion
  },
  data() {
    return {
      selected: [],
      dialog: false,
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
    selected(val) {
      this.questions.forEach(element => {
        for (let i = 0; i < this.selected.length; i++) {
          if (element.data.DISCIPLINA == this.selected[i]) {
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
        if (this.showedQuestions[j].data.DISCIPLINA == this.selected[i]) {
          this.showedQuestions.splice(j, 1);
          j--;
          aux--;
        }
      }

      this.selected.splice(i, 1);
    },
    selections(i) {
      let aux = false;
      for (let j = 0; j < this.selected.length; j++) {
        if (this.items[i] == this.selected[j]) aux = true;
      }

      if (aux == false) this.selected.push(this.items[i]);
    },
    deleteQuestion(id) {
      console.log("hey", id);
      this.$store.dispatch("deleteQuestion", id);
    }
  }
};
</script>