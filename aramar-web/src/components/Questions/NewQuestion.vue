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
                      label="knowledge"
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
                      label="knowledge PWR"
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
                      label="knowledge BWR"
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
                      name="assunto"
                      id="assunto"
                      v-model="assunto"
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
                        name="description"
                        id="description"
                        v-model="description"
                      ></v-textarea>
                    </v-container>
                  </v-flex>
                </v-row>
                <v-row>
                  <v-flex xs12>
                    <v-container fluid>
                      <p>Respostas</p>
                      <v-switch v-model="multipleAnswer" label="Multiple"></v-switch>
                      <v-radio-group v-if="!multipleAnswer" v-model="teste">
                        <v-row v-for="item in respostas" :key="item.ansId">
                          <v-radio :value="item.ansId"></v-radio>
                          <v-text-field v-model="item.text"></v-text-field>
                        </v-row>
                      </v-radio-group>
                      <v-radio-group v-else v-model="teste">
                        <v-row v-for="item in respostas" :key="item.ansId">
                          <v-radio :value="items.ansId"></v-radio>
                          <v-col v-for="potato in item.text" :key="potato.title">
                            <v-text-field v-model="potato.batata"></v-text-field>
                          </v-col>
                        </v-row>
                      </v-radio-group>
                    </v-container>
                  </v-flex>
                </v-row>
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
      teste: null,
      radios: "aaaa",
      multipleAnswer: false,
      respostas: [
        { text: "", ansId: "radio-1", value: false },
        { text: "", ansId: "radio-2", value: false },
        { text: "", ansId: "radio-3", value: false },
        { text: "", ansId: "radio-4", value: false }
      ],
      description: "",
      id: "",
      assunto: "",
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
      ]
    };
  },
  computed: {
    formIsValid() {
      console.log(this.teste);
      return (
        this.id !== "" &&
        this.description !== "" &&
        this.knowledge !== "" &&
        this.knowledgePWR !== "" &&
        this.knowledgeBWR !== "" &&
        this.assunto !== ""
      );
    }
  },
  watch: {
    multipleAnswer(val) {
      console.log("hey")
      if(!val){
        this.respostas.forEach((element) => {
          element.text = ""
        })
      }
      else{
        this.respostas.forEach((element) => {
        let aux = []
        for(var i = 0; i < 3; i++){
          aux.push({title: `${i}`, batata: ""})
        }
          element.text = aux
        })
      }
    },
    teste(val) {
      this.radios = val;
      this.respostas.forEach(element => {
        if (element.ansId === val) {
          element.value = true;
        } else {
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
        assunto: this.assunto,
        description: this.description,
        knowledge: this.knowledge,
        knowledgePWR: this.knowledgePWR,
        knowledgeBWR: this.knowledgeBWR,
        respostas: this.respostas
      };
      this.$store.dispatch("createQuestion", questionData);
      this.$router.push("/questions");
    }
  }
};
</script>