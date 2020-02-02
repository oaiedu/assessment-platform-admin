<template>
  <v-container>
    <div>
      <div id="example-1">
        <div v-for="question in questions">
          <p class="question-page">
            ASSUNTO: {{ question.data.DISCIPLINA }}
            <br>
            CONHECIMENTO: {{ question.data.CONHECIMENTO }} [ {{ question.data.RELEVANCIA_OR }} / {{ question.data.RELEVANCIA_OSR }} ]
            <br>
            IQ: {{ question.id }}
            <br>
            <br>

            {{ question.data.PERGUNTA }}
            <br>
            <br>

            <div class="img-container">
            <img src=${question.data.IMAGENS}/>
            </div>

            <br>
            <br>

            <v-content v-if="confirmTitle">
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
              <br />

              <v-row>
                <v-col cols="2">B -</v-col>
                <v-col
                  v-for="(item, index) in question.data.RESPOSTAS[1].text"
                  :key="index"
                  cols="2"
                >{{ item.answerDescription }}</v-col>
              </v-row>
              <br />

              <v-row>
                <v-col cols="2">C -</v-col>
                <v-col
                  v-for="(item, index) in question.data.RESPOSTAS[2].text"
                  :key="index"
                  cols="2"
                >{{ item.answerDescription }}</v-col>
              </v-row>
              <br />

              <v-row>
                <v-col cols="2">D -</v-col>
                <v-col
                  v-for="(item, index) in question.data.RESPOSTAS[3].text"
                  :key="index"
                  cols="2"
                >{{ item.answerDescription }}</v-col>
              </v-row>
            </v-content>

            <v-content v-else v-for="(item, index) in question.data.RESPOSTAS" :key="index">
              <v-row>
                <v-col cols="2">{{ letters[index] }} - </v-col>
                <v-col>
                  {{ item.text }}
                </v-col>
              </v-row>
            </v-content>

          </p>
        </div>
      </div>

      <v-btn class="buttonIsHidden" fixed dark fab bottom right color="red" @click="toPrint()">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </div>
  </v-container>
</template>


<script>


export default {
  data() {
    return {
      letters: ['A','B','C','D'],
      number: 0,
      confirmTitle: false,
    }
  },
  watch: {
    questions(val){
      if(typeof val.data.RESPOSTAS[0].text == "string")
        this.number = 1
      else
        this.number = val.data.RESPOSTAS[0].text.length

      if (this.number > 1) this.confirmTitle = true;
      else this.confirmTitle = false;

      if(this.number>1){
        for(var i = 0; i < this.number; i++){
          this.auxTitle[i] = val.data.RESPOSTAS[0].text[i].title
        }
      }
    }
  },
  methods: {
    toPrint(){
      window.print()
    }
  },
  computed:{
    test() {
      return
    },
    questions() {
      let questionsAux=[]
      let test = this.$store.getters.findTestById(this.$route.params.testId)
      test.data.questions.forEach(element=>{
        var question = this.$store.getters.findQuestionById(element)
        questionsAux.push(question)
      })
      console.log(questionsAux)
      return questionsAux
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
    text-align: center !important
}


p {
  page-break-inside: avoid;
}


}

</style>
