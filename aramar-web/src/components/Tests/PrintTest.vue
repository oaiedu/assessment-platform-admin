<template>
  <div>
    <div id="example-1">
      <div v-for="question in questions">
        <p class="question-page">{{ question }}</p>
      </div>
    </div>
    <v-btn fixed dark fab  right color="red" @click="toPrint()">
      <v-icon>mdi-plus</v-icon>
    </v-btn>

  </div>

</template>


<script>


export default {
  data() {
    return {

    }
  },
  methods: {
    toPrint(){
      window.print()
    }
  },
  computed:{
    test(){
      return
    },
    questions(){
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


p {
  page-break-inside: avoid;
}


}

</style>
