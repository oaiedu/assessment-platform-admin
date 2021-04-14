<template>
    <v-container>
        <ListOfAnswersTest :questions='questions' />

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
    import ListOfAnswersTest from '../../Tests/ListOfAnswers';

    export default {
        name: 'ListOfAnswers',
        components: { ListOfAnswersTest },
        computed: {
            questions() {
                return [
                    { iq: 'P0001', answers: [{ value: true }, { value: false }, { value: false }, { value: false }] },
                    { iq: 'P0002', answers: [{ value: false }, { value: true }, { value: false }, { value: false }] },
                    { iq: 'P0003', answers: [{ value: false }, { value: false }, { value: true }, { value: false }] },
                    { iq: 'P0004', answers: [{ value: false }, { value: false }, { value: false }, { value: true }] }
                ]
            }
        },
        data() {
            return {
                mdiArrowLeft
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
