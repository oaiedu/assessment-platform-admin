<template>
    <v-container>
        <QuestionsList :questions='questions' />

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
    import QuestionsList from '../../Tests/QuestionsList';

    export default {
        name: 'PPQuestions',
        components: { QuestionsList },
        computed: {
            questions() {
                return [
                    {
                        subject: 'Disciplina 1',
                        iq: 'P0001'
                    },
                    {
                        subject: 'Disciplina 2',
                        iq: 'P0002'
                    },
                    {
                        subject: 'Disciplina 3',
                        iq: 'P0003'
                    },
                    {
                        subject: 'Disciplina 4',
                        iq: 'P0004'
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
