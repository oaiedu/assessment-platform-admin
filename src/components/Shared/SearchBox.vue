<template>
  <v-text-field
    v-model="search"
    clearable
    rounded
    dense
    single-line
    outlined
    hide-details
    id="searchField"
    :append-icon="mdiMagnify"
    :label="label"
    @keydown="keydown($event)"
  ></v-text-field>
</template>

<script>
import { mdiMagnify } from "@mdi/js";

export default {
  name: "SearchBox",
  props: { label: String },
  data() {
    return {
      mdiMagnify,
      search: ""
    };
  },
  methods: {
    keydown(event) {
      if (event.key === "Enter") {
        document.getElementById("searchField").blur();
        this.$emit("enter", this.search);
      }
    }
  },
  watch: {
    search(text) {
      this.$emit("textChange", text);
    }
  }
};
</script>
