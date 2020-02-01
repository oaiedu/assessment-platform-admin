<template>
  <div id="print">
    <v-card>
      <v-container>
        <def-block :question="question"/>
        <img-block :question="question"/>
        <ans-block :question="question"/>
        <v-btn fixed dark fab bottom right color="cyan" @click="printfPDF()">
          <v-icon>mdi-file-download</v-icon>
        </v-btn>
      </v-container>
    </v-card>
  </div>
</template>

<script>
export default {
  data() {
    return {

    }
  },
  props: ["question"],
  methods: {
    printfPDF() {
      this.$htmlToPaper('print');
    }
  }
}
</script>
