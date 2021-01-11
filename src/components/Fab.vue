<template>
    <v-speed-dial
      fixed
      bottom
      right
      v-model="fab"
      direction="top"
      transition="slide-y-reverse-transition"
    >
      <template v-slot:activator>
        <v-tooltip left>
          <template v-slot:activator="{ on }">
            <v-btn
              v-model="fab"
              color="blue darken-1"
              v-on="on"
              dark
              fab
            >
              <v-icon v-if="fab">mdi-close</v-icon>
              <v-icon v-else>mdi-plus</v-icon>
            </v-btn>
          </template>
          <span v-if="fab">Fechar</span>
          <span v-else>Criar</span>
        </v-tooltip>
      </template>

      <v-tooltip left v-if='userClaims["appraiser"] || userClaims["admin"]'>
        <template v-slot:activator="{ on }">
          <v-btn
            fab
            dark
            small
            v-on="on"
            @click="toQuestions"
            color="blue darken-1"
          >
            <v-icon>mdi-file-question-outline</v-icon>
          </v-btn>
        </template>
        <span>Criar nova questão</span>
      </v-tooltip>

      <v-tooltip left v-if='userClaims["teacher"] || userClaims["admin"]'>
        <template v-slot:activator="{ on }">
          <v-btn
            fab
            dark
            small
            v-on="on"
            @click="toTests"
            color="blue darken-1"
          >
            <v-icon>mdi-file-multiple-outline</v-icon>
          </v-btn>
        </template>
        <span>Criar nova prova</span>
      </v-tooltip>
    </v-speed-dial>
</template>

<script>
    export default {
        props: ['userClaims'],
        data() {
            return {
                fab: false
            }
        },
        methods: {
            toQuestions(){
                this.$router.push('/questions')
            },
            toTests(){
                this.$router.push('/tests')
            }
        }
    }
</script>
