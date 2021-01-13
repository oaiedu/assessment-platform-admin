<template>
    <v-container>
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

        <v-tooltip right>
            <template v-slot:activator='{ on, attrs }'>
                <v-btn
                    v-on="on"
                    v-bind="attrs"
                    fixed
                    fab
                    bottom
                    left
                    @click="back()" >
                    <v-icon>mdi-arrow-left</v-icon>
                </v-btn>
            </template>
            <span>Voltar</span>
        </v-tooltip>
    </v-container>
</template>

<script>
    export default {
        name: 'ListOfAnswers',
        computed: {
            table() {
                return [
                    { question: 1, iq: 'P0001', answer: 'A' },
                    { question: 2, iq: 'P0002', answer: 'B' },
                    { question: 3, iq: 'P0003', answer: 'C' },
                    { question: 4, iq: 'P0004', answer: 'D' }
                ]
            }
        },
        methods: {
            back() {
                this.$emit('closeDialogAnswers');
            }
        }
    }
</script>

<style>

</style>
