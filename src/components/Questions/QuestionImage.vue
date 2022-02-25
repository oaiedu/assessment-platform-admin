<template>
  <div class="img-container mb-5">
    <link rel="preload" as="image" :href="image" />

    <v-container v-if="!imageSize || imageSize === '1x'">
      <img :src="image" style="max-height: 40%; max-width: 40%" />
    </v-container>

    <v-container v-else-if="imageSize === '2x'">
      <img :src="image" style="max-height: 50%; max-width: 50%" />
    </v-container>

    <v-container v-else-if="imageSize === '3x'">
      <img :src="image" style="max-height: 60%; max-width: 60%" />
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
