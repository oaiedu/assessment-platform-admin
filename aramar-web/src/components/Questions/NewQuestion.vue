<template>
  <v-container class="fill-height" fluid>
    <v-row align="center">
      <v-flex xs12 sm6 offset-sm3>
        <v-card>
          <v-card-text>
            <v-container>
              <form @submit.prevent="onCreateQuestion">
                <v-row>
                  <v-flex xs12>
                    <v-text-field name="id" label="ID" id="id" v-model="id" required></v-text-field>
                  </v-flex>
                </v-row>
                <v-row>
                  <v-flex xs12>
                    <v-text-field
                      name="knowledge"
                      label="Conhecimento"
                      id="knowledge"
                      v-model="knowledge"
                      required
                    ></v-text-field>
                  </v-flex>
                </v-row>
                <v-row>
                  <v-flex xs12>
                    <v-text-field
                      name="knowledgePWR"
                      label="Conhecimento PWR"
                      id="knowledgePWR"
                      v-model="knowledgePWR"
                      required
                    ></v-text-field>
                  </v-flex>
                </v-row>
                <v-row>
                  <v-flex xs12>
                    <v-text-field
                      name="knowledgeBWR"
                      label="Conhecimento BWR"
                      id="knowledgeBWR"
                      v-model="knowledgeBWR"
                      required
                    ></v-text-field>
                  </v-flex>
                </v-row>
                <v-row>
                  <v-flex xs12>
                    <v-select
                      :items="items"
                      name="subject"
                      id="subject"
                      v-model="subject"
                      label="Disciplina"
                      solo
                    ></v-select>
                  </v-flex>
                </v-row>
                <v-row>
                  <v-flex xs12>
                    <v-container fluid>
                      <p>Questão</p>
                      <v-textarea
                        outlined
                        filled
                        name="questionDescription"
                        id="questionDescription"
                        v-model="questionDescription"
                      ></v-textarea>
                    </v-container>
                  </v-flex>
                </v-row>
                <v-row>
                  <v-flex xs12>
                    <v-container fluid>
                      <p>Respotas</p>
                      <v-row>
                        <v-col>
                          <v-switch v-model="multipleAnswer" label="Multiple"></v-switch>
                        </v-col>
                        <v-col v-if="multipleAnswer">
                          <v-select
                            :items="columnItems"
                            v-model="columns"
                            label="Número de Colunas"
                            solo
                          ></v-select>
                        </v-col>
                      </v-row>
                      <v-radio-group v-if="!multipleAnswer" v-model="test">
                        <v-row v-for="item in answers" :key="item.ansId">
                          <v-radio :value="item.ansId"></v-radio>
                          <v-text-field v-model="item.text"></v-text-field>
                        </v-row>
                      </v-radio-group>
                      <v-radio-group v-else v-model="test">
                        <v-row>
                          <v-col v-for="i in columns" :key="i">
                            <v-text-field v-model="auxTitle[i-1]"></v-text-field>
                          </v-col>
                        </v-row>
                        <v-row v-for="item in answers" :key="item.ansId">
                          <v-radio :value="item.ansId"></v-radio>
                          <v-col v-for="answerItem in item.text" :key="answerItem.title">
                            <v-text-field v-model="answerItem.answerDescription"></v-text-field>
                          </v-col>
                        </v-row>
                      </v-radio-group>
                    </v-container>
                  </v-flex>
                </v-row>
                {{ answers }}
                <v-btn class="primary" :disabled="!formIsValid" type="submit">Create Question</v-btn>
              </form>
            </v-container>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      test: null,
      columns: null,
      radios: "aaaa",
      multipleAnswer: false,
      auxTitle: [],
      answers: [
        { text: "", ansId: "radio-1", value: false },
        { text: "", ansId: "radio-2", value: false },
        { text: "", ansId: "radio-3", value: false },
        { text: "", ansId: "radio-4", value: false }
      ],
      questionDescription: "",
      id: "",
      subject: "",
      knowledge: "",
      knowledgePWR: "",
      knowledgeBWR: "",
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
      columnItems: [2, 3, 4, 5]
    };
  },
  computed: {
    formIsValid() {
      console.log(this.test);
      return (
        this.id !== "" &&
        this.questionDescription !== "" &&
        this.knowledge !== "" &&
        this.knowledgePWR !== "" &&
        this.knowledgeBWR !== "" &&
        this.subject !== ""
      );
    }
  },
  watch: {
    multipleAnswer(val) {
      if (!val) {
        this.answers.forEach(element => {
          element.text = "";
        });
      } else {
        this.answers.forEach(element => {
          let aux = [];
          for (var i = 0; i < this.columns; i++) {
            aux.push({ title: "", answerDescription: "" });
          }
          element.text = aux;
        });
      }
    },
    columns(val) {
      console.log(val);
      this.answers.forEach(element => {
        let aux = [];
        for (var i = 0; i < this.columns; i++) {
          aux.push({ title: "", answerDescription: "" });
        }
        element.text = aux;
      });
    },
    auxTitle(val) {
      this.answers.forEach(element => {
        for (var i = 0; i < this.columns; i++) {
          element.text[i].title = this.auxTitle[i];
        }
      });
    },
    test(val) {
      this.radios = val;
      console.log("1");
      this.answers.forEach(element => {
        console.log("2");

        if (element.ansId === val) {
          console.log("3");

          element.value = true;
        } else {
          console.log("4");

          element.value = false;
        }
      });
    }
  },
  methods: {
    onCreateQuestion() {
      if (!this.formIsValid) {
        return;
      }
      const questionData = {
        id: this.id,
        subject: this.subject,
        questionDescription: this.questionDescription,
        knowledge: this.knowledge,
        knowledgePWR: this.knowledgePWR,
        knowledgeBWR: this.knowledgeBWR,
        answers: this.answers
      };
      this.$store.dispatch("createQuestion", questionData);
      this.$router.push("/questions");
    }
  }
};
</script>