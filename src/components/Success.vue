<template>
    <v-snackbar v-model="snackbar" color="green" dark timeout="10000" top>
        <strong>{{ success }}</strong>

        <template v-slot:action="{ attrs }">
            <v-icon
                v-bind="attrs"
                @click="snackbar = false"
                dark >
                {{ mdiClose }}
            </v-icon>
        </template>
    </v-snackbar>
</template>

<script>
    import { mdiClose } from '@mdi/js';

    export default {
        name: 'Success',
        data() {
            return {
                mdiClose,
                snackbar: false
            }
        },
        computed: {
            success() {
                return this.$store.getters.success;
            }
        },
        watch: {
            success(value) {
                this.snackbar = !!value;
            },
            snackbar(value) {
                if(!value) {
                    this.$store.dispatch('clearSuccess');
                }
            }
        }
    }
</script>
