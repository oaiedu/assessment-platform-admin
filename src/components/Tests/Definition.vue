<template>
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
</template>

<script>
    export default {
        name: 'DefinitionTest',
        props: {
            title: String,
            creator: String,
            editedDate: String,
            purpose: String
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
        }
    }
</script>

<style>
    @media print {
        .question-page {
            font-size: 13px;
            page-break-after: always !important
        }
    }
</style>
