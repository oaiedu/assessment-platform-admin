<template>
  <div>
    <v-row
      v-for="(item, index) in answers"
      :key="index"
      class="answer-block pa-0 ma-0"
    >
      <span>
        <strong class="mr-1">{{ letters[index] }}</strong>
        {{ item.text }}
      </span>
    </v-row>
  </div>
</template>

<script>
export default {
  name: "Answers",
  props: ["answers"],
  data() {
    return {
      letters: ["A. ", "B. ", "C. ", "D. "]
    };
  }
};
</script>

<style>
.answer-block {
  display: flex;
  flex-wrap: wrap;
}
</style>
