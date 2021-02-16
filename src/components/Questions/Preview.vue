<template>
    <v-card fill>
        <v-card-title>Preview</v-card-title>
        <v-card-text>
            DISCIPLINA: {{ subject }}
            <br />
            CONHECIMENTO: {{ knowledge }} [{{ knowledgePWR }}/{{ knowledgeBWR }}]
            <br />
            IQ: {{ iq }}
            <br />

            <br />
            <vue-markdown :source="questionDesc" />
            <br />

            <Answers :answers='answers' />
        </v-card-text>
    </v-card>
</template>

<script>
    import VueMarkdown from "vue-markdown";
    require("vue-markdown");
    import Answers from './Answers';

    export default {
        name: 'PreviewQuestions',
        props: ['iq', 'subject', 'knowledge', 'knowledgePWR', 'knowledgeBWR', 'questionDesc', 'answers'],
        components: { 'vue-markdown': VueMarkdown, Answers }
    }
</script>

<style>
    .answer-block {
        margin: 0 !important;
    }

    .answer-block .col {
        padding: 0 10px 0 10px !important;
    }
</style>
