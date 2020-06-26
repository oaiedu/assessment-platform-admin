<template>
  <div class="home">
    <v-container v-if="user != null || user != undefined">
      <v-row justify="center">
        <v-col sm=4>
          <profile />
        </v-col>
        <v-col sm=8>
          <statistics-questions :statistics="statistics" :numberOfQuestions="numberOfQuestions"/>
        </v-col>
      </v-row>
      <fab/>
    </v-container>

    <v-row justify="center" align="center" v-else>
      <v-col class="section-1" cols="9"/>
      <v-col>
        <v-container>
          <SignUser/>
        </v-container>
      </v-col>
    </v-row>
  </div>
</template>

<script>
// @ is an alias to /src
import Fab from '@/components/Fab.vue'
import StatisticsQuestions from '@/components/Questions/StatisticsQuestions'
import profile from '@/components/DisplayProfile'
import SignUser from '@/components/SignUser'

export default {
  data: () => ({

  }),
  name: 'home',
  components: {
    Fab,
    StatisticsQuestions,
    SignUser,
    profile
  },
  computed: {
    user () {
      return this.$store.getters.user
    },
    userInfo () {
      return this.$store.getters.userInfo
    },
    statistics(){
      let statisticsObj=[]
      const cat =  this.$store.getters.getSubjects
      cat.forEach(element=>{
        console.log(element)
        const numberOfQuestions = this.$store.getters.getNumberOfQuestionBySubject(element)
        statisticsObj.push({name: element, questions: numberOfQuestions})
        console.log(numberOfQuestions)
      })
      console.log(statisticsObj)
      return statisticsObj
    },
    numberOfQuestions(){
      return this.$store.getters.numberOfQuestions
    }
  }
}
</script>

<style>
  .section-1 {
    height: 100vh;
    background: url("https://firebasestorage.googleapis.com/v0/b/pwr-quiz-generator.appspot.com/o/aramar-em-foto-da-agc3aancia-brasil.jpg?alt=media&token=e0077c22-cea2-4670-ad08-5e64eb0c8c57")
  }
</style>
