<template>
    <v-container>
        <div class="question-page">
            <v-simple-table>
                <template v-slot:default>
                    <thead>
                        <tr>
                            <th class="text-center">QUESTÃO</th>
                            <th class="text-center">DISCIPLINA</th>
                            <th class="text-center">QUESTÃO DE REFERÊNCIA</th>
                            <th class="text-center">Obs.</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in infoTable" :key="item.iq">
                            <td class="text-center">{{ item.question }}</td>
                            <td class="text-center">{{ item.subject }}</td>
                            <td class="text-center">{{ item.iq }}</td>
                            <td class="text-center">{{ item.obs }}</td>
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
        name: 'PPQuestions',
        computed: {
            infoTable() {
                return [
                    {
                        question: 1,
                        subject: 'Disciplina 1',
                        iq: 'P0001',
                        obs: ''
                    },
                    {
                        question: 2,
                        subject: 'Disciplina 2',
                        iq: 'P0002',
                        obs: ''
                    },
                    {
                        question: 3,
                        subject: 'Disciplina 3',
                        iq: 'P0003',
                        obs: ''
                    },
                    {
                        question: 4,
                        subject: 'Disciplina 4',
                        iq: 'P0004',
                        obs: ''
                    }
                ]
            }
        },
        methods: {
            back() {
                this.$emit('closeDialogQuestions');
            }
        }
    }
</script>

<style>

</style>
