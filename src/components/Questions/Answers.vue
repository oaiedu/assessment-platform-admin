<template>
    <div>
        <div v-if="isMultiColumn">
            <v-row class='answer-block'>
                <v-col cols="auto">
                    <div style="opacity: 0">A -</div>
                </v-col>
                <v-col v-for="(item, index) in answers[0].text" :key="index">
                    <vue-markdown :source="item.title || ''" />
                </v-col>
            </v-row>

            <v-row v-for="(ans, i) in answers" :key="i" class='answer-block'>
                <v-col cols="auto">{{ letters[i] }}</v-col>
                <v-col v-for="(item, index) in answers[i].text" :key="index">
                    <vue-markdown :source="item.answerDescription || ''" />
                </v-col>
            </v-row>
        </div>

        <div v-else>
            <v-row v-for="(item, index) in answers" :key="index" class='answer-block'>
                <v-col cols="auto">{{ letters[index] }}</v-col>
                <v-col>
                    <vue-markdown :source="item.text || ''" />
                </v-col>
            </v-row>
        </div>
    </div>
</template>

<script>
    import VueMarkdown from "vue-markdown";
    import "vue-markdown";

    export default {
        name: 'Answers',
        props: ['answers'],
        components: { 'vue-markdown': VueMarkdown },
        data() {
            return {
                letters: ["A -", "B -", "C -", "D -"]
            }
        },
        computed: {
            isMultiColumn() {
                return typeof(this.answers[0].text) !== 'string';
            }
        }
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
