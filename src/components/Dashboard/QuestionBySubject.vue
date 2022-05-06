<template>
  <v-card outlined width="100%" height="100%" class="question-by-subject">
    <div class="question-by-subject-container">
      <h2 class="chart-title">
        {{ $t("DASHBOARD.QUESTION_BY_SUBJECT.questions_subject") }}

        <v-hover v-if="userClaims && !userClaims['student']" v-slot="{ hover }">
          <v-btn
            text
            to="/questions"
            class="see-more-button pa-0 ma-0 ml-2"
            :ripple="false"
            :color="hover ? '#2196f3' : '#888888'"
          >
            {{ $t("DASHBOARD.LAST_DATA.see_more") }}
          </v-btn>
        </v-hover>
      </h2>
      <div class="subject-list">
        <span
          v-if="!chartData || chartData.length === 0"
          class="subject-item"
          style="margin-left: -12px"
        >
          {{ $t("DASHBOARD.QUESTION_BY_SUBJECT.no_data") }}
        </span>
        <span
          v-for="(item, index) in sortedChartData"
          :key="index"
          class="subject-item"
        >
          <div
            class="list-circle-dot"
            :style="{
              backgroundColor:
                colorPaleteList[colorPalete][
                  colorPaleteList[colorPalete].length - index - 1
                ]
            }"
          ></div>
          <span class="subject-name">{{ item.name }}</span>
          <span class="item-percentage">
            - {{ ((item.value * 100) / numberOfQuestions).toFixed(0) }}%</span
          >
        </span>
      </div>
      <v-chart
        v-if="questionsBySubject"
        autoresize
        class="chart"
        :option="option"
      />
    </div>
  </v-card>
</template>

