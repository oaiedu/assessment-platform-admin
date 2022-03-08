<template>
  <v-card>
    <v-toolbar class="pt-2 mb-4" dense flat>
      <v-card-title class="ma-0 pa-0 blue--text"
        >Gerar questionário</v-card-title
      >

      <v-spacer></v-spacer>

      <v-btn icon @click="close()">
        <v-icon>
          {{ mdiClose }}
        </v-icon>
      </v-btn>
    </v-toolbar>

    <v-container class="px-4">
      <v-row class="ma-0 pa-0">
        <v-col class="ma-0 pa-0">
          <v-text-field
            dense
            outlined
            rounded
            name="questionsNumber"
            label="Número de Questões"
            id="questionsNumber"
            v-model="questionsNumber"
            type="number"
            :rules="rule"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row class="ma-0 pa-0">
        <v-col class="ma-0 pa-0">
          <v-select
            rounded
            flat
            outlined
            dense
            multiple
            label="Disciplina"
            v-model="testSubjects"
            :items="subjects.map(s => s.name)"
          >
            <template v-slot:selection="{ item, index }">
              <span v-if="index === 0" style="margin-right: 5px;">
                {{ item }}
              </span>

              <span v-if="index === 1" class="grey--text caption">
                (+{{ testSubjects.length - 1 }} others)
              </span>
            </template>

            <template v-slot:prepend-item>
              <v-list-item ripple @click="toggle">
                <v-list-item-action>
                  <v-icon
                    :color="testSubjects.length > 0 ? 'blue darken-1' : ''"
                  >
                    {{ selectIcon }}
                  </v-icon>
                </v-list-item-action>

                <v-list-item-content>
                  <v-list-item-title>
                    Selecionar todos
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-divider class="mt-2"></v-divider>
            </template>
          </v-select>
        </v-col>
      </v-row>

      <v-row class="ma-0 pa-0">
        <v-select
          v-model="level"
          rounded
          flat
          outlined
          dense
          label="Nível"
          item-value="value"
          item-text="label"
          :items="levels"
        ></v-select>
      </v-row>

      <v-row class="ma-0 pa-0">
        <v-checkbox
          v-model="unlimitedTime"
          label="Tempo de questionário ilimitado"
        ></v-checkbox>
      </v-row>

      <v-row class="ma-0 pa-0">
        <v-text-field
          v-model="time.hours"
          class="mr-3"
          label="Horas"
          type="number"
          style="width: 100px; flex: none"
          :rules="[v => v >= 0 || 'Valor inválido']"
          :disabled="unlimitedTime"
        ></v-text-field>

        <v-text-field
          v-model="time.minutes"
          label="Minutos"
          type="number"
          style="width: 100px; flex: none"
          :rules="[v => (v >= 0 && v < 60) || 'Valor inválido']"
          :disabled="unlimitedTime"
        ></v-text-field>
      </v-row>
    </v-container>

    <v-card-actions class="mt-0 pb-4 pt-0">
      <v-spacer></v-spacer>

      <v-btn
        color="blue darken-1"
        :dark="
          !(
            testSubjects.length === 0 ||
            questionsNumber < 1 ||
            questionsNumber > checkNumber
          )
        "
        :loading="loading"
        :disabled="
          questionsNumber < 1 ||
            questionsNumber > checkNumber ||
            testSubjects.length === 0
        "
        @click="selectQuestions()"
      >
        Começar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mdiClose, mdiCloseBox, mdiCheckboxBlankOutline } from "@mdi/js";
import Ripple from "vuetify/lib/directives/ripple";

