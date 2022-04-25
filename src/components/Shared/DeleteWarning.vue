<template>
  <v-snackbar
    v-model="deleteSnackBar"
    light
    color="white"
    right
    top
    :timeout="15000"
  >
    {{ label }}
    <v-btn dark class="ml-2" color="blue" text @click="confirm">
      {{ $t("TEST.TESTS_TABLE.delete") }}
    </v-btn>
    <v-btn dark color="grey" text @click="cancel">
      {{ $t("AUTH.SUBJECT.cancel") }}
    </v-btn>
  </v-snackbar>
</template>

<script>
export default {
  name: "DeleteWarning",
  props: { label: String, state: Boolean },
  data() {
    return {
      deleteSnackBar: false
    };
  },
  methods: {
    confirm() {
      this.$emit("confirm");
    },
    cancel() {
      this.$emit("cancel");
    }
  },
  watch: {
    state(value) {
      this.deleteSnackBar = value;
    }
  }
};
</script>

<style></style>
