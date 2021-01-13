<template>
    <v-container>
        <div class="question-page">
            <p class="centered-text">
                <b>
                    MARINHA DO BRASIL
                    <br />
                    CENTRO TECNOLÓGICO DA MARINHA EM SÃO PAULO
                    <br /><br />
                </b>
                {{ title }}
                <br />
                <b>{{ currentDate }}</b>
                <br />
                <br />
            </p>
            <p class="left-text">
                Responsável: {{ creator }}
                <br />
                <br />
                Revisão: {{ editedDate }}
                <br />
                <br />
                Propósito: {{ purpose }}
                <br />
                <br />
                Alterações:
                <br />
                <br />
            </p>
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
        name: 'Intro',
        data() {
            return {
                title: 'Título',
                creator: 'Criador',
                editedDate: 'Usuário - 01/01/2021',
                purpose: 'Propósito'
            }
        },
        computed: {
            currentDate() {
                var today = new Date();
                var months = [
                    "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
                    "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
                ]
                var result = months[today.getMonth()] + " DE " + today.getFullYear();
                return result;
            }
        },
        methods: {
            back() {
                this.$emit('closeDialogIntro');
            }
        }
    }
</script>

<style>

</style>
