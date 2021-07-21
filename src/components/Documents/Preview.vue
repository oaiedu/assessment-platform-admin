<template>
    <v-card>
        <v-card-title>{{ title }}</v-card-title>
        <v-card-text>
            <vue-markdown :source='description || ""' />
        </v-card-text>
        <v-row justify="center">
            <img v-if="image" :src="image" style="max-height: 360px; max-width: 480px; width: 100%;">
        </v-row>
    </v-card>
</template>

<script>
    import VueMarkdown from 'vue-markdown';
    import 'vue-markdown';

    export default {
        name: 'PreviewDocument',
        props: {
            title: String,
            description: String,
            image: {
                required: false,
                default: null
            }
        },
        components: { 'vue-markdown': VueMarkdown }
    }
</script>
