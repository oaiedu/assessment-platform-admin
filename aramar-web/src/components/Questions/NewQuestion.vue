<template>
  <Stepper  @closeDialogNew="close"></Stepper>
</template>

<script>
export default {
  name: 'new-questions',
  methods: {
    close() {
      this.$emit("closeDialogNew");
    }
  }
}
</script>

