<template>
  <v-container>
    <link
      rel="stylesheet"
      href="https://unpkg.com/katex@0.6.0/dist/katex.min.css"
    />
    <div id="example-1">
      <Definition
        v-if="premadePapers[0].value"
        :title="testTitle"
        :creator="testCreator"
        :editedDate="testEditedData"
        :purpose="testPurpose"
      />

      <QuestionsList v-if="premadePapers[1].value" :questions="questions" />

      <div v-if="premadePapers[2].value" class="question-page">
        <statistics-questions
          :statistics="statistics"
          :numberOfQuestions="numberOfQuestions"
        />
      </div>

      <div v-for="paper in papers" :key="paper.id" class="question-page">
        <v-row justify="start">
          <vue-markdown :source="paper.description" />
        </v-row>

        <v-row justify="center">
          <img
            v-if="paper.image && paper.image.length > 0"
            :src="paper.image"
            alt="image"
            style="max-height: 800px; max-width: 350px"
          />
        </v-row>
      </div>

      <TestQuestions :questions="questions" />

      <ListOfAnswers v-if="premadePapers[3].value" :questions="questions" />
    </div>

    <v-row>
      <v-tooltip right>
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            fixed
            fab
            bottom
            left
            class="buttonIsHidden"
            @click="back()"
          >
            <v-icon>
              {{ mdiArrowLeft }}
            </v-icon>
          </v-btn>
        </template>
        <span>Voltar</span>
      </v-tooltip>
    </v-row>

    <v-row>
      <v-tooltip left>
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            class="buttonIsHidden"
            fab
            dark
            fixed
            bottom
            right
            color="blue darken-1"
            @click="toPrint()"
          >
            <v-icon>{{ mdiFileOutline }}</v-icon>
          </v-btn>
        </template>
        <span>Gerar PDF</span>
      </v-tooltip>
    </v-row>

    <v-row v-if="userClaims && !userClaims.student">
      <v-tooltip left>
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            class="buttonIsHidden"
            fab
            dark
            fixed
            bottom
            right
            style="margin-bottom: 80px;"
            color="grey darken-1"
            @click="printDialog = true"
          >
            <v-icon>{{ mdiFileDocumentEditOutline }}</v-icon>
          </v-btn>
        </template>
        <span>Editar Documentos</span>
      </v-tooltip>
    </v-row>

    <v-dialog v-model="printDialog" scrollable persistent max-width="300px">
      <v-card>
        <v-card-title>Selecione os documentos</v-card-title>

        <v-divider></v-divider>

        <v-card-text style="height: 300px">
          <div>
            <v-checkbox
              v-for="item in premadePapers"
              :key="item.id"
              class="ma-4"
              :label="item.id"
              :input-value="item.value"
              v-model="item.value"
            />
          </div>

          <div>
            <v-checkbox
              v-for="item in createdPapers"
              :key="item.data.id"
              class="ma-4"
              :label="item.id"
              :input-value="item.value"
              v-model="item.value"
            />
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions v-if="loading">
          <v-container>
            <v-row justify="center">
              <v-progress-circular color="blue darken-1" indeterminate>
              </v-progress-circular>
            </v-row>
          </v-container>
        </v-card-actions>

        <v-card-actions v-else>
          <v-spacer />
          <v-btn color="blue darken-1" text @click="saveDocs()">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import StatisticsQuestions from "@/components/Questions/StatisticsQuestions";
import VueMarkdown from "vue-markdown";
import "vue-markdown";
import {
  mdiArrowLeft,
  mdiFileOutline,
  mdiFileDocumentEditOutline
} from "@mdi/js";
import Definition from "./Definition";
import ListOfAnswers from "./ListOfAnswers";
import TestQuestions from "./TestQuestions";
import QuestionsList from "./QuestionsList";

