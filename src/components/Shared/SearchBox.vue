<template>
    <v-text-field
        id='searchField'
        v-model="search"
        @keydown="keydown($event)"
        clearable
        filled
        rounded
        dense
        :append-icon="mdiMagnify"
        :label="label"
        single-line
        hide-details >
    </v-text-field>
</template>

<script>
    import { mdiMagnify } from '@mdi/js';

    export default {
        name: 'SearchBox',
        props: { label: String },
        data() {
            return {
                mdiMagnify,
                search: ''
            }
        },
        methods: {
            keydown(event) {
                if(event.key === 'Enter') {
                    document.getElementById('searchField').blur();
                    this.$emit('enter', this.search);
                }
            }
        },
        watch: {
            search(text) {
                this.$emit('textChange', text);
            }
        }
    }
</script>
