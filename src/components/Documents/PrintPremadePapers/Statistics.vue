<template>
    <v-container>
        <div class="question-page">
            <statistics-questions :statistics="statistics" :numberOfQuestions="numberOfQuestions"/>
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
                    <v-icon>{{ mdiArrowLeft }}</v-icon>
                </v-btn>
            </template>
            <span>Voltar</span>
        </v-tooltip>
    </v-container>
</template>

<script>
    import { mdiArrowLeft } from '@mdi/js';
    import StatisticsQuestions from '@/components/Questions/StatisticsQuestions';

    export default {
        name: 'PPStatistics',
        components: { StatisticsQuestions },
        computed: {
            statistics() {
                let statisticsObj = [];
                const subject =  this.$store.getters.getSubjects;
                subject.forEach(element => {
                    const numberOfQuestions = 0;
                    statisticsObj.push({ name: element, questions: numberOfQuestions });
                })
                return statisticsObj;
            },
            numberOfQuestions() {
                return 0;
            },
        },
        data() {
            return {
                mdiArrowLeft
            }
        },
        methods: {
            back() {
                this.$emit('closeDialogStatistics');
            }
        }
    }
</script>