export default {
  name: "PrintTest",
  components: {
    "vue-markdown": VueMarkdown,
    StatisticsQuestions,
    Definition,
    TestQuestions,
    QuestionsList,
    ListOfAnswers
  },
  data() {
    return {
      mdiArrowLeft,
      mdiFileOutline,
      mdiFileDocumentEditOutline,
      checkFirtPage: false,
      fab: false,
      tabs: null,
      checkSecondPage: false,
      checkThirdPage: false,
      checkFinalPage: false,
      printDialog: false,
      testPurpose: "",
      testCreator: "",
      testEditedData: "",
      testQuestions: null,
      testTitle: "",
      confirmTitle: false,
      papers: []
    };
  },
  methods: {
    cancel() {
      this.premadePapers.forEach(element => {
        element.value = false;
      });
      this.printDialog = false;
    },
    back() {
      this.$router.push("/tests");
    },
    toPrint() {
      window.print();
    },
    async saveDocs() {
      const docs = this.createdPapers;
      const toAdd = [];

      this.$store.commit("setLoading", true);

      const included = this.papers.map(p => p.id);
      const toKeep = [...this.papers];
      this.papers = [];

      docs.forEach(doc => {
        if (doc.value && !included.includes(doc.data.id)) {
          toAdd.push(doc.data.id);
        } else if (doc.value) {
          this.papers.push(toKeep.find(p => p.id === doc.data.id));
        }
      });

      const promises = toAdd.map(id => {
        return this.$store.dispatch("getPaperById", id).then(paper => {
          this.papers.push(paper);
        });
      });

      await Promise.all(promises);

      this.$store.commit("setLoading", false);
      this.printDialog = false;
    }
  },
  computed: {
    loading() {
      return this.$store.getters.loading;
    },
    userClaims() {
      return this.$store.getters.getUserClaims;
    },
    createdPapers() {
      const result = [];

      // eslint-disable-next-line vue/no-async-in-computed-properties
      this.$store.dispatch("getPaperNames").then(papers => {
        papers.forEach(p => {
          result.push({ id: p.name, value: false, data: p });
        });
      });

      return result;
    },
    premadePapers() {
      const result = [
        { id: "Introdução", value: false, data: null },
        { id: "Questões", value: false, data: null },
        { id: "Estatísticas", value: false, data: null },
        { id: "Gabarito", value: false, data: null }
      ];
      return result;
    },
    activeFab() {
      switch (this.tabs) {
        case "one":
          return { class: "purple", icon: "account_circle" };
        default:
          return {};
      }
    },
    statistics() {
      let statisticsObj = [];
      const subjects = this.$store.getters.Subject.subjects;
      subjects.forEach(element => {
        const numberOfQuestions = this.$store.getters.getNumberOfQuestionBySubjectOnTest(
          element.name,
          this.questions
        );
        statisticsObj.push({
          name: element.name,
          questions: numberOfQuestions
        });
      });
      return statisticsObj;
    },
    numberOfQuestions() {
      return this.questions.length;
    },
    questions() {
      return this.$store.getters.getTestQuestions;
    }
  },
  mounted() {
    const test = this.$store.getters.findTestById(this.$route.params.testId);

    if (!test) {
      this.$router.push("/tests");
    } else {
      this.testTitle = test.title.toUpperCase();
      this.testPurpose = test.purpose;

      if (test.editedBy) {
        const updated = test.updated;
        const updatedDate = updated.split("T")[0];
        const updatedTime = updated.split("T")[1].split(".")[0];
        const day = updatedDate.substr(8, 2);
        const month = updatedDate.substr(5, 2);
        const year = updatedDate.substr(0, 4);

        this.$store
          .dispatch("getUserById", { id: test.editedBy })
          .then(data => {
            this.testEditedData = `${data.name} - ${day}/${month}/${year} ${updatedTime}`;
          });
      }

      this.testCreator = test.user.name;

      this.$store.dispatch("loadTestQuestions", test);
    }
  }
};
</script>

<style>
.answer-block {
  margin: 0 !important;
}

.answer-block .col {
  padding: 0 10px 0 10px !important;
}

.centered-text {
  text-align: center;
}

@media print {
  header {
    display: none !important;
  }

  footer {
    display: none !important;
  }

  @page {
    margin-top: 1cm;
    margin-bottom: 1cm;
    margin-left: 1cm;
    margin-right: 1cm;
  }

  .question-page {
    font-size: 13px;
    page-break-after: always !important;
  }

  .buttonIsHidden {
    visibility: hidden;
  }

  .img-container {
    text-align: center !important;
  }

  p {
    font-size: 13px;
    page-break-inside: avoid;
  }
}
</style>
