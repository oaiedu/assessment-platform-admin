<template>
  <v-card outlined width="100%" height="100%" class="tests-by-week">
    <div
      class="tests-by-week-container"
      v-if="testsByWeek && testsByWeekInterval"
    >
      <h2 class="chart-title">
        {{ $t('DASHBOARD.TESTS_BY_WEEK.quizzes_weak') }}
      </h2>
      <span class="number-of-tests">
        {{ $t('DASHBOARD.TESTS_BY_WEEK.total') }}
        <span :style="{ color: colorPaleteList[colorPalete] }" class="amount">
          {{ Object.values(testsByWeek).reduce((a, b) => a + b, 0) }}
        </span>

        <v-hover
          v-if="userClaims && !userClaims['appraiser']"
          v-slot="{ hover }"
        >
          <v-btn
            text
            to="/quizzes"
            class="see-more-button pa-0 ma-0 ml-2"
            :ripple="false"
            :color="hover ? '#2196f3' : '#888888'"
          >
            {{ $t('DASHBOARD.LAST_DATA.see_more') }}
          </v-btn>
        </v-hover>
      </span>
      <div class="details-container">
        <span
          v-for="(item, index) in Object.entries(testsByWeek)"
          :key="index"
          class="week-details"
        >
          <span class="week-interval"> {{ getItemWeekInterval(item) }} </span>
          <span class="week">{{ $t('DASHBOARD.TESTS_BY_WEEK.weak') }} {{ index + 1 }}:</span>
          <span
            class="week-amount"
            :class="item[1] === higherTestsAmount ? 'highlight' : ''"
            :style="{
              color:
                item[1] === higherTestsAmount
                  ? colorPaleteList[colorPalete]
                  : '#222'
            }"
          >
            {{ item[1] }}
            <v-icon
              v-if="item[1] === higherTestsAmount"
              size="18"
              class="highlight-icon"
              :color="colorPaleteList[colorPalete]"
              >{{ mdiStarCircle }}</v-icon
            >
          </span>
        </span>
      </div>
      <div class="chart-container">
        <v-chart class="chart" :option="option" autoresize />
      </div>
    </div>
  </v-card>
</template>

<script>
import { use } from "echarts/core";
import { LineChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import {
  TooltipComponent,
  GridComponent,
  MarkLineComponent
} from "echarts/components";
import VChart, { THEME_KEY } from "vue-echarts";
import { mdiStarCircle } from "@mdi/js";

use([
  LineChart,
  TooltipComponent,
  GridComponent,
  MarkLineComponent,
  CanvasRenderer
]);

export default {
  name: "TestsByWeek",
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
      mdiStarCircle,
      colorPalete: 0,
      colorPaleteList: [
        "#48CAE4",
        "#480CA8",
        "#F72585",
        "#F48C06",
        "#FAA307",
        "#FFBA08",
        "#7400B8",
        "#6930C3",
        "#9D4EDD",
        "#FF0A54",
        "#FF0055",
        "#008000",
        "#38B000",
        "#70E000"
      ]
    };
  },
  computed: {
    userClaims() {
      return this.$store.getters.getUserClaims;
    },
    testsByWeek() {
      return this.$store.getters.getTestsByWeek;
    },
    testsByWeekInterval() {
      return this.$store.getters.getTestsByWeekInterval;
    },
    higherTestsAmount() {
      return Math.max(...Object.values(this.testsByWeek));
    },
    option() {
      return {
        ...this.chartResponsiveness,
        tooltip: {
          trigger: "axis",
          formatter: "{b}: {c}"
        },
        xAxis: {
          show: false,
          type: "category",
          data: this.testsByWeekInterval
        },
        yAxis: {
          show: false,
          type: "value"
        },
        series: [
          {
            data: Object.values(this.testsByWeek),
            type: "line",
            smooth: true,
            markLine: {
              symbol: ["none", "none"],
              label: { show: false },
              data: [
                { xAxis: 0 },
                { xAxis: 1 },
                { xAxis: 2 },
                { xAxis: 3 },
                { xAxis: 4 }
              ],
              itemStyle: {
                color: "#5555"
              },
              z: 0
            },
            emphasis: {
              scale: true,
              lineStyle: {
                width: "bolder"
              }
            },
            itemStyle: {
              color: this.colorPaleteList[this.colorPalete]
            },
            symbol: "circle",
            symbolSize: 8
          }
        ],
        markLine: [
          {
            z: 0
          }
        ]
      };
    },
    chartResponsiveness() {
      const responsiveness = {
        grid: {
          top: 84,
          bottom: 7,
          left: -30,
          right: -30
        }
      };

      if (this.windowWidth <= 960 && this.windowWidth > 500) {
        responsiveness.grid = {
          show: false,
          top: 7,
          bottom: 10,
          left: 0,
          right: 0
        };
      }

      if (this.windowWidth < 500) {
        responsiveness.grid = {
          top: 84,
          bottom: 7,
          left: -20,
          right: -20
        };
      }

      return responsiveness || {};
    }
  },
  methods: {
    getItemWeekInterval(item) {
      if (item) {
        const weekStart = `${item[0].substr(8, 2)}/${item[0].substr(5, 2)}`;
        const match = this.testsByWeekInterval.find(q => q.includes(weekStart));
        return match || "";
      }

      return "";
    }
  },
  created() {
    this.colorPalete = Math.floor(Math.random() * this.colorPaleteList.length);
  }
};
</script>

<style scoped>
.tests-by-week {
  border-radius: 26px;
  overflow: hidden;
}

.tests-by-week-container {
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

.chart-container {
  height: 100%;
  width: 100%;
}

.chart {
  height: 100%;
  width: 100%;
}

.number-of-tests {
  position: absolute;
  top: 56px;
  left: 20px;
  font-size: 1.25rem;
  color: #999;
}

.number-of-tests .amount {
  font-weight: 500;
}

.details-container {
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
  grid-auto-flow: column;
  row-gap: 20px;
  column-gap: 50px;

  position: absolute;
  top: 100px;
  left: 20px;
}

.week-details {
  display: none;
  position: relative;
}

.week {
  color: #444;
}

.week-interval {
  position: absolute;
  left: 0;
  top: 20px;

  color: #777;
  font-size: 0.8rem;
}

.week-amount {
  margin-left: 5px;
}

.week-amount.highlight {
  font-weight: 500;
}

.highlight-icon {
  position: absolute;
  right: -23px;
  top: 2px;
}

.see-more-button {
  font-size: 0.75rem;

  z-index: 5;
}

.see-more-button::before {
  background-color: transparent !important;
}

@media (max-width: 960px) {
  .week-details {
    display: block;
  }

  .chart-container {
    position: absolute;
    top: 15%;
    bottom: 5%;
    right: 20px;

    height: 80%;
    width: 60%;
  }
}

@media (max-width: 800px) {
  .chart-container {
    top: 20%;
    right: 0;

    height: 75%;
    width: 50%;
  }
}

@media (max-width: 660px) {
  .chart-container {
    top: 25%;

    height: 70%;
    width: 62%;
  }

  .week-interval {
    display: none;
  }

  .details-container {
    display: flex;
    flex-direction: column;
    gap: 3px;
    top: 100px;
  }
}

@media (max-width: 500px) {
  .chart-container {
    position: static;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    height: 100%;
    width: 100%;
  }

  .week-details {
    display: none;
  }
}
</style>
