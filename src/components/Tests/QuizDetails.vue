<template>
  <v-container
    class="pa-0 px-4 ma-0"
    style="max-width: unset; min-height: 100%; background: #efefef"
  >
    <v-row class="pa-4 ma-0">
      <a @click="$router.push('/')">Início</a>

      <span class="mx-3 slash">/</span>

      <a @click="$router.push('/quizzes')">Questionários</a>

      <span class="mx-3 slash">/</span>

      <a>Detalhes do questionário</a>
    </v-row>

    <v-card flat width="100%">
      <v-card-title class="ma-0 pa-2 py-4">
        <v-icon x-large color="blue">{{ mdiFileDocumentOutline }}</v-icon>

        <span class="ml-3">
          <div class="quiz-detail__level">
            Nível: {{ test ? getLevel(test).label : "indisponível" }}
          </div>

          <div class="quiz-detail__title ma-0 mt-2 pa-0">
            {{ test ? test.title : "Questionário" }}
          </div>
        </span>
      </v-card-title>
    </v-card>

    <v-card flat class="mt-4" width="100%">
      <v-row class="pa-0 ma-0" style="flex-wrap: nowrap; position: relative">
        <div class="quiz-detail__detail-column info-column">
          <span class="quiz-detail__info-title">Detalhes</span>

          <div class="quiz-detail__info-container">
            <div class="quiz-detail__info-column">
              <div class="quiz-detail__info">
                <div
                  class="quiz-detail__info-icon"
                  style="background: #9455FA33"
                >
                  <v-icon size="26" color="#9455FA">{{ mdiHelp }}</v-icon>
                </div>

                <div class="quiz-detail__info-stats">
                  <span class="quiz-detail__amount">{{
                    test ? test.questionsAmount : 0
                  }}</span>
                  <span class="quiz-detail__label">questões</span>
                </div>
              </div>

              <div class="quiz-detail__info">
                <div
                  class="quiz-detail__info-icon"
                  style="background: #FF559933"
                >
                  <v-icon size="26" color="#FF5599">{{ mdiBallot }}</v-icon>
                </div>

                <div class="quiz-detail__info-stats">
                  <span class="quiz-detail__amount">{{
                    test ? getSubjectsAmount(test) : 0
                  }}</span>
                  <span class="quiz-detail__label">disciplinas</span>
                </div>
              </div>
            </div>

            <div class="quiz-detail__info-column">
              <div class="quiz-detail__info">
                <div
                  class="quiz-detail__info-icon"
                  style="background: #FFAD3333"
                >
                  <v-icon size="26" color="#FFAD33">{{
                    mdiClockOutline
                  }}</v-icon>
                </div>

                <div class="quiz-detail__info-stats">
                  <span class="quiz-detail__amount">{{
                    test ? getTime(test) : 0
                  }}</span>
                  <span class="quiz-detail__label">tempo</span>
                </div>
              </div>

              <div class="quiz-detail__info">
                <div
                  class="quiz-detail__info-icon"
                  style="background: #81C49333"
                >
                  <v-icon size="26" color="#81C493">{{
                    mdiThumbUpOutline
                  }}</v-icon>
                </div>

                <div class="quiz-detail__info-stats">
                  <span class="quiz-detail__amount"
                    >{{ test ? test.approvalPercentage : 0 }}%</span
                  >
                  <span class="quiz-detail__label">para aprovação</span>
                </div>
              </div>
            </div>
          </div>

          <v-btn
            dark
            rounded
            height="40px"
            class="mt-3"
            color="blue"
            elevation="0"
            @click="startDialog = true"
          >
            Começar questionário
          </v-btn>
        </div>

        <v-divider vertical class="mx-0"></v-divider>

        <div class="quiz-detail__detail-column instructions-column">
          <span class="quiz-detail__info-title">Instruções</span>

          <div
            v-if="test"
            v-html="test.instructions"
            class="quiz-detail__instructions"
          ></div>

          <span
            v-else-if="!!test && !test.instructions"
            class="quiz-detail__instructions"
          >
            Este teste não possui instruções.
          </span>
        </div>
      </v-row>
    </v-card>

    <v-card flat class="my-4" width="100%">
      <v-card-title>
        <h3 class="quiz-detail__attempts-title">Tentativas anteriores</h3>
      </v-card-title>

      <v-data-table
        v-if="test && attempts"
        hide-default-footer
        class="quiz__attempts-table"
        no-data-text="Não há tentativas no momento"
        :headers="headersAttempts"
        :items="attempts"
      >
        <template v-slot:[`item.index`]="{ item }">
          {{ item.index + 1 }}
        </template>

        <template v-slot:[`item.date`]="{ item }">
          {{ getDateSentence(item.date) }}
        </template>

        <template v-slot:[`item.answers`]="{ item }">
          {{ item.answers.length }}/{{ item.questions.length }}
        </template>

        <template v-slot:[`item.score`]="{ item }">
          <span
            :class="{
              'font-weight-medium': !item.score || item.score === 100,
              'green--text': item.score === 100,
              'red--text': !item.score
            }"
          >
            {{ item.score.toFixed(2) }}%
          </span>
        </template>

        <template v-slot:[`item.timeTaken`]="{ item }">
          {{ getTimeFormatted(item.timeTaken) }}
        </template>

        <template v-slot:[`item.mode`]="{ item }">
          {{ getModeSentence(item.mode) }}
        </template>

        <template v-slot:[`item.result`]="{ item }">
          <span
            class="font-weight-medium"
            :class="{
              'green--text': item.approved,
              'red--text': !item.approved
            }"
          >
            {{ item.approved ? "Passou" : "Falhou" }}
          </span>
        </template>

        <template v-slot:[`item.review`]="{ item }">
          <v-btn text small color="blue" @click="reviewAttempt(item)"
            >Revisar</v-btn
          >
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="startDialog" width="500px">
      <v-card>
        <v-card-title class="pa-4 ma-0">
          <v-row class="pa-0 ma-0" justify="center" style="position: relative">
            <h2 class="quiz-detail__start-title">
              Antes de começar
            </h2>

            <v-btn
              icon
              class="quiz-detail__start-close"
              @click="startDialog = false"
            >
              <v-icon>{{ mdiClose }}</v-icon>
            </v-btn>
          </v-row>
        </v-card-title>

        <v-card-text v-if="test">
          <v-row class="pa-0 ma-0" justify="center">
            <p
              v-if="test.unlimitedTime"
              class="text-center quiz-detail__start-info"
            >
              O questionário não possui limite de tempo. O tempo será contado de
              forma crescente a partir do momento de início.
            </p>

            <p v-else class="text-center quiz-detail__start-info">
              O questionário possui um limite de tempo de
              <strong style="display: inline-flex">
                {{ test.time.hours }}h {{ test.time.minutes }}m
                {{ test.time.seconds }}s</strong
              >. O tempo será contado de forma decrescente a partir do momento
              de início e o teste deverá ser concluído antes de expirar.
            </p>
          </v-row>
        </v-card-text>

        <v-row class="pa-0 ma-0" justify="center">
          <div
            class="quiz-detail__start-practice"
            @click="practice = !practice"
          >
            <v-checkbox v-model="practice" @click.stop></v-checkbox>

            <span>Começar como treino</span>
          </div>
        </v-row>

        <v-card-actions>
          <v-row class="pa-0 ma-0" justify="center">
            <v-btn
              dark
              rounded
              class="mt-6 mb-2"
              color="blue"
              @click="startQuiz()"
            >
              Começar
            </v-btn>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import {
  mdiBallot,
  mdiClockOutline,
  mdiClose,
  mdiFileDocumentOutline,
  mdiHelp,
  mdiThumbUpOutline
} from "@mdi/js";

