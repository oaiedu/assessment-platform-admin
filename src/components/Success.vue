<template>
    <v-snackbar v-model="snackbar" color="green" dark timeout="10000" top>
        <strong>{{ success }}</strong>

        <template v-slot:action="{ attrs }">
            <v-icon
                v-bind="attrs"
                @click="snackbar = false"
                dark >
                mdi-close
            </v-icon>
        </template>
    </v-snackbar>

    <!-- <div style="position: absolute; left: 50%;" class="pt-4">
        <v-alert
            v-if="success"
            style="position: relative; left: -50%;"
            type="success"
            @dismiss="onDismissed"
            dismissible >
            {{ success }}
        </v-alert>
    </div> -->
</template>

<script>
    export default {
        name: 'Success',
        data() {
            return {
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
