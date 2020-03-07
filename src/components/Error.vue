<template>
  <div style="position: absolute; left: 50%;" class="pt-4">
    <v-alert style="position: relative; left: -50%;" type="error" @dismiss="onDismissed" v-if="error" dismissible>{{error.message}}</v-alert>
  </div>
</template>

<script>
  export default {
    data: () => ({

    }),
    computed: {
      error () {
          return this.$store.getters.error
      },
    },
    methods: {
      onDismissed () {
          console.log('Dismissed Alert!')
          this.$store.dispatch('clearError')
      }
    }
  }
</script>
