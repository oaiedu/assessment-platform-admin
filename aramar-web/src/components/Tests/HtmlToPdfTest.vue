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
          	fontSize = 12

        var doc = new jsPDF({
          		unit: 'in'
          	})

        this.currentTest.forEach( element => {
          if(element.data.IMAGENS == 'undefined'){
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
            doc.text(textLines, margin, margin)
            doc.addPage("a4","p")
          }

          else {
            let texttohtml = `
ASSUNTO: ${element.data.DISCIPLINA}
CONHECIMENTO: ${element.data.CONHECIMENTO} [${element.data.RELEVANCIA_OR}/${element.data.RELEVANCIA_OSR}]
IQ: ${element.id}

        ${element.data.PERGUNTA}


            `
            var textLines = doc
                .setFontSize(fontSize)
                .splitTextToSize(texttohtml,maxLineWidth)
            doc.text(textLines, margin, margin)

            var imageFromStorage = this.$store.dispatch("findImage", element.data.IMAGENS)
            console.log("Image URL", imageFromStorage())
            var imageBase64 = doc.getImageFileTypeByImageData(imageFromStorage)
            console.log("Extracted Image", imageBase64)
            doc.addImage(imageBase64, 'PNG', 15, 40, 180, 180)

            texttohtml = `
A - ${element.data.RESPOSTAS[0].text}

B - ${element.data.RESPOSTAS[1].text}

C - ${element.data.RESPOSTAS[2].text}

D - ${element.data.RESPOSTAS[3].text}
            `
            var textLines = doc
                .setFontSize(fontSize)
                .splitTextToSize(texttohtml,maxLineWidth)
            doc.text(textLines, margin, margin)
          }
        })

        doc.save("test.pdf")
      }
    }
}
</script>