import { weekDays, months } from "../../utils/date";

export default {
  name: "QuizDetails",
  data() {
    return {
      mdiBallot,
      mdiClockOutline,
      mdiClose,
      mdiFileDocumentOutline,
      mdiHelp,
      mdiThumbUpOutline,
      test: null,
      startDialog: false,
      practice: false,
      headersAttempts: [
        { text: "#", value: "index", sortable: false, align: "center" },
        { text: "Data", value: "date", sortable: false, align: "center" },
        {
          text: "Respostas",
          value: "answers",
          sortable: false,
          align: "center"
        },
        {
          text: "Pontuação",
          value: "score",
          sortable: false,
          align: "center"
        },
        {
          text: "Tempo Gasto",
          value: "timeTaken",
          sortable: false,
          align: "center"
        },
        { text: "Modo", value: "mode", sortable: false, align: "center" },
        {
          text: "Resultado",
          value: "result",
          sortable: false,
          align: "center"
        },
        { text: "Revisar", value: "review", sortable: false, align: "center" }
      ],
      attempts: []
    };
  },
  computed: {
    userInfo() {
      return this.$store.getters.userInfo;
    }
  },
  methods: {
    getDateSentence(iso) {
      const date = new Date(iso);

      return `${weekDays[date.getDay()].substring(
        0,
        3
      )}, ${date.getDate()} ${months[date.getMonth()].substring(
        0,
        3
      )} ${date.getFullYear()}`;
    },
    getModeSentence(mode) {
      switch (mode) {
        case "practice":
          return "Treino";
        case "exam":
          return "Exame";
        default:
          return "Indefinido";
      }
    },
    getTime(item) {
      return item.unlimitedTime
        ? "Ilimitado"
        : this.getTimeFormatted(item.time);
    },
    getTimeFormatted(time) {
      return `${time.hours}h ${time.minutes}m ${time.seconds}s`;
    },
    getLevel(item) {
      const level = item.level.index;

      switch (level) {
        case 0:
          return {
            label: "Iniciante",
            color: "green"
          };
        case 1:
          return {
            label: "Intermediário",
            color: "blue"
          };
        case 2:
          return {
            label: "Avançado",
            color: "orange"
          };
        case 3:
          return {
            label: "Experiente",
            color: "red"
          };
      }
    },
    getSubjectsAmount(item) {
      const subjects = [];

      item.questions.forEach(q => {
        if (!subjects.includes(q.subject)) {
          subjects.push(q.subject);
        }
      });

      return subjects.length || item.subjects.length;
    },
    startQuiz() {
      const id = this.$route.params.id;

      if (id === "generated") {
        this.$router.push({
          name: "quiz.exam",
          params: {
            id: "generated",
            test: this.test,
            mode: this.practice ? "practice" : "exam"
          }
        });
      } else {
        this.$router.push({
          name: "quiz.exam",
          params: { id, mode: this.practice ? "practice" : "exam" }
        });
      }
    },
    reviewAttempt(item) {
      const id = this.$route.params.id;

      this.$router.push({
        name: "quiz.exam",
        params: { id, mode: "practice", attempt: item, review: true }
      });
    }
  },
  async mounted() {
    const id = this.$route.params.id;

    if (id === "generated") {
      this.test = this.$route.params.test;
    } else {
      this.test = await this.$store.dispatch("getTestById", id);
    }

    if (this.userInfo && this.userInfo.attempts) {
      this.attempts = this.userInfo.attempts
        .filter(a => a.quizId === id)
        .map((a, i) => ({ index: i, ...a }));
    }
  }
};
</script>