export default {
  name: "GenerateCard",
  directives: { Ripple },
  data() {
    return {
      mdiClose,
      mdiCloseBox,
      mdiCheckboxBlankOutline,
      questionsNumber: 1,
      selectedSubjects: [],
      selectedQuestions: [],
      testSubjects: [],
      unlimitedTime: true,
      time: {
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      level: {
        index: 0,
        name: "beginner"
      },
      levels: [
        {
          value: {
            index: 0,
            name: "beginner"
          },
          label: "Iniciante"
        },
        {
          value: {
            index: 1,
            name: "intermediary"
          },
          label: "Intermediário"
        },
        {
          value: {
            index: 2,
            name: "advanced"
          },
          label: "Avançado"
        },
        {
          value: {
            index: 3,
            name: "expert"
          },
          label: "Experiente"
        }
      ],
      rule: [
        v => v >= 1 || "Apenas números positivos",
        v =>
          v <= this.checkNumber ||
          "Não há questões suficientes para a disciplina e nível escolhidos"
      ]
    };
  },
  computed: {
    loading() {
      return this.$store.getters.loading;
    },
    subjects() {
      return this.$store.state.Subject.subjects;
    },
    checkNumber() {
      const subjects = this.testSubjects;
      let amount = 0;

      subjects.forEach(sub => {
        amount += this.$store.getters.getNumberOfQuestionBySubjectAndLevel(
          sub,
          this.level.index
        );
      });

      return amount;
    },
    selectedAllSubjects() {
      return this.testSubjects.length === this.subjects.length;
    },
    selectedSomeSubject() {
      return this.testSubjects.length > 0 && !this.selectedAllSubjects;
    },
    selectIcon() {
      if (this.selectedAllSubjects) return this.mdiCloseBox;
      if (this.selectedSomeSubject) return this.mdiMinusBox;
      return this.mdiCheckboxBlankOutline;
    }
  },
  methods: {
    async selectQuestions() {
      this.$store.commit("setLoading", true);

      const questions = [];
      const temp = [];

      const selectedData = [];

      for (const subject of this.testSubjects) {
        const subQuestions = await this.$store.dispatch(
          "getSubjectQuestions",
          subject
        );

        subQuestions.forEach(q => {
          questions.push({
            name: q.name,
            level: q.level,
            subject
          });
        });
      }

      while (temp.length < questions.length) {
        const index = Math.floor(Math.random() * questions.length);

        if (!temp.includes(questions[index].name)) {
          temp.push(questions[index].name);
        }
      }

      const randomQuestions = temp.map(questionName =>
        questions.find(q => q.name === questionName)
      );

      let loop = 0;

      while (
        selectedData.length < this.questionsNumber &&
        selectedData.length < randomQuestions.length &&
        loop < randomQuestions.length
      ) {
        const question = randomQuestions[loop];

        const questionData = await this.$store.dispatch(
          "getQuestionByName",
          question.name
        );

        if (randomQuestions[loop].level <= questionData.level.index) {
          selectedData.push(questionData);
        }

        loop++;
      }

      this.selectedQuestions = selectedData;

      this.$store.commit("setLoading", false);

      this.$emit("generated", {
        questions: this.selectedQuestions,
        level: this.level,
        unlimitedTime:
          this.unlimitedTime ||
          (+this.time.hours === 0 && +this.time.minutes === 0),
        time: {
          hours: +this.time.hours,
          minutes: +this.time.minutes,
          seconds: 0
        }
      });
      this.close();
    },
    toggle() {
      this.$nextTick(() => {
        if (this.selectedAllSubjects) {
          this.testSubjects = [];
        } else {
          this.testSubjects = [...this.subjects];
        }
      });
    },
    close() {
      this.selectedQuestions = [];
      this.selectedSubjects = [];
      this.testSubjects = [];
      (this.level = {
        index: 0,
        name: "beginner"
      }),
        (this.time = {
          hours: 0,
          minutes: 0,
          seconds: 0
        });
      this.unlimitedTime = true;
      this.questionsNumber = 1;

      this.$emit("closeDialog");
    }
  },
  mounted() {
    this.testSubjects = this.subjects.length > 0 ? [this.subjects[0].name] : [];
  }
};
</script>

<style scoped></style>
