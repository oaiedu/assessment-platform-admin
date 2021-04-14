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

            <v-row
                justify="center"
                style="margin-top: 20px"
                v-if="image && image !== ''"
            >
                <img style="max-height: 250px; max-width: 180px" :src="image" alt='image' />
            </v-row>

            <Answers :answers='answers' />
        </v-card-text>
    </v-card>
</template>

<script>
    import VueMarkdown from "vue-markdown";
    import "vue-markdown";
    import Answers from './Answers';

    export default {
        name: 'PreviewQuestions',
        props: ['iq', 'subject', 'knowledge', 'knowledgePWR', 'knowledgeBWR', 'questionDesc', 'answers', 'image'],
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
