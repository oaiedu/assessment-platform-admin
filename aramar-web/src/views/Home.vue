<template>
  <div class="home">
  <p>sasa</p>

    <fab/>
    <statistics-questions/>
  </div>
</template>

<script>
// @ is an alias to /src
import Fab from '@/components/Fab.vue'
import StatisticsQuestions from '@/components/Questions/StatisticsQuestions'


export default {
  name: 'home',
  components: {
    Fab,
    StatisticsQuestions
  }
}
</script>
