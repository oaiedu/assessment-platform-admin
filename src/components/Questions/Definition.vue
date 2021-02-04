<template>
    <div>
        DISCIPLINA: {{ question.subject }}
        <br />
        CONHECIMENTO: {{ question.knowledge }} [ {{ question.knowledgePWR }} / {{ question.knowledgeBWR }} ]
        <br />
        IQ: {{ question.iq }}
        <br />

        <br />
        <vue-markdown :source="question.question" />
        <br />
    </div>
</template>

<script>
    import VueMarkdown from "vue-markdown";
    require("vue-markdown");

    export default {
        name: 'Definition',
        props: ['question'],
        components: {
            'vue-markdown': VueMarkdown
        }
    }
</script>
