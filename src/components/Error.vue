<template>
    <div style="position: absolute; left: 50%;" class="pt-4">
        <v-alert
            v-if="error"
            style="position: relative; left: -50%;"
            type="error"
            @dismiss="onDismissed"
            dismissible >
            {{ error.message }}
        </v-alert>
    </div>
</template>

<script>
    export default {
        name: 'Error',
        computed: {
            error () {
                return this.$store.getters.error
            },
        },
        methods: {
            onDismissed () {
                this.$store.dispatch('clearError');
            }
        }
    }
</script>
