<template>
  <v-app>
    <component v-bind:is="layout"></component>
  </v-app>
</template>

<script>
import ToolbarLayout from "./layouts/ToolbarLayout";
import Error from "./components/Error";
import Success from "./components/Success";

export default {
  computed: {
    layout() {
      return this.$store.getters.getLayout;
    }
  },
  components: {
    Error,
    Success,
    "toolbar-layout": ToolbarLayout
    // define as many layouts you want for the application
  }
};
</script>

<style>
* {
  font-family: Poppins;
}

@font-face {
  font-family: "Poppins";
  src: url("~@/assets/fonts/poppins/Poppins-Light.ttf") format("truetype");
  font-weight: 300;
  font-display: swap;
}

@font-face {
  font-family: "Poppins";
  src: url("~@/assets/fonts/poppins/Poppins-Regular.ttf") format("truetype");
  font-weight: normal;
  font-display: swap;
}

@font-face {
  font-family: "Poppins";
  src: url("~@/assets/fonts/poppins/Poppins-Medium.ttf") format("truetype");
  font-weight: 500;
  font-display: swap;
}

@font-face {
  font-family: "Poppins";
  src: url("~@/assets/fonts/poppins/Poppins-SemiBold.ttf") format("truetype");
  font-weight: 600;
  font-display: swap;
}

@font-face {
  font-family: "Poppins";
  src: url("~@/assets/fonts/poppins/Poppins-Bold.ttf") format("truetype");
  font-weight: bold;
  font-display: swap;
}
</style>
