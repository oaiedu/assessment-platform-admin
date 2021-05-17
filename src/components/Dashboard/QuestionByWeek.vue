<template>
    <v-card width="100%" height="100%" class="question-by-week">
        <div class="question-by-week-container" v-if="questionsByWeek && questionsByWeekInterval">
            <h2 class="chart-title">Questões por semana</h2>
            <span class="number-of-questions">
                Total:
                <span
                    :style="{ color: colorPaleteList[colorPalete] }"
                    class="amount">
                    {{ Object.values(questionsByWeek).reduce((a, b) => a + b, 0) }}
                </span>
            </span>
            <div class="details-container">
                <span
                    v-for="(item, index) in Object.entries(questionsByWeek)"
                    :key="index"
                    class="week-details" >
                    <span class="week-interval"> {{ getItemWeekInterval(item) }} </span>
                    <span class="week">Semana {{ index + 1 }}:</span>
                    <span class="week-amount"
                        :class="item[1] === higherQuestionsAmount ? 'highlight' : ''"
                        :style="{ color: item[1] === higherQuestionsAmount ? colorPaleteList[colorPalete] : '#222' }" >
                        {{ item[1] }}
                        <v-icon
                            v-if="item[1] === higherQuestionsAmount"
                            size="18"
                            class="highlight-icon"
                            :color="colorPaleteList[colorPalete]" >{{ mdiStarCircle }}</v-icon>
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
    import { LineChart } from 'echarts/charts';
    import { CanvasRenderer } from 'echarts/renderers';
    import {
        TooltipComponent,
        GridComponent,
        MarkLineComponent
    } from 'echarts/components';
    import VChart, { THEME_KEY } from 'vue-echarts';
    import { mdiStarCircle } from '@mdi/js';

    use([
        LineChart,
        TooltipComponent,
        GridComponent,
        MarkLineComponent,
        CanvasRenderer,
    ]);

    export default {
        name: 'QuestionByWeek',
        components: {
            VChart
        },
        provide: {
            [THEME_KEY]: 'light'
        },
        props: {
            windowWidth: Number
        },
        data() {
            return {
                mdiStarCircle,
                colorPalete: 0,
                colorPaleteList: [
                    '#48CAE4', '#480CA8', '#F72585',
                    '#F48C06', '#FAA307', '#FFBA08',
                    '#7400B8', '#6930C3', '#9D4EDD',
                    '#FF0A54', '#FF0055', '#008000',
                    '#38B000', '#70E000'
                ]
            }
        },
        computed: {
            questionsByWeek() {
                return this.$store.getters.getQuestionsByWeek;
            },
            questionsByWeekInterval() {
                return this.$store.getters.getQuestionsByWeekInterval;
            },
            higherQuestionsAmount() {
                return Math.max(...Object.values(this.questionsByWeek));
            },
            option() {
                return {
                    ...this.chartResponsiveness,
                    tooltip: {
                        trigger: 'axis',
                        formatter: "{b}: {c}"
                    },
                    xAxis: {
                        show: false,
                        type: 'category',
                        data: this.questionsByWeekInterval
                    },
                    yAxis: {
                        show: false,
                        type: 'value'
                    },
                    series: [{
                        data: Object.values(this.questionsByWeek),
                        type: 'line',
                        smooth: true,
                        markLine: {
                            symbol: ['none', 'none'],
                            label: {show: false},
                            data: [
                                {xAxis: 0},
                                {xAxis: 1},
                                {xAxis: 2},
                                {xAxis: 3},
                                {xAxis: 4}
                            ],
                            itemStyle: {
                                color: '#5555'
                            },
                            z: 0
                        },
                        emphasis: {
                            scale: true,
                            lineStyle: {
                                width: 'bolder'
                            }
                        },
                        itemStyle: {
                            color: this.colorPaleteList[this.colorPalete]
                        },
                        symbol: 'circle',
                        symbolSize: 8
                    }],
                    markLine: [{
                        z: 0
                    }]
                }
            },
            chartResponsiveness() {
                const responsiveness = {
                    grid: {
                        top: 84,
                        bottom: 7,
                        left: -35,
                        right: -35
                    }
                }

                if (this.windowWidth <= 960 && this.windowWidth > 500) {
                    responsiveness.grid = {
                        show: false,
                        top: 7,
                        bottom: 10,
                        left: 0,
                        right: 0
                    }
                }

                if (this.windowWidth < 500) {
                    responsiveness.grid = {
                        top: 84,
                        bottom: 7,
                        left: -20,
                        right: -20
                    }
                }

                return responsiveness || {};
            }
        },
        methods: {
            getItemWeekInterval(item) {
                if (item) {
                    const weekStart = `${item[0].substr(8, 2)}/${item[0].substr(5, 2)}`;
                    const match = this.questionsByWeekInterval.find(q => q.includes(weekStart));
                    return match || '';
                }

                return '';
            }
        },
        created() {
            this.colorPalete = Math.floor(Math.random() * this.colorPaleteList.length);
        }
    }
</script>

<style scoped>
    .question-by-week-container {
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

    .number-of-questions {
        position: absolute;
        top: 56px;
        left: 20px;
        font-size: 1.25rem;
        color: #999;
    }

    .number-of-questions .amount {
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