<style scoped>
.quiz-detail__level {
  color: #afafaf;
  font-size: 0.8rem;
  line-height: 0.8rem;
}

.quiz-detail__title {
  color: #4d4d4d;
  font-size: 1.2rem;
  line-height: 1.2rem;
}

.quiz-detail__detail-column {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;

  height: 260px;

  padding: 1rem 1.5rem;
}

.quiz-detail__detail-column.info-column {
  position: sticky;
  top: 0;
}

.quiz-detail__detail-column.instructions-column {
  width: 100%;
  height: auto;
}

.quiz-detail__info-title {
  color: #5d5d5d;
  font-size: 0.95rem;
  font-weight: 500;
}

.quiz-detail__info-container {
  display: flex;
  justify-content: space-between;
  gap: 1rem;

  width: 300px;
  height: 100%;
}

.quiz-detail__info-column {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.6rem;
}

.quiz-detail__info {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.75rem;

  padding: 0.7rem 0;
}

.quiz-detail__info .quiz-detail__info-icon {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 40px;
  height: 40px;

  border-radius: 50%;
}

.quiz-detail__info .quiz-detail__info-stats {
  display: flex;
  flex-direction: column;
  justify-items: center;
  align-items: flex-start;
  gap: 0;
}

.quiz-detail__info .quiz-detail__amount {
  color: #4d4d4d;
  font-size: 1.2rem;
  line-height: 1.2rem;
  font-weight: 500;
}

.quiz-detail__info .quiz-detail__label {
  color: #afafaf;
  font-size: 0.8rem;
}

.quiz-detail__instructions {
  width: 100%;
  height: 100%;
}

.quiz-detail__attempts-title,
.quiz-detail__start-title {
  color: #3d3d3d;
  font-size: 1.2rem;
  font-weight: 500;
}

.quiz-detail__start-close {
  position: absolute;
  right: 0;
}

.quiz-detail__start-info {
  width: 320px;
}

.quiz-detail__start-practice {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.3rem;

  width: 280px;
  height: 60px;

  border: 1px solid #cfcfcf;
  border-radius: 0.6rem;

  cursor: pointer;
}

.quiz__attempts-table /deep/ tbody tr {
  transition: background-color 0.1s ease;
}

.quiz__attempts-table /deep/ tbody tr:hover {
  background-color: #f7f7f7 !important;
}

a,
.slash {
  color: #9a9a9a !important;
  font-size: 0.9rem;
  text-decoration: none;
}

a:hover {
  color: #888 !important;
  text-decoration-line: underline;
}
</style>
