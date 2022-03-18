<template>
  <div>
    <v-row
      v-for="(item, index) in answers"
      class="answer-block pa-0 ma-0"
      :key="index"
    >
      <span>
        <strong class="mr-1">{{ letters[index] }}</strong>
        {{ item.text }}
      </span>
    </v-row>

    <h4 class="pa-0 ma-0 mt-8 mb-2">Justificativas</h4>

    <v-row
      v-for="(item, index) in answers"
      class="answer-block pa-0 ma-0"
      :key="item.ansId + index"
    >
      <span>
        <strong class="mr-1">{{ letters[index] }}</strong>
        {{ item.description }}
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
