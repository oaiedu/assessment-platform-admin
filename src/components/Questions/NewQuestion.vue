<template>
  <Stepper  @closeDialogNew="close" @load="load()"></Stepper>
</template>

<script>
export default {
  name: 'new-questions',
  methods: {
    close() {
      this.$emit("closeDialogNew");
    },
    load() {
      this.$emit("load")
    }
  }
}
</script>
