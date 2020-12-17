<template>
  <v-card>
    <v-container>
      <v-row justify="center">
        <div class="print">
          <link rel="stylesheet" href="https://unpkg.com/katex@0.6.0/dist/katex.min.css" />
          <div class="question-page">
            DISCIPLINA: {{ question.subject }}
            <br />
            CONHECIMENTO: {{ question.knowledge }} [ {{ question.knowledgePWR }} / {{ question.knowledgeBWR }} ]
            <br />
            IQ: {{ question.iq }}
            <br />

            <br />
            <vue-markdown :source="question.question" />
            <br />

            <br />

            <div class="img-container" v-if="confirmImage(question.image)">
              <v-main v-if="question.imageSize === '1x'">
                <img :src="question.image" style="max-height: 40vh; max-width: 40vw" />
              </v-main>

              <v-main v-if="question.imageSize === '2x'">
                <img :src="question.image" style="max-height: 50vh; max-width: 50vw" />
              </v-main>

              <v-main v-if="question.imageSize === '3x'">
                <img :src="question.image" style="max-height: 60vh; max-width: 60vw" />
              </v-main>

              <v-main v-if="question.imageSize === undefined">
                <img :src="question.image" style="max-height: 50vh; max-width: 50vw" />
              </v-main>
            </div>

            <v-main v-if="typeof question.answers[0].text !== 'string'">
              <v-row>
                <v-col cols="2"></v-col>
                <v-col
                  v-for="(item, index) in question.answers[0].text"
                  :key="index"
                  cols="2"
                >
                  <vue-markdown :source="item.title" />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="2">A -</v-col>
                <v-col
                  v-for="(item, index) in question.answers[0].text"
                  :key="index"
                  cols="2"
                >
                  <vue-markdown :source="item.answerDescription" />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="2">B -</v-col>
                <v-col
                  v-for="(item, index) in question.answers[1].text"
                  :key="index"
                  cols="2"
                >
                  <vue-markdown :source="item.answerDescription" />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="2">C -</v-col>
                <v-col
                  v-for="(item, index) in question.answers[2].text"
                  :key="index"
                  cols="2"
                >
                  <vue-markdown :source="item.answerDescription" />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="2">D -</v-col>
                <v-col
                  v-for="(item, index) in question.answers[3].text"
                  :key="index"
                  cols="2"
                >
                  <vue-markdown :source="item.answerDescription" />
                </v-col>
              </v-row>
            </v-main>

            <v-main v-else>
              <v-row v-for="(item, index) in question.answers" :key="index">
                <v-col cols="2">{{ letters[index] }} -</v-col>
                <v-col>
                  <vue-markdown :source="item.text" />
                </v-col>
              </v-row>
            </v-main>

            <v-btn
              class="buttonIsHidden"
              fixed
              dark
              fab
              bottom
              right
              color="red"
              @click="toPrint()"
            >
              <v-icon>mdi-file-outline</v-icon>
            </v-btn>

            <v-btn fixed fab bottom left class="buttonIsHidden" @click="back()">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
          </div>
        </div>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import VueMarkdown from "vue-markdown";
require("vue-markdown");

export default {
  props: ["question"],
  components: {
    "vue-markdown": VueMarkdown
  },
  data() {
    return {
      letters: ["A", "B", "C", "D"]
    };
  },
  methods: {
    back() {
      this.$emit("closeDialogPrint");
    },
    toPrint() {
      window.print();
    },
    confirmImage(val) {
      if (typeof val == "undefined" || val == "") return false;
      else return true;
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
