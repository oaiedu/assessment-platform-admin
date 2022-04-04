<template>
    <v-switch
        v-model="darkMode"
        inset
        :label="`Dark Mode`"
    ></v-switch>
</template>

<script>
    data() {
        return {
            darkMode: false
        }
    },
    watch: {
        darkMode(value) {
            this.$store.commit('setTheme', value ? 'dark' : 'light')
        }
    };
</script>