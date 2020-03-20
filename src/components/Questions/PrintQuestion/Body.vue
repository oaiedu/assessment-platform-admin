<template>
  <v-container>
    <div class="question-page">
      DISCIPLINA: {{ question.data.DISCIPLINA }}
      <br>
      CONHECIMENTO: {{ question.data.CONHECIMENTO }} [ {{ question.data.RELEVANCIA_OR }} / {{ question.data.RELEVANCIA_OSR }} ]
      <br>
      IQ: {{ question.id }}
      <br>
      <br>

      {{ question.data.PERGUNTA }}
      <br>
      <br>

      <div class="img-container" v-if="confirmImage(question.data.IMAGENS)">
        <img :src="question.data.IMAGENS" style="max-height: 250px; max-width: 180px"/>
      </div>

      <v-content v-if="typeof question.data.RESPOSTAS[0].text !== 'string'">
        <v-row>
          <v-col cols="2"></v-col>
          <v-col v-for="(item, index) in question.data.RESPOSTAS[0].text" :key="index" cols="2">{{ item.title }}</v-col>
        </v-row>

        <v-row>
          <v-col cols="2">A -</v-col>
          <v-col
            v-for="(item, index) in question.data.RESPOSTAS[0].text"
            :key="index"
            cols="2"
          >{{ item.answerDescription }}</v-col>
        </v-row>

        <v-row>
          <v-col cols="2">B -</v-col>
          <v-col
            v-for="(item, index) in question.data.RESPOSTAS[1].text"
            :key="index"
            cols="2"
          >{{ item.answerDescription }}</v-col>
        </v-row>

        <v-row>
          <v-col cols="2">C -</v-col>
          <v-col
            v-for="(item, index) in question.data.RESPOSTAS[2].text"
            :key="index"
            cols="2"
          >{{ item.answerDescription }}</v-col>
        </v-row>

        <v-row>
          <v-col cols="2">D -</v-col>
          <v-col
            v-for="(item, index) in question.data.RESPOSTAS[3].text"
            :key="index"
            cols="2"
          >{{ item.answerDescription }}</v-col>
        </v-row>
      </v-content>

      <v-content v-else>
        <v-row v-for="(item, index) in question.data.RESPOSTAS" :key="index">
          <v-col cols="2">{{ letters[index] }} - </v-col>
          <v-col>
            {{ item.text }}
          </v-col>
        </v-row>
      </v-content>

      <v-btn class="buttonIsHidden" fixed dark fab bottom right color="red" @click="toPrint()">
        <v-icon>mdi-file-outline</v-icon>
      </v-btn>

      <v-btn
        fixed
        fab
        bottom
        left
        class="buttonIsHidden"
        @click="back()"
      >
        <v-icon>
          mdi-arrow-left
        </v-icon>
      </v-btn>

    </div>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      letters: ['A','B','C','D'],
    }
  },
  computed: {
    sla () {
      console.log("mano: ",this.$route.params.questionId)
      return this.$route.params.questionId
    },
    question () {
      return this.$store.getters.findQuestionById(this.$route.params.questionId)
    }
  },
  methods: {
    back(){
      this.$router.push('/questions');
    },
    toPrint() {
      window.print()
    },
    confirmImage(val) {
      if (typeof val == 'undefined' || val == "")
        return false

      else
        return true
    },
    close() {
      this.$emit("closeDialogPrint")
    }
  }
}
</script>

<style>
@media print {
   header{
    display:none !important
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
