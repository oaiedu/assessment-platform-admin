<template>
    <v-btn :style @click="More">
        More
    </v-btn>
</template>

<script>
export default {
    props: {
        disable: {
            type: Boolean
        },
        link: {
            type: String
        },
        methods: {
             More() {
                this.$router.push(link);
            }
        }
    }
}
</script>

<style scoped>
button {
    background: #888888;
    color: black;
    border: none;
    border-radius: 5px;
    padding: 10px 40px;
    font-size: 16px;
}