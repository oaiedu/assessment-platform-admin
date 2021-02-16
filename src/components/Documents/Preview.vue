<template>
    <v-card>
        <v-card-title>{{ title }}</v-card-title>
        <v-card-text>
            <vue-markdown :source='description || ""' />
        </v-card-text>
    </v-card>
</template>

<script>
    import VueMarkdown from 'vue-markdown';
    import 'vue-markdown';

    export default {
        name: 'PreviewDocument',
        props: { title: String, description: String },
        components: { 'vue-markdown': VueMarkdown }
    }
</script>
