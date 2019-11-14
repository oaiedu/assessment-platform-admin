<template>
    <form @submit.prevent="onCreateQuestion">
        <v-stepper v-model="e1">
            
            <v-stepper-header>
                <v-stepper-step editable :complete="e1 > 1" step="1"></v-stepper-step>

                <v-divider></v-divider>

                <v-stepper-step editable :complete="e1 > 2" step="2"></v-stepper-step>

                <v-divider></v-divider>

                <v-stepper-step editable step="3"></v-stepper-step>
            </v-stepper-header>

            <v-stepper-items>
                <v-stepper-content step="1">
                    <v-container>
                        <v-row>
                            <v-text-field 
                                name="id" 
                                label="ID" 
                                id="id" 
                                v-model="id" 
                                required
                            ></v-text-field>
                        </v-row>

                        <v-row>
                            <v-text-field
                                name="knowledge"
                                label="Conhecimento"
                                id="knowledge"
                                v-model="knowledge"
                                required
                            ></v-text-field>
                        </v-row>

                        <v-row>
                            <v-text-field
                                name="knowledgePWR"
                                label="Conhecimento PWR"
                                id="knowledgePWR"
                                v-model="knowledgePWR"
                                required
                            ></v-text-field>
                        </v-row>

                        <v-row>
                            <v-text-field
                                name="knowledgeBWR"
                                label="Conhecimento BWR"
                                id="knowledgeBWR"
                                v-model="knowledgeBWR"
                                required
                            ></v-text-field>
                        </v-row>

                        <v-row>
                            <v-select
                                :items="subjectItems"
                                name="subject"
                                id="subject"
                                v-model="subject"
                                label="Disciplina"
                                solo
                            ></v-select>
                        </v-row>
                        
                        <v-btn
                            color="primary"
                            @click="e1 = 2"
                        >Continue</v-btn>
                    </v-container>
                </v-stepper-content>

                <v-stepper-content step="2">
                    <v-container>
                        <Combined @inputData="updateData"></Combined>
                        
                        <v-btn
                            color="primary"
                            @click="e1 = 3"
                        >Continue</v-btn>
                    </v-container>
                </v-stepper-content>

                <v-stepper-content step="3">
                    <v-container>
                        <h3>Respostas</h3>

                        <v-row>
                            <v-col>
                                <v-switch 
                                    v-model="multipleAnswer" 
                                    label="Multiple"
                                ></v-switch>
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

                        <v-content v-if="!multipleAnswer"> 
                            <v-row v-for="item in answers" :key="item.ansId">
                                <v-radio-group  v-model="test">
                                    <v-radio :value="item.ansId"></v-radio>
                                </v-radio-group>
                                
                                <v-text-field name="text field" id="text field" v-model="item.text" required></v-text-field>
                            </v-row>
                        </v-content>

                        <v-radio-group v-else v-model="test">
                            <v-row>
                                <v-col v-for="i in columns" :key="i">
                                    <v-text-field v-model="auxTitle[i-1]"></v-text-field>
                                </v-col>
                            </v-row>

                            <v-row v-for="item in answers" :key="item.ansId">
                                <v-col>    
                                    <v-radio :value="item.ansId"></v-radio>
                                </v-col>
                                <v-col 
                                    v-for="answerItem in item.text" 
                                    :key="answerItem.ansId"
                                >
                                <v-text-field v-model="answerItem.answerDescription"></v-text-field>
                                </v-col>
                            </v-row>
                        </v-radio-group>

                        <v-btn 
                            class="primary" 
                            :disabled="!formIsValid" 
                            type="submit"
                        >Create Question</v-btn>
                    </v-container>
                </v-stepper-content>
            </v-stepper-items>
        </v-stepper>
    </form>
</template>

<script>
export default {
  data() {
    return {
      questionDescription: "",
      e1: 0,
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
      id: "",
      subject: "",
      knowledge: "",
      knowledgePWR: "",
      knowledgeBWR: "",
      subjectItems: [
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
      columnItems: [2, 3, 4, 5],
      batatinha: "aaaaaa"
    };
  },
  computed: {
    formIsValid() {
      return (
        this.id !== "" &&
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
    updateData (variable) {
      console.log("!!!",variable)
      this.questionDescription = variable
    },
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