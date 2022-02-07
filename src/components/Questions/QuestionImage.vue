<template>
  <div class="img-container mb-5">
    <v-container v-if="imageSize === '1x'">
      <img :src="image" style="max-height: 40vh; max-width: 40vw" />
    </v-container>

    <v-container v-else-if="imageSize === '2x'">
      <img :src="image" style="max-height: 50vh; max-width: 50vw" />
    </v-container>

    <v-container v-else-if="imageSize === '3x'">
      <img :src="image" style="max-height: 60vh; max-width: 60vw" />
    </v-container>

    <v-container v-if="!imageSize">
      <img :src="image" style="max-height: 50vh; max-width: 50vw" />
    </v-container>
  </div>
</template>

<script>
export default {
  name: "QuestionImage",
  props: ["image", "imageSize"]
};
</script>

<style>
@media print {
  .img-container {
    text-align: center !important;
  }
}
</style>
