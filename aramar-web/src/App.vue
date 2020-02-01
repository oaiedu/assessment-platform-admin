<template>
  <v-app>
    <component v-bind:is="layout"></component>
  </v-app>
</template>

<script>
import PrintLayout from './layouts/PrintLayout'
import ToolbarLayout from './layouts/ToolbarLayout'

export default {
  computed: {
    layout () {
      return this.$store.getters.getLayout
    }
  },
  components: {
    'toolbar-layout': ToolbarLayout,
    'print-layout': PrintLayout
    // define as many layouts you want for the application
  }
}
</script>
