<template>
  <v-card fill>
    <v-card-title>Preview</v-card-title>
    <v-card-text>
      DISCIPLINA: {{ question.subject }}
      <br />
      CONHECIMENTO: {{ question.knowledge }} [{{ question.knowledgePWR }}/{{ question.knowledgeBWR }}]
      <br />
      IQ: {{ question.iq }}
      <br />

      <br/>
        <vue-markdown :source="questionDescription"/>
      <br/>

      <div v-if="confirmTitle">
        <v-row>
          <v-col cols="1"></v-col>
          <v-col v-for="(item, index) in question.answers[0].text" :key="index">{{ item.title }}</v-col>
        </v-row>

        <v-row>
          <v-col cols="1">A -</v-col>
          <v-col
            v-for="(item, index) in question.answers[0].text"
            :key="index"
          >{{ item.answerDescription }}</v-col>
        </v-row>

        <v-row>
          <v-col cols="1">B -</v-col>
          <v-col
            v-for="(item, index) in question.answers[1].text"
            :key="index"
          >{{ item.answerDescription }}</v-col>
        </v-row>

        <v-row>
          <v-col cols="1">C -</v-col>
          <v-col
            v-for="(item, index) in question.answers[2].text"
            :key="index"
          >{{ item.answerDescription }}</v-col>
        </v-row>

        <v-row>
          <v-col cols="1">D -</v-col>
          <v-col
            v-for="(item, index) in question.answers[3].text"
            :key="index"
          >{{ item.answerDescription }}</v-col>
        </v-row>
      </div>

      <div v-else>
        <v-row v-for="(item, index) in question.answers" :key="index">
          <v-col cols="1">{{ letters[index] }} - </v-col>
          <v-col>
            {{ item.text }}
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>

<link rel="stylesheet" href="https://unpkg.com/katex@0.6.0/dist/katex.min.css">

<script>
export default{
  prop: ["question"]
}
</script>
