<template>
  <v-container>
    <link
      rel="stylesheet"
      href="https://unpkg.com/katex@0.6.0/dist/katex.min.css"
    />
    <div id="example-1">
      <TestQuestions :questions="questions" />
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
  </v-container>
</template>

<script>
import "vue-markdown";
import { mdiArrowLeft, mdiFileOutline } from "@mdi/js";
import TestQuestions from "./TestQuestions";

export default {
  name: "PrintTest",
  components: {
    TestQuestions
  },
  data() {
    return {
      mdiArrowLeft,
      mdiFileOutline,
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
      confirmTitle: false
    };
  },
  methods: {
    cancel() {
      this.printDialog = false;
    },
    back() {
      this.$router.push("/tests");
    },
    toPrint() {
      window.print();
    }
  },
  computed: {
    loading() {
      return this.$store.getters.loading;
    },
    userClaims() {
      return this.$store.getters.getUserClaims;
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
