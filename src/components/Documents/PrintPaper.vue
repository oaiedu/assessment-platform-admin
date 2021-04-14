<template>
  <v-container>
    <div class="question-page">
        <v-row justify="start">
            <vue-markdown :source="paper.description" />
        </v-row>

        <v-row justify="center">
            <img v-if="paper.image && paper.image.length > 0"
            :src="paper.image"
            alt="image"
            style="max-height: 800px; max-width: 350px"/>
        </v-row>
    </div>

    <v-tooltip right>
        <template v-slot:activator='{ on }'>
            <v-btn
                v-on="on"
                fixed
                fab
                bottom
                left
                class="buttonIsHidden"
                @click="back()" >
                <v-icon>{{ mdiArrowLeft }}</v-icon>
            </v-btn>
        </template>
        <span>Voltar</span>
    </v-tooltip>

    <v-tooltip left>
        <template v-slot:activator='{ on }'>
            <v-btn
                v-on="on"
                class="buttonIsHidden"
                fab
                dark
                fixed
                bottom
                right
                color="blue darken-1"
                @click="print()" >
                <v-icon>{{ mdiFileOutline }}</v-icon>
            </v-btn>
        </template>
        <span>Gerar PDF</span>
    </v-tooltip>
  </v-container>
</template>

<script>
    import VueMarkdown from "vue-markdown";
    import "vue-markdown";
    import { mdiArrowLeft, mdiFileOutline } from '@mdi/js';

    export default {
        name: "PrintPaper",
        props: ['paper'],
        components: {
            VueMarkdown
        },
        data() {
            return{
                mdiArrowLeft,
                mdiFileOutline
            }
        },
        methods: {
            back() {
                this.$emit('closeDialogPrint');
            },
            print() {
                window.print();
            }
        }
    }
</script>

<style>
    @media print {
        header {
            display:none !important
        }

        footer {
            display: none !important
        }

        @page {
            margin-top: 1cm;
            margin-bottom: 1cm;
            margin-left: 1cm;
            margin-right: 1cm;
        }

        .question-page {
            font-size: 13px;
            page-break-after: always !important
        }

        .buttonIsHidden {
            visibility: hidden;
        }

        .img-container {
            text-align: center !important;
        }

        p {
            font-size: 13px;
            page-break-inside: avoid;
        }
    }
</style>
