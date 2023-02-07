<template>
  <div class="paginator">
    <v-container>
      <v-row justify="center">
        <v-btn
          color="white"
          width="35px"
          min-width="0"
          height="35px"
          :ripple="false"
          :outlined="page > 1 && !disabled"
          :disabled="page === 1 || disabled"
          :style="{
            border: page > 1 && !disabled ? '1px solid #2196f3' : 'none',
            'border-radius': '50%',
          }"
          @click="toFirst()"
        >
          <v-icon color="blue">{{ mdiChevronDoubleLeft }}</v-icon>
        </v-btn>

        <v-btn
          color="white"
          width="35px"
          min-width="0"
          height="35px"
          class="ml-3"
          :ripple="false"
          :outlined="page > 1 && !disabled"
          :disabled="page === 1 || disabled"
          :style="{
            border: page > 1 && !disabled ? '1px solid #2196f3' : 'none',
            'border-radius': '50%',
          }"
          @click="onPrevious()"
        >
          <v-icon color="blue">{{ mdiChevronLeft }}</v-icon>
        </v-btn>

        <v-btn
          dark
          color="blue"
          width="35px"
          min-width="0"
          height="35px"
          class="ml-3 page-button"
          style="border-radius: 50%"
          :ripple="false"
        >
          {{ page }}
        </v-btn>

        <v-btn
          color="white"
          width="35px"
          min-width="0"
          height="35px"
          class="ml-3"
          :ripple="false"
          :outlined="page < length && !disabled"
          :disabled="page === length || disabled"
          :style="{
            border: page < length && !disabled ? '1px solid #2196f3' : 'none',
            'border-radius': '50%',
          }"
          @click="onNext()"
        >
          <v-icon color="blue">{{ mdiChevronRight }}</v-icon>
        </v-btn>

        <v-btn
          color="white"
          width="35px"
          min-width="0"
          height="35px"
          class="ml-3"
          :ripple="false"
          :outlined="page < length && !disabled"
          :disabled="page === length || disabled"
          :style="{
            border: page < length && !disabled ? '1px solid #2196f3' : 'none',
            'border-radius': '50%',
          }"
          @click="toLast()"
        >
          <v-icon color="blue">{{ mdiChevronDoubleRight }}</v-icon>
        </v-btn>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import {
  mdiChevronDoubleRight,
  mdiChevronDoubleLeft,
  mdiChevronRight,
  mdiChevronLeft,
} from '@mdi/js'

export default {
  name: 'Paginator',
  props: {
    page: Number,
    length: Number,
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      mdiChevronLeft,
      mdiChevronRight,
      mdiChevronDoubleLeft,
      mdiChevronDoubleRight,
    }
  },
  methods: {
    onNext() {
      const next = this.page + 1
      this.$emit(
        'pageChange',
        next > this.length
          ? { page: this.length, mode: 'last' }
          : { page: next, direction: 'forward' },
      )
    },
    onPrevious() {
      const previous = this.page - 1
      this.$emit(
        'pageChange',
        previous < 1
          ? { page: 1, mode: 'first' }
          : { page: previous, direction: 'backward' },
      )
    },
    toFirst() {
      this.$emit('pageChange', { page: 1, mode: 'first' })
    },
    toLast() {
      this.$emit('pageChange', { page: this.length, mode: 'last' })
    },
  },
}
</script>

<style>
button.page-button {
  font-size: 1rem !important;
}

.paginator button.v-btn {
  font-weight: 400 !important;
}
</style>
