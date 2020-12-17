<template>
  <v-card>
    <v-btn @click="generatePdf()">Gerar PDF</v-btn>
    {{currentTest}}
  </v-card>
</template>

<script>
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import fontFile from "@/assets/ARIALUNI.TTF";

export default {
  props: ["test"],
  data() {
    return {
      letters: ["A", "B", "C", "D"]
    };
  },
  computed: {
    currentTest() {
      let aux = [];

      this.test.questionS.forEach(element =>
        aux.push(this.$store.getters.findQuestionById(element))
      );

      return aux;
    }
  },
  methods: {
    generatePdf() {
      var pageWidth = 203.2,
        lineHeight = 30.48,
        margin = 25.4,
        maxLineWidth = pageWidth - margin * 2,
        fontSize = 12;

      var doc = new jsPDF()

      doc.setFontSize(fontSize)

      var fontInBase64 = "",
        fileName = "",
        reader = new FileReader();

      this.currentTest.forEach( element => {
        if ( typeof element.image === 'undefined' || element.image === "" ){
          let texttohtml = `
ASSUNTO: ${element.subject}
CONHECIMENTO: ${element.knowledge} [${element.knowledgePWR}/${element.knowledgeBWR}]
IQ: ${element.id}

      ${element.question}

A - ${element.answers[0].text}

B - ${element.answers[1].text}

C - ${element.answers[2].text}
1909
D - ${element.answers[3].text}
          `
          let textLines = doc.splitTextToSize(texttohtml,maxLineWidth)
          doc.text(textLines, margin, margin)

          doc.addPage( "a4", "p" )
        }

        else {
          let texttohtml = `
ASSUNTO: ${element.subject}
CONHECIMENTO: ${element.knowledge} [${element.knowledgePWR}/${element.knowledgeBWR}]
IQ: ${element.id}

      ${element.question}

























A - ${element.answers[0].text}

B - ${element.answers[1].text}

C - ${element.answers[2].text}

D - ${element.answers[3].text}
          `
          let textLines = doc.splitTextToSize(texttohtml,maxLineWidth)
          doc.text(textLines, margin, margin)

          doc.addImage(element.image, "JPEG", pageWidth/4, 100, 76.2, 76.2)

          doc.addPage( "a4", "p" )
        }
      })

    var letters = ["A", "B", "C", "D"];

    var generateData = (amount) => {
      var result = []
      var data = {
        question: "",
        answer: ""
      }

      for(var i = 0; i < amount; i++){
        data.question = `${i+1}`

        for(var j = 0; j < 4; j++ ){
          if ( this.currentTest[i].answers[j].value === true ) {
            data.answer = letters[j]
          }
        }
        result.push(Object.assign({}, data))
      }
      return result
    };

    function createHeaders(keys) {
      var result = [];
      for (var i = 0; i < keys.length; i += 1) {
        result.push({
          name: keys[i],
          prompt: keys[i],
          width: 40
        });
      }
      return result;
    }

      var headers = createHeaders(["question", "answer"]);
      doc.table(pageWidth/4, margin, generateData(this.currentTest.length), headers);
      doc.save("test.pdf")
    }
  }
};
</script>
