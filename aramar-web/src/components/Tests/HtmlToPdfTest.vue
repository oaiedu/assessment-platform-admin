<template>
  <v-card>
    <v-btn @click="generatePdf()">Gerar PDF</v-btn>
    {{currentTest}}
  </v-card>
</template>

<script>
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
export default {
    props: ["test"],
    data () {
        return {
            letters: ['A','B','C','D'],
        }
    },
    computed: {
        currentTest() {
            let aux = []

            this.test.data.PERGUNTAS.forEach(element =>
                aux.push(this.$store.getters.findQuestionById(element))
            )

            return aux
        }
    },
    methods: {
      generatePdf(i) {
        var pageWidth = 8,
          	lineHeight = 1.2,
          	margin = 0.5,
          	maxLineWidth = pageWidth - margin * 2,
          	fontSize = 12,
          	ptsPerInch = 72,
          	oneLineHeight = fontSize * lineHeight / ptsPerInch

        var doc = new jsPDF({
          		unit: 'in',
          		lineHeight: lineHeight
          	})

        this.currentTest.forEach( element => {
          let texttohtml = `
            ASSUNTO: ${element.data.DISCIPLINA}
            CONHECIMENTO: ${element.data.CONHECIMENTO} [${element.data.RELEVANCIA_OR}/${element.data.RELEVANCIA_OSR}]
            IQ: ${element.id}

            ${element.data.PERGUNTA}

            A - ${element.data.RESPOSTAS[0].text}

            B - ${element.data.RESPOSTAS[1].text}

            C - ${element.data.RESPOSTAS[2].text}

            D - ${element.data.RESPOSTAS[3].text}
            `
          var textLines = doc
              .setFontSize(fontSize)
              .splitTextToSize(texttohtml,maxLineWidth)
          doc.text(textLines, margin, margin + 2 * oneLineHeight)
          doc.addPage("a4","p")
        })

        doc.save("test.pdf")
      }
    }
}
</script>
