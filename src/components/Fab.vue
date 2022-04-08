<template>
  <v-speed-dial
    fixed
    bottom
    right
    v-model="fab"
    direction="top"
    transition="slide-y-reverse-transition"
  >
    <template v-slot:activator>
      <v-tooltip left>
        <template v-slot:activator="{ on }">
          <v-btn v-model="fab" color="blue" v-on="on" dark fab>
            <v-icon v-if="fab">{{ closeIcon }}</v-icon>
            <v-icon v-else>{{ plusIcon }}</v-icon>
          </v-btn>
        </template>
        <span v-if="fab">{{ $t('FAB.TEXT.close') }}</span>
        <span v-else>{{ $t('FAB.TEXT.create') }}</span>
      </v-tooltip>
    </template>

    <v-tooltip
      left
      v-if="userClaims && (userClaims['appraiser'] || userClaims['admin'])"
    >
      <template v-slot:activator="{ on }">
        <v-btn fab dark small v-on="on" @click="toQuestions" color="blue">
          <v-icon>{{ fileQuestionIcon }}</v-icon>
        </v-btn>
      </template>
      <span>{{ $t('FAB.CREATE.new_question') }}</span>
    </v-tooltip>

    <v-tooltip left v-if="userClaims && userClaims['admin']">
      <template v-slot:activator="{ on }">
        <v-btn fab dark small v-on="on" @click="toTests" color="blue">
          <v-icon>{{ fileMultipleIcon }}</v-icon>
        </v-btn>
      </template>
      <span>{{ $t('FAB.CREATE.new_quiz') }}</span>
    </v-tooltip>
  </v-speed-dial>
</template>

<script>
import {
  mdiPlus,
  mdiClose,
  mdiFileQuestionOutline,
  mdiFileMultipleOutline
} from "@mdi/js";

export default {
  props: ["userClaims"],
  data() {
    return {
      fab: false,
      plusIcon: mdiPlus,
      closeIcon: mdiClose,
      fileQuestionIcon: mdiFileQuestionOutline,
      fileMultipleIcon: mdiFileMultipleOutline
    };
  },
  methods: {
    toQuestions() {
      this.$router.push("/questions");
    },
    toTests() {
      this.$router.push("/quizzes");
    }
  }
};
</script>
