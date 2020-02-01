<template>
  <p>
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
</template>

<script>
export default {
  data() {
    return {
      number: 0,
      letters: ['A','B','C','D'],
      confirmTitle: false,
      auxTitle: []
    }
  },
  props: ["question"],
  watch: {
    question(val) {
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
  }
}
</script>
