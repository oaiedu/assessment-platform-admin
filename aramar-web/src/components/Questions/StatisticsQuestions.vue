<template>
<div>
  <v-simple-table>
    <template v-slot:default>
    <thead class="grey lighten-2" style="height:48px">
        <tr class="font-weight-bold">
          <th class="text-left">DISCIPLINA</th>
          <th class="text-left">QUESTÕES</th>
          <th class="text-left">PARTICIPAÇÃO</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in statistics" :key="item.name">
          <td class="text-left">{{ item.name }}</td>
          <td class="text-center">{{ item.questions }}</td>
          <td class="text-center">{{ ((item.questions * 100)/ numberOfQuestions).toFixed(2) }}%</td>
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
    props: ["statistics", "numberOfQuestions"],
    computed:{
      categories(){
        return this.$store.getters.getSubjects
      },
    }
  }
</script>
