<template>
    <div class="question-page">
        <v-simple-table>
            <template v-slot:default>
                <thead>
                    <tr>
                        <th class="text-left">Questão</th>
                        <th class="text-left">IQ</th>
                        <th class="text-left">Resposta</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in table" :key="item.iq">
                        <td>{{ item.question }}</td>
                        <td>{{ item.iq }}</td>
                        <td>{{ item.answer }}</td>
                    </tr>
                </tbody>
            </template>
        </v-simple-table>
    </div>
</template>

<script>
    export default {
        name: 'ListOfAnswersTest',
        props: ['questions'],
        data() {
            return {
                letters: ['A','B','C','D']
            }
        },
        computed: {
            table() {
                const result = [];

                for ( let i = 0; i < this.questions.length; i++ ) {
                    const data = { question: "", iq: "", answer: ""}
                    data.question = i + 1;
                    data.iq = this.questions[i].iq;

                    for( let j = 0; j < 4; j++){
                        if(this.questions[i].answers[j].value == true) {
                            data.answer = this.letters[j];
                        }
                    }
                    result.push(data);
                }

                return result;
            }
        }
    }
</script>

<style>
    @media print {
        .question-page {
            font-size: 13px;
            page-break-after: always !important;
        }
    }
</style>
