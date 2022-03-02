<template>
  <div class="counter__containter">
    <span v-if="days" class="mr-1">{{ days }}d</span>
    <span>{{ timeSentence }}</span>
  </div>
</template>

<script>
export default {
  name: "Counter",
  props: {
    countdown: {
      type: Boolean,
      required: false,
      default: false
    },
    static: {
      type: Boolean,
      required: false,
      default: false
    },
    time: {
      type: [Object, String],
      required: false,
      default: "00:00:00"
    },
    paused: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data() {
    return {
      interval: null,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
  },
  computed: {
    timeSentence() {
      return `${this.hours
        .toString()
        .padStart(2, 0)}:${this.minutes
        .toString()
        .padStart(2, 0)}:${this.seconds.toString().padStart(2, 0)}`;
    }
  },
  methods: {
    startCounter() {
      this.interval = setInterval(() => {
        if (
          this.countdown &&
          !this.days &&
          !this.hours &&
          !this.minutes &&
          !this.seconds
        ) {
          clearInterval(this.interval);
          this.interval = null;
          this.$emit("timeUp");
          return;
        }

        if (this.paused) {
          return;
        }

        this.updateSecond();
      }, 1000);
    },
    updateDay() {
      if (this.countdown) {
        this.days -= this.days - 1 < 0 ? 0 : 1;
        return;
      }

      this.days++;
    },
    updateHour() {
      if (this.countdown) {
        if (this.hours - 1 < 0 && this.days) {
          this.updateDay();
          this.hours = 23;
        } else {
          this.hours -= this.hours - 1 < 0 ? 0 : 1;
        }

        return;
      }

      if (this.hours + 1 > 23) {
        this.updateDay();
        this.hours = 0;
      } else {
        this.hours++;
      }
    },
    updateMinute() {
      if (this.countdown) {
        if (this.minutes - 1 < 0 && (this.days || this.hours)) {
          this.updateHour();
          this.minutes = 59;
        } else {
          this.minutes -= this.minutes - 1 < 0 ? 0 : 1;
        }

        return;
      }

      if (this.minutes + 1 > 59) {
        this.updateHour();
        this.minutes = 0;
      } else {
        this.minutes++;
      }
    },
    updateSecond() {
      if (this.countdown) {
        if (this.seconds - 1 < 0 && (this.days || this.hours || this.minutes)) {
          this.updateMinute();
          this.seconds = 59;
        } else {
          this.seconds -= this.seconds - 1 < 0 ? 0 : 1;
        }

        return;
      }

      if (this.seconds + 1 > 59) {
        this.updateMinute();
        this.seconds = 0;
      } else {
        this.seconds++;
      }
    }
  },
  mounted() {
    if (this.countdown || this.static) {
      this.days = 0;

      this.hours =
        typeof this.time === "string"
          ? +this.time.split(/:/g)[0]
          : this.time.hours;

      this.minutes =
        typeof this.time === "string"
          ? +this.time.split(/:/g)[1]
          : this.time.minutes;

      this.seconds =
        typeof this.time === "string"
          ? +this.time.split(/:/g)[2]
          : this.time.seconds;
    }

    this.startCounter();
  }
};
</script>

<style scoped>
.counter__container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
