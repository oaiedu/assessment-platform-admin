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

<style>
    @font-face{
        font-family: "Roboto";
        src: url('~@/assets/fonts/roboto/Roboto-Light.ttf') format('truetype');
        font-weight: 300;
        font-display: swap;
    }

    @font-face{
        font-family: "Roboto";
        src: url('~@/assets/fonts/roboto/Roboto-Regular.ttf') format('truetype');
        font-weight: 400;
        font-display: swap;
    }

    @font-face{
        font-family: "Roboto";
        src: url('~@/assets/fonts/roboto/Roboto-Medium.ttf') format('truetype');
        font-weight: 500;
        font-display: swap;
    }

    @font-face{
        font-family: "Roboto";
        src: url('~@/assets/fonts/roboto/Roboto-Bold.ttf') format('truetype');
        font-weight: 700;
        font-display: swap;
    }
</style>
