<template>
  <v-card>
    <v-container>
      <v-row class="pt-10">
        <div class="print">
          <link
            rel="stylesheet"
            href="https://unpkg.com/katex@0.6.0/dist/katex.min.css"
          />
          <div class="question-page">
            <Definition :question="question" />

            <QuestionImage
              v-if="question.image"
              :image="question.image"
              :imageSize="question.imageSize"
            />

            <br />

            <Answers
              :answers="question.answers"
              :answerJustification="question.answerJustification"
              :answerJustificationSource="question.answerJustificationSource"
              :justifications="showJustifications"
            />

            <v-tooltip left>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  class="buttonIsHidden"
                  v-on="on"
                  v-bind="attrs"
                  fixed
                  dark
                  fab
                  bottom
                  right
                  color="blue"
                  @click="toPrint()"
                >
                  <v-icon>{{ mdiFileOutline }}</v-icon>
                </v-btn>
              </template>
              <span>{{ $t('QUESTIONS.PRINT.create_pdf') }}</span>
            </v-tooltip>

            <v-tooltip right>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-on="on"
                  v-bind="attrs"
                  fixed
                  fab
                  bottom
                  left
                  class="buttonIsHidden"
                  @click="close()"
                >
                  <v-icon>{{ mdiArrowLeft }}</v-icon>
                </v-btn>
              </template>
              <span>{{ $t('QUESTIONS.EDIT.back') }}</span>
            </v-tooltip>
          </div>
        </div>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import { mdiArrowLeft, mdiFileOutline } from "@mdi/js";
import Answers from "./Answers";
import Definition from "./Definition";
import QuestionImage from "./QuestionImage";

export default {
  props: {
    question: Object,
    showJustifications: Boolean
  },
  components: {
    Answers,
    Definition,
    QuestionImage
  },
  data() {
    return {
      mdiArrowLeft,
      mdiFileOutline
    };
  },
  methods: {
    toPrint() {
      window.print();
    },
    close() {
      this.$emit("closeDialogPrint");
    }
  }
};
</script>

<style>
.img-container {
  text-align: center;
}

.question-page,
.print {
  width: 100%;
}

.print {
  padding-bottom: 3.5rem;
}

@media print {
  header {
    display: none !important;
  }
  .print {
    background-color: white;
    height: 100%;
    width: 100%;
    position: fixed;
    display: block;
    top: 0;
    left: 0;
    margin: 0;
    padding: 15px;
    font-size: 14px;
    line-height: 18px;
  }
  @page {
    margin-top: 2cm;
    margin-bottom: 2cm;
    margin-left: 2cm;
    margin-right: 2cm;
  }
  .question-page {
    page-break-after: always;
  }

  .buttonIsHidden {
    visibility: hidden;
  }

  .img-container {
    text-align: center !important;
  }

  p {
    page-break-inside: avoid;
  }
}
</style>