<script>
import { use } from "echarts/core";
import { PieChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import { TooltipComponent } from "echarts/components";
import VChart, { THEME_KEY } from "vue-echarts";

use([PieChart, TooltipComponent, CanvasRenderer]);

export default {
  name: "QuestionBySubject",
  components: {
    VChart
  },
  provide: {
    [THEME_KEY]: "light"
  },
  props: {
    windowWidth: Number
  },
  data() {
    return {
      colorPalete: 0,
      colorPaleteList: [
        ["#023E8A", "#0077B6", "#0096C7", "#00B4D8", "#48CAE4"],
        ["#480CA8", "#560BAD", "#7209B7", "#B5179E", "#F72585"],
        ["#34A0A4", "#52B69A", "#76C893", "#99D98C", "#B5E48C"],
        ["#DC2F02", "#E85D04", "#F48C06", "#FAA307", "#FFBA08"],
        ["#7400B8", "#6930C3", "#5E60CE", "#5390D9", "#4EA8DE"],
        ["#240046", "#3C096C", "#5A189A", "#7B2CBF", "#9D4EDD"],
        ["#FF0A54", "#FF477E", "#FF5C8A", "#FF7096", "#FF85A1"],
        ["#602437", "#8A2846", "#B9375E", "#E05780", "#FF7AA2"],
        ["#006400", "#007200", "#008000", "#38B000", "#70E000"]
      ]
    };
  },
  computed: {
    sortedChartData() {
      return [...this.chartData].sort((a, b) => (a.value - b.value) * -1);
    },
    userClaims() {
      return this.$store.getters.getUserClaims;
    },
    option() {
      return {
        tooltip: {
          trigger: "item"
        },
        series: [
          {
            ...this.chartResponsiveness,
            name: "",
            type: "pie",
            data: this.chartData,
            roseType: "radius",
            itemStyle: {
              shadowBlur: 20,
              shadowColor: "rgba(0, 0, 0, 0.2)"
            },
            color: this.colorPaleteList[this.colorPalete],
            animationType: "scale",
            animationEasing: "elasticOut",
            animationDelay: idx => {
              return Math.random() * 200;
            }
          }
        ]
      };
    },
    chartResponsiveness() {
      const setResponsiveness = (
        radius = "70%",
        center = ["80%", "60%"],
        label = { show: true, color: "#333a" },
        labelLine = { show: true, smooth: 0.2, lineStyle: { opacity: 0.3 } }
      ) => {
        return { radius, center, label, labelLine };
      };

      let responsiveness = setResponsiveness(
        "70%",
        ["80%", "60%"],
        { show: false },
        { show: false }
      );

      if (this.windowWidth <= 1000) {
        responsiveness = setResponsiveness("70%", ["50%", "50%"]);
      }

      if (this.windowWidth <= 960) {
        responsiveness = setResponsiveness("70%", ["65%", "50%"]);
      }

      if (this.windowWidth <= 900) {
        responsiveness = setResponsiveness("70%", ["60%", "50%"]);
      }

      if (this.windowWidth <= 800) {
        responsiveness = setResponsiveness("70%", ["65%", "50%"]);
      }

      if (this.windowWidth <= 700) {
        responsiveness = setResponsiveness(
          "80%",
          ["75%", "50%"],
          { show: false },
          { show: false }
        );
      }

      if (this.windowWidth <= 600) {
        responsiveness = setResponsiveness(
          "70%",
          ["80%", "60%"],
          { show: false },
          { show: false }
        );
      }

      if (this.windowWidth <= 460) {
        responsiveness = setResponsiveness("70%", ["50%", "60%"]);
      }

      if (this.windowWidth <= 400) {
        responsiveness = setResponsiveness(
          "80%",
          ["50%", "50%"],
          { show: false },
          { show: false }
        );
      }

      return responsiveness;
    },
    chartData() {
      const data = [];

      data.push(...this.questionsBySubject.slice(0, 4));

      const others = this.questionsBySubject
        .slice(4)
        .map(subject => subject.value)
        .reduce((a, b) => a + b, 0);

      if (others) {
        data.push({
          name: this.$t("DASHBOARD.QUESTION_BY_SUBJECT.others"),
          value: others
        });
      }

      data.sort((a, b) => a.value - b.value);

      return data;
    },
    questionsBySubject() {
      const statistics = [];
      const subjects = this.$store.state.Subject.subjects;

      subjects.forEach(element => {
        const numberOfQuestions = this.$store.getters.getNumberOfQuestionBySubject(
          element.name
        );

        if (numberOfQuestions) {
          statistics.push({ name: element.name, value: numberOfQuestions });
        }
      });

      return statistics.sort((a, b) => (a.value - b.value) * -1);
    },
    numberOfQuestions() {
      return this.$store.getters.getDataSize.questions.general;
    }
  },
  created() {
    this.colorPalete = Math.floor(Math.random() * this.colorPaleteList.length);
  }
};
</script>

<style scoped>
.question-by-subject {
  border-radius: 26px;
  overflow: visible;
}

.question-by-subject-container {
  position: relative;

  height: 100%;
  width: 100%;

  padding: 20px;
}

.chart-title {
  position: absolute;
  top: 20px;
  left: 20px;

  z-index: 5;

  color: #555;
  font-size: 1.2rem;
  font-weight: 500;
}

.chart {
  height: 200px;
  width: 100%;
}

.subject-list {
  display: flex;
  flex-direction: column;

  position: absolute;
  top: 30%;
  left: 35px;

  width: 50%;
}

.subject-item {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;

  position: relative;

  width: 100%;

  color: #555;
  font-size: 0.85rem;
  font-weight: 400;
  line-height: 1.6rem;
}

.subject-item .subject-name {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;

  max-width: 100%;

  text-overflow: ellipsis;
  overflow: hidden;
}

.list-circle-dot {
  position: absolute;
  left: -15px;
  top: 50%;

  height: 7px;
  width: 7px;

  border-radius: 10px;

  transform: translateY(-50%);
}

.item-percentage {
  display: none;

  margin-left: 4px;
}

.see-more-button {
  font-size: 0.75rem;
}

.see-more-button::before {
  background: transparent;
}

@media (max-width: 1000px) {
  .chart-title {
    position: static;
    margin-bottom: 10px;
  }

  .subject-list {
    display: none;
  }
}

@media (max-width: 960px) {
  .chart-title {
    position: absolute;
    margin-bottom: 0;
  }

  .chart {
    height: 210px;
  }

  .subject-list {
    display: flex;
  }

  .subject-item .subject-name {
    max-width: 60%;
  }

  .item-percentage {
    display: inline;
  }
}

@media (max-width: 550px) {
  .subject-item .subject-name {
    max-width: 100%;
  }

  .item-percentage {
    display: none;
  }
}

@media (max-width: 460px) {
  .subject-list {
    display: none;
  }
}

@media (max-width: 400px) {
  .chart-title {
    position: static;
    margin-bottom: 10px;
  }

  .subject-list {
    display: flex;
    position: static;

    margin-left: 16px;

    width: 100%;
  }
}
</style>
