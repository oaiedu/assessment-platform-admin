<template>
  <v-card>
    <v-btn @click="generatePdf()">Gerar PDF</v-btn>
    {{currentTest}}
  </v-card>
</template>

<script>
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as fontFile from '@/assets/ARIALUNI.TTF'

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
      generatePdf(){

        var pageWidth = 8,
            lineHeight = 1.2,
            margin = 0.5,
            maxLineWidth = pageWidth - margin * 2,
            fontSize = 12

        var doc = new jsPDF({
          unit: 'in'
        })

        var fontInBase64 = '',
            fileName = '',
            reader = new FileReader()

        
        // fontInBase64 = reader.result.split(',')[1];
        // fileName = fontFile.name.replace(/\s+/g, '-');
        // fileNameWithoutExtension = fileName.split('.')[0],
        console.log("brabuleta")
        doc.addFileToVFS("Arial Unicode MS", fontFile);
        doc.addFont("Arial Unicode MS");

        doc.setFont("Arial Unicode MS");

        this.currentTest.forEach( element => {
          if ( typeof element.data.IMAGENS === 'undefined' || element.data.IMAGENS === "" ){
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
            let textLines = doc.splitTextToSize(texttohtml,maxLineWidth)
            doc.text(textLines, margin, margin)

            doc.addPage( "a4", "p" )
          }

          else {
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
            let textLines = doc.splitTextToSize(texttohtml,maxLineWidth)
            doc.text(textLines, margin, margin)

            doc.addImage(element.data.IMAGENS, "JPEG", pageWidth/4, 3.5, 3, 3)

            doc.addPage( "a4", "p" )
          }
        })

        doc.save("test.pdf")
      }
    }
}
</script>
