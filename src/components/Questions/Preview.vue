<template>
  <v-card fill>
    <v-card-title>Preview</v-card-title>
    <v-card-text>
      DISCIPLINA: {{subject}}
      <br />
      CONHECIMENTO: {{knowledge}} [{{knowledgePWR}}/{{knowledgeBWR}}]
      <br />
      IQ: {{id}}
      <br />

      <br/>
        <vue-markdown :source="questionDescription"/>
      <br/>

      <v-content v-if="confirmTitle">
        <v-row>
          <v-col cols="2"></v-col>
          <v-col v-for="(item, index) in answers[0].text" :key="index" cols="2">{{ item.title }}</v-col>
        </v-row>

        <v-row>
          <v-col cols="2">A -</v-col>
          <v-col
            v-for="(item, index) in answers[0].text"
            :key="index"
            cols="2"
          >{{ item.answerDescription }}</v-col>
        </v-row>
        <br />

        <v-row>
          <v-col cols="2">B -</v-col>
          <v-col
            v-for="(item, index) in answers[1].text"
            :key="index"
            cols="2"
          >{{ item.answerDescription }}</v-col>
        </v-row>
        <br />

        <v-row>
          <v-col cols="2">C -</v-col>
          <v-col
            v-for="(item, index) in answers[2].text"
            :key="index"
            cols="2"
          >{{ item.answerDescription }}</v-col>
        </v-row>
        <br />

        <v-row>
          <v-col cols="2">D -</v-col>
          <v-col
            v-for="(item, index) in answers[3].text"
            :key="index"
            cols="2"
          >{{ item.answerDescription }}</v-col>
        </v-row>
      </v-content>

      <v-content v-else>
        <v-row v-for="(item, index) in answers" :key="index">
          <v-col cols="1">{{ letters[index] }} - </v-col>
          <v-col>
            {{ item.text }}
          </v-col>
        </v-row>
      </v-content>
    </v-card-text>
  </v-card>
</template>

<link rel="stylesheet" href="https://unpkg.com/katex@0.6.0/dist/katex.min.css">

<script>
export default{
  prop: ["question"]
}
</script>
