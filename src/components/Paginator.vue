<template>
    <div class='paginator'>
        <v-container>
            <v-row justify="center">
                <v-btn
                    color='white'
                    width="35px"
                    min-width="0"
                    height="35px"
                    :ripple='false'
                    @click='toFirst()'
                    :disabled='page === 1' >
                    <v-icon>mdi-chevron-double-left</v-icon>
                </v-btn>

                <v-btn
                    color='white'
                    width="35px"
                    min-width="0"
                    height="35px"
                    :ripple='false'
                    class='ml-3'
                    @click='onPrevious()'
                    :disabled='page === 1' >
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>

                <v-btn
                    color='light-blue'
                    dark
                    width="35px"
                    min-width="0"
                    height="35px"
                    :ripple='false'
                    class='ml-3 page-button' >
                    {{ page }}
                </v-btn>

                <v-btn
                    color='white'
                    width="35px"
                    min-width="0"
                    height="35px"
                    :ripple='false'
                    class='ml-3'
                    @click='onNext()'
                    :disabled='page === length' >
                    <v-icon>mdi-chevron-right</v-icon>
                </v-btn>

                <v-btn
                    color='white'
                    width="35px"
                    min-width="0"
                    height="35px"
                    :ripple='false'
                    class='ml-3'
                    @click='toLast()'
                    :disabled='page === length' >
                    <v-icon>mdi-chevron-double-right</v-icon>
                </v-btn>
            </v-row>
        </v-container>
    </div>
</template>

<script>
    export default {
        name: 'Paginator',
        props: { page: Number, length: Number },
        data() {
            return {

            }
        },
        methods: {
            onNext() {
                const next = this.page + 1;
                this.$emit('pageChange', next > this.length ? { page: this.length, mode: 'last' } : { page: next, type: 'next' });
            },
            onPrevious() {
                const previous = this.page - 1;
                this.$emit('pageChange', previous < 1 ? { page: 1, mode: 'first' } : { page: previous, type: 'previous' });
            },
            toFirst() {
                this.$emit('pageChange', { page: 1, mode: 'first' });
            },
            toLast() {
                this.$emit('pageChange', { page: this.length, mode: 'last' });
            }
        }
    }
</script>

<style>
    button.page-button {
        font-size: 1rem !important;
    }

    .paginator button.v-btn {
        font-weight: 400 !important;
    }
</style>
