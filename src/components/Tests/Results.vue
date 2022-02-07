<template>
  <div class="exam-results-container">
    <div class="grade-container">
      <div
        class="donut"
        :style="{
          background: `conic-gradient(
              from 0deg at 50% 50%,
              ${color} 0%,
              ${color} ${gradePercentage}%,
              ${color}20 ${gradePercentage}%,
              ${color}20 100%
            )`
        }"
      >
        <span class="grade">{{ grade }} / 10</span>
      </div>

      <div class="subject-container">
        <div v-for="subject in answersBySubject" :key="subject.name">
          <span :style="{ color }">• {{ subject.name }}</span>
          <span class="subject-grade">
            - {{ subject.grade }} ({{ subject.correctAnswers }} /
            {{ subject.answersAmount }})
          </span>
        </div>
      </div>
    </div>

    <v-btn text class="review-button" color="blue" @click="review()">
      Revisar prova
    </v-btn>
  </div>
</template>

<script>
export default {
  name: "Results",
  props: {
    questions: {
      type: Array,
      required: false,
      default: () => []
    },
    answers: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  data() {
    return {
      grade: "0",
      gradePercentage: 0
    };
  },
  computed: {
    color() {
      return +this.grade >= 10
        ? "#42D662"
        : this.grade >= 8
        ? "#1e88e5"
        : this.grade >= 5
        ? "#edab00"
        : "#ff4141";
    },
    checkedAnswers() {
      return this.answers.map(answer => {
        const question = this.questions.find(
          q => q.name === answer.questionName
        );

        if (!question) {
          return false;
        }

        const ansObj = question.answers.find(ans => ans.ansId === answer.value);
        return ansObj ? ansObj.value : false;
      });
    },
    answersBySubject() {
      const subjectAnswers = [];

      this.answers.forEach(answer => {
        const question = this.questions.find(
          q => q.name === answer.questionName
        );

        const ans = question.answers.find(a => a.ansId === answer.value);

        const index = subjectAnswers.findIndex(
          s => s.name === question.subject
        );

        if (index === -1) {
          subjectAnswers.push({
            name: question.subject,
            correctAnswers: 0,
            answersAmount: 0,
            grade: "0"
          });
        }

        const newIndex = index !== -1 ? index : subjectAnswers.length - 1;

        subjectAnswers[newIndex].correctAnswers += ans.value ? 1 : 0;

        subjectAnswers[newIndex].answersAmount += 1;

        subjectAnswers[newIndex].grade = (
          (subjectAnswers[newIndex].correctAnswers * 10) /
          this.answers.length
        ).toFixed(2);
      });

      return subjectAnswers;
    }
  },
  methods: {
    setGrade() {
      const correctAns = this.checkedAnswers.reduce(
        (prev, curr) => (curr ? prev + 1 : prev),
        0
      );

      const grade = (correctAns * 10) / this.answers.length;

      const length = grade.toString().length;

      this.grade = grade.toFixed(length <= 2 ? 0 : length < 4 ? 1 : 2);
      this.gradePercentage = grade * 10;
    },
    review() {
      this.$emit("review");
    }
  },
  mounted() {
    this.setGrade();
  }
};
</script>

<style scoped>
.exam-results-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;

  width: 100%;
  min-height: calc(100vh - 97px);

  padding: 0 32px;
}

.grade-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 60px;
  flex: 1;

  width: 100%;
}

.donut {
  position: relative;

  width: 220px;
  height: 220px;

  border-radius: 50%;

  transition: background-color 1s ease;
}

.donut::before {
  content: "";

  position: absolute;
  top: 50%;
  left: 50%;

  width: 80%;
  height: 80%;

  border-radius: 50%;
  background-color: #fff;

  transform: translate(-50%, -50%);
}

.grade {
  position: absolute;
  top: 50%;
  left: 50%;

  width: 80%;

  text-align: center;
  font-weight: medium;
  font-size: 2.4rem;
  color: #5d5d5d;

  transform: translate(-50%, -50%);
}

.subject-container {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  gap: 5px;

  height: 90%;
}

.subject-container span {
  font-size: 1.5rem;
  font-weight: 700;
}

.subject-container .subject-grade {
  font-weight: normal;
  color: #2d2d2d;
}

.review-button {
  font-size: 1rem;

  margin-bottom: 140px;
}
</style>
