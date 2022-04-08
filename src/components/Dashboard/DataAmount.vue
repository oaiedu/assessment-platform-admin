<template>
  <v-card outlined width="100%" height="100%" class="data-amount">
    <div class="data-amount-container" v-if="dataSize">
      <div class="user-amount details">
        <div class="icon-container">
          <v-icon size="30" color="#2F80ED">{{ mdiAccount }}</v-icon>
        </div>
        <div class="amount-info">
          <span class="amount">{{ dataSize.users }}</span>
          <span class="type">{{ $t('DASHBOARD.DATA_AMOUNT.users') }}</span>
        </div>
      </div>
      <div class="question-amount details">
        <div class="icon-container">
          <v-icon size="26" color="#219653">{{
            mdiFileQuestionOutline
          }}</v-icon>
        </div>
        <div class="amount-info">
          <span class="amount">{{ dataSize.questions.general }}</span>
          <span class="type">{{ $t('TEST.QUIZ.questions') }}</span>
        </div>
      </div>
      <div class="subject-amount details">
        <div class="icon-container">
          <v-icon size="26" color="#FF5599">{{ mdiBallot }}</v-icon>
        </div>
        <div class="amount-info">
          <span class="amount">{{ subjectsAmount }}</span>
          <span class="type">{{ $t('TEST.QUIZ.subjects') }}</span>
        </div>
      </div>
      <div class="test-amount details">
        <div class="icon-container">
          <v-icon size="26" color="#9455FA">{{
            mdiFileMultipleOutline
          }}</v-icon>
        </div>
        <div class="amount-info">
          <span class="amount">{{ dataSize.tests }}</span>
          <span class="type">{{ $t('TEST.QUIZ.quizzes') }}</span>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script>
import {
  mdiAccount,
  mdiFileQuestionOutline,
  mdiBallot,
  mdiFileMultipleOutline
} from "@mdi/js";

export default {
  name: "DataAmount",
  data() {
    return {
      mdiAccount,
      mdiFileQuestionOutline,
      mdiBallot,
      mdiFileMultipleOutline
    };
  },
  computed: {
    dataSize() {
      return this.$store.getters.getDataSize;
    },
    subjectsAmount() {
      return this.$store.state.Subject.subjects.length;
    }
  }
};
</script>

<style scoped>
.data-amount {
  border-radius: 26px;
  overflow: hidden;
}

.data-amount-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  height: 100%;
  width: 100%;

  padding: 20px;
}

.details {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.icon-container {
  display: flex;
  justify-content: center;
  align-items: center;

  height: 50px;
  width: 50px;

  border-radius: 50px;

  animation: animate-icon 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.user-amount > .icon-container {
  background-color: #2f80ed33;
}

.question-amount > .icon-container {
  background-color: #21965333;
}

.subject-amount > .icon-container {
  background-color: #ff559933;
}

.test-amount > .icon-container {
  background-color: #9455fa33;
}

.data-amount-container .amount-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.data-amount-container .amount-info > span.amount {
  color: #555;
  font-weight: bold;
  font-size: 1.2rem;
  line-height: 1.4rem;
}

.data-amount-container .amount-info > span.type {
  line-height: 1.4rem;
}

@keyframes animate-icon {
  from {
    transform: rotateY(360deg);
  }
  to {
    transform: rotateY(0deg);
  }
}

@media (max-width: 1200px) {
  .details {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }

  .data-amount-container .amount-info {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 5px;
  }

  .icon-container {
    height: 40px;
    width: 40px;
  }
}

@media (max-width: 1070px) {
  .details {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }

  .data-amount-container {
    display: grid;
    grid-template-columns: 1fr 0.8fr;
    grid-template-rows: 1fr 1fr;
    row-gap: 6px;
    column-gap: 10px;

    height: 100%;
    width: 100%;

    padding: 10px 20px;
  }
}

@media (max-width: 760px) {
  .data-amount-container {
    display: flex;
    justify-content: space-between;
    gap: 5px;

    height: 100%;
    width: 100%;

    padding: 20px;
  }

  .data-amount-container .amount-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
  }
}

@media (max-width: 660px) {
  .data-amount-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    row-gap: 6px;
    column-gap: 10px;

    height: 100%;
    width: 100%;

    padding: 10px 20px;
  }

  .data-amount-container .amount-info {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 5px;
  }
}

@media (max-width: 400px) {
  .details {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }

  .data-amount-container {
    row-gap: 15px;
  }

  .data-amount-container .amount-info {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 5px;
  }
}
</style>
