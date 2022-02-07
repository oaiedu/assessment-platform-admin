<template>
  <v-card>
    <v-toolbar class="pt-2 mb-4" dense flat>
      <v-card-title class="ma-0 pa-0 blue--text">Gerar prova</v-card-title>

      <v-spacer></v-spacer>

      <v-btn icon @click="close()">
        <v-icon>
          {{ mdiClose }}
        </v-icon>
      </v-btn>
    </v-toolbar>

    <v-container>
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
    </v-container>

    <v-card-actions class="mt-0 pb-4 pt-0">
      <v-spacer></v-spacer>

      <v-btn
        color="blue darken-1"
        :dark="
          !(
            testSubjects.length === 0 ||
            questionsNumber > 50 ||
            questionsNumber < 1 ||
            questionsNumber > checkNumber
          )
        "
        :loading="loading"
        :disabled="
          testSubjects.length === 0 ||
            questionsNumber > 50 ||
            questionsNumber < 1 ||
            questionsNumber > checkNumber
        "
        @click="selectRandom()"
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
      rule: [
        v => v <= 50 || "Máximo de 50 questões",
        v => v >= 1 || "Apenas números positivos",
        v =>
          v <= this.checkNumber ||
          "Não há questões suficientes para o número escolhido"
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
        amount += this.$store.getters.getNumberOfQuestionBySubject(sub);
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
    async selectRandom() {
      const amount = this.questionsNumber;
      const subjects = this.testSubjects;
      const selected = [];
      const allQuestions = [];

      this.selectedQuestions = [];

      this.$store.commit("setLoading", true);

      const promises = subjects.map(async subject => {
        const questions = await this.$store.dispatch(
          "getSubjectQuestions",
          subject
        );
        questions.forEach(question =>
          allQuestions.push({ name: question, subject })
        );

        return questions;
      });

      await Promise.all(promises);

      while (
        selected.length < amount &&
        selected.length < allQuestions.length
      ) {
        const index = Math.floor(Math.random() * allQuestions.length);
        if (!selected.includes(allQuestions[index].name)) {
          const question = await this.$store.dispatch(
            "getQuestionByName",
            allQuestions[index].name
          );

          selected.push(allQuestions[index].name);
          this.selectedQuestions.push(question);
        }
      }

      this.$store.commit("setLoading", false);

      this.$emit("generated", this.selectedQuestions);
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
