<template>
<div>
{{categories}}
{{statistics}}
{{numberOfQuestions}}
  <v-simple-table dense>
    <template v-slot:default>
    <thead class="grey lighten-2" style="height:48px">
        <tr class="font-weight-bold">
          <th class="text-center">DISCIPLINA</th>
          <th class="text-center">Questões</th>
          <th class="text-center">Participação</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in statistics" :key="item.name">
          <td class="text-left">{{ item.name }}</td>
          <td class="text-center">{{ item.questions }}</td>
          <td class="text-center">{{ (item.questions * 100)/ numberOfQuestions}}%</td>
        </tr>
      </tbody>
      <thead class="grey lighten-2">
        <tr>
          <th class="text-right">TOTAL</th>
          <th class="text-center">{{numberOfQuestions}}</th>
          <th class="text-center">100</th>
        </tr>
      </thead>
    </template>
  </v-simple-table>
  </div>
</template>

<style>
.v-data-table--dense th{
height:48px;
font-weight:700;
border-top:thin solid rgba(0, 0, 0, 0.12)
}
</style>
<script>
  export default {
    data () {
      return {
      }
    },
    computed:{
      categories(){
        return this.$store.getters.getSubjects
      },
      statistics(){
        let statisticsObj=[]
        const cat=  this.$store.getters.getSubjects
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

    },
    methods:{

    }


  }
</script>
