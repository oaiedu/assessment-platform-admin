<template>
  <v-container
    class="pa-0 px-4 ma-0"
    style="max-width: unset; min-height: 100%; background: #efefef"
  >
    <v-row class="pa-4 ma-0">
      <a @click="$router.push('/')">Início</a>

      <span class="mx-3 slash">/</span>

      <a @click="$router.push('/quizes')">Questionários</a>

      <span class="mx-3 slash">/</span>

      <a>Detalhes do questionário</a>
    </v-row>

    <v-card flat width="100%">
      <v-card-title class="ma-0 pa-2 py-4">
        <v-icon x-large color="blue">{{ mdiFileDocumentOutline }}</v-icon>

        <span class="ml-3">
          <div class="exam__level">
            Nível: {{ test ? getLevel(test).label : "indisponível" }}
          </div>

          <div class="exam__title ma-0 mt-2 pa-0">
            {{ test ? test.title : "Questionário" }}
          </div>
        </span>
      </v-card-title>
    </v-card>

    <v-card flat class="mt-4" width="100%">
      <v-row class="pa-0 ma-0">
        <div class="exam__detail-column">
          <span class="exam__info-title">Detalhes</span>

          <div class="exam__info-container">
            <div class="exam__info-column">
              <div class="exam__info">
                <div class="exam__info-icon" style="background: #9455FA33">
                  <v-icon size="26" color="#9455FA">{{ mdiHelp }}</v-icon>
                </div>

                <div class="exam__info-stats">
                  <span class="exam__amount">{{
                    test ? test.questionsAmount : 0
                  }}</span>
                  <span class="exam__label">questões</span>
                </div>
              </div>

              <div class="exam__info">
                <div class="exam__info-icon" style="background: #FF559933">
                  <v-icon size="26" color="#FF5599">{{ mdiBallot }}</v-icon>
                </div>

                <div class="exam__info-stats">
                  <span class="exam__amount">{{
                    test ? getSubjectsAmount(test) : 0
                  }}</span>
                  <span class="exam__label">disciplinas</span>
                </div>
              </div>
            </div>

            <div class="exam__info-column">
              <div class="exam__info">
                <div class="exam__info-icon" style="background: #FFAD3333">
                  <v-icon size="26" color="#FFAD33">{{
                    mdiClockOutline
                  }}</v-icon>
                </div>

                <div class="exam__info-stats">
                  <span class="exam__amount">{{
                    test ? getTime(test) : 0
                  }}</span>
                  <span class="exam__label">tempo</span>
                </div>
              </div>

              <div class="exam__info">
                <div class="exam__info-icon" style="background: #81C49333">
                  <v-icon size="26" color="#81C493">{{
                    mdiThumbUpOutline
                  }}</v-icon>
                </div>

                <div class="exam__info-stats">
                  <span class="exam__amount"
                    >{{ test ? test.approvalPercentage : 0 }}%</span
                  >
                  <span class="exam__label">para aprovação</span>
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
            @click="startQuiz()"
          >
            Começar questionário
          </v-btn>
        </div>

        <v-divider vertical class="mx-0"></v-divider>

        <div class="exam__detail-column instructions-column">
          <span class="exam__info-title">Instruções</span>

          <VueMarkdown
            v-if="test"
            class="exam__instructions"
            :source="test.instructions"
          ></VueMarkdown>

          <span
            v-else-if="!!test && !test.instructions"
            class="exam__instructions"
          >
            Este teste não possui instruções.
          </span>
        </div>
      </v-row>
    </v-card>

    <v-card flat class="mt-4" width="100%">
      <v-card-title>
        <h3 class="exam__attempts">Tentativas anteriores</h3>
      </v-card-title>
    </v-card>
  </v-container>
</template>

<script>
import {
  mdiBallot,
  mdiClockOutline,
  mdiFileDocumentOutline,
  mdiHelp,
  mdiThumbUpOutline
} from "@mdi/js";

import VueMarkdown from "vue-markdown";
import "vue-markdown";

export default {
  name: "ExamDetails",
  components: {
    VueMarkdown
  },
  data() {
    return {
      mdiBallot,
      mdiClockOutline,
      mdiFileDocumentOutline,
      mdiHelp,
      mdiThumbUpOutline,
      test: null,
      dialogExam: false,
      attempts: [
        {
          score: 70,
          approved: false,
          date: new Date()
        }
      ]
    };
  },
  methods: {
    getTime(item) {
      return item.unlimitedTime
        ? "Ilimitado"
        : `${item.time.hours}h ${item.time.minutes}m ${item.time.seconds}s`;
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

      return subjects.length;
    },
    startQuiz() {
      const id = this.$route.params.id;

      if (id === "generated") {
        this.$router.push({
          name: "quiz.exam",
          params: { id: "generated", test: this.test }
        });
      } else {
        this.$router.push("/quiz/" + id);
      }
    }
  },
  async mounted() {
    const id = this.$route.params.id;

    if (id === "generated") {
      this.test = this.$route.params.test;
    } else {
      this.test = await this.$store.dispatch("getTestById", id);
    }
    console.log(this.test);
  }
};
</script>

<style scoped>
.exam__level {
  color: #afafaf;
  font-size: 0.8rem;
  line-height: 0.8rem;
}

.exam__title {
  color: #4d4d4d;
  font-size: 1.2rem;
  line-height: 1.2rem;
}

.exam__detail-column {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;

  padding: 1rem 1.5rem;
}

.exam__detail-column .instructions-column {
  width: calc(100% - 349px);
}

.exam__info-title {
  color: #5d5d5d;
  font-size: 0.95rem;
  font-weight: 500;
}

.exam__info-container {
  display: flex;
  justify-content: space-between;
  gap: 1rem;

  width: 300px;
  height: 100%;
}

.exam__info-column {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.6rem;
}

.exam__info {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.75rem;

  padding: 0.7rem 0;
}

.exam__info .exam__info-icon {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 40px;
  height: 40px;

  border-radius: 50%;
}

.exam__info .exam__info-stats {
  display: flex;
  flex-direction: column;
  justify-items: center;
  align-items: flex-start;
  gap: 0;
}

.exam__info .exam__amount {
  color: #4d4d4d;
  font-size: 1.2rem;
  line-height: 1.2rem;
  font-weight: 500;
}

.exam__info .exam__label {
  color: #afafaf;
  font-size: 0.8rem;
}

.exam__instructions {
  width: 100%;
  height: 100%;
}

.exam__attempts {
  color: #3d3d3d;
  font-size: 1.2rem;
  font-weight: 500;
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
