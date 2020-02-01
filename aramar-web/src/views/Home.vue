<template>
    <div class="home">
      <v-container>
        <v-row no-gutters>
          <v-col sm=4>
            <profile />
          </v-col>
          <v-col sm=8>
            <statistics-questions/>
          </v-col>
        </v-row>

<fab/>
    </v-container>
  </div>
</template>

<script>
// @ is an alias to /src
import Fab from '@/components/Fab.vue'
import Profile from '@/components/User/Profile.vue'
import StatisticsQuestions from '@/components/Questions/StatisticsQuestions'


export default {
  name: 'home',
  components: {
    Fab,
    Profile,
    StatisticsQuestions
  }
}
</script>
