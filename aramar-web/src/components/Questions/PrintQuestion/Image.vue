<template>
  <img :src="question.data.IMAGENS" style="height: 300px;"/>
</template>

<script>
export default {
  data() {
    return {

    }
  },
  props: ["question"]
}
</script>
