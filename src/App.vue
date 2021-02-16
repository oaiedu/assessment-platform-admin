<template>
    <v-app>
        <component v-bind:is="layout"></component>
    </v-app>
</template>

<script>
    import ToolbarLayout from './layouts/ToolbarLayout';
    import Error from './components/Error';
    import Success from './components/Success';

    export default {
        computed: {
            layout () {
                return this.$store.getters.getLayout;
            }
        },
        components: {
            Error,
            Success,
            'toolbar-layout': ToolbarLayout
            // define as many layouts you want for the application
        }
    }
</script>
