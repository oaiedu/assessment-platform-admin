<template>
  <v-app>
    <component v-bind:is="layout"></component>
  </v-app>
</template>

<script>
import PrintLayout from './layouts/PrintLayout'
import ToolbarLayout from './layouts/ToolbarLayout'
import Error from './components/Error'


export default {
  computed: {
    layout () {
      return this.$store.getters.getLayout
    }
  },
  components: {
    Error,
    'toolbar-layout': ToolbarLayout,
    Error,
    'print-layout': PrintLayout
    // define as many layouts you want for the application
  }
}
</script>
