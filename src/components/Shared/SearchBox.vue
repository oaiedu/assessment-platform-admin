<template>
    <v-text-field
        id='searchField'
        v-model="search"
        @keydown="keydown($event)"
        clearable
        filled
        rounded
        dense
        append-icon="mdi-magnify"
        :label="label"
        single-line
        hide-details >
    </v-text-field>
</template>

<script>
    export default {
        name: 'SearchBox',
        props: { label: String },
        data() {
            return {
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
