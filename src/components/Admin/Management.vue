<template>
    <v-container>
        <div class="text-center">
            <v-btn color="green" dark fab @click="backup()">
                <v-icon>mdi-cloud-upload</v-icon>
            </v-btn>
        </div>
    </v-container>
</template>

<script>
    export default {
        name: 'Management',
        methods: {
            backup() {
                const now = new Date().toISOString().replace(/:/g, '-');
                this.$store.dispatch('backupFirebase', { now });
            }
        }
    }
</script>

<style>

</style>
