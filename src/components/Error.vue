<template>
  <div v-if="error" class="error-container pt-4">
    <v-alert v-model="isErrorVisible" type="error" dismissible>
      {{ error.message }}
    </v-alert>
  </div>
</template>

<script>
export default {
  name: 'Error',
  data() {
    return {
      isErrorVisible: false,
      timeout: null,
    }
  },
  computed: {
    error() {
      return this.$store.getters.error
    },
  },
  methods: {
    onDismissed() {
      this.$store.dispatch('clearError')
    },
  },
  watch: {
    isErrorVisible(value, old) {
      if (!value) {
        this.onDismissed()
      }

      if (!old && value) {
        this.timeout = setTimeout(() => {
          this.isErrorVisible = false
        }, 5000)
      }

      if (old && value && this.timeout) {
        clearTimeout(this.timeout)
      }
    },
    error(value) {
      if (value) {
        this.isErrorVisible = true
      }
    },
  },
}
</script>

<style>
.error-container {
  position: fixed;
  left: 50%;
  top: 5px;

  z-index: 1000;

  transform: translateX(-50%);
}
</style>
