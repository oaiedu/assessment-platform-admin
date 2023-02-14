import { Store } from 'vuex'

import { createErrorLog, showErrorMessage } from '../../utils/errors'
import { getWeekInterval, isoToDate, sortWeekIntervals } from '../../utils/date'
import { DataSizeController } from '../../controllers/data-size.controller'
import { DataSizeEntity } from '../../entities/data-size.entity'

/**
 * @typedef {Object} DataSizeState
 * @property {DataSizeEntity|null} dataSize - The data size object.
 */

/**
 * @typedef {import("../../entities/data-size.entity").Amount} Amount
 */

/**
 * @typedef {import('./tests.store.js').Test} Test
 */

/**
 * Defines the data size controller.
 */
const controller = new DataSizeController()

/**
 * Gets the initial state for data size store.
 *
 * @returns {DataSizeState} The initial data size state object.
 */
const initialState = () => ({
  dataSize: null,
})

const state = initialState()

const mutations = {
  /**
   * Sets the data size object.
   *
   * @param {DataSizeState} state The data size state.
   * @param {DataSizeEntity?} data The data size object.
   */
  setDataSize(state, data) {
    state.dataSize = data ? data.clone() : null
  },
  /**
   * Sets a data to a determined key in data size.
   *
   * @param {DataSizeState} state The data size state.
   * @param {{ key: keyof DataSizeEntity, data: Amount|number }} data Object with the data size key and data to be set.
   */
  addRemoveSize(state, data) {
    state.dataSize[data.key] = data.data
  },
  /**
   * Resets tha data size state to it's initial state.
   *
   * @param {DataSizeState} state The data size state.
   */
  RESETDataSize(state) {
    const newState = initialState()
    Object.keys(newState).forEach(key => {
      state[key] = newState[key]
    })
  },
}

const actions = {
  /**
   * Loads the data size from Firebase.
   *
   * @param {Store<DataSizeState>} store - The vuex store.
   */
  async loadDataSize({ commit }) {
    commit('setLoading', true)

    /**
     * @type {DataSizeEntity}
     */
    let data

    try {
      data = await controller.getOne()
      commit('setDataSize', data)
    } catch (error) {
      createErrorLog('Data Size Load', error.message, { data })

      const errorModel = showErrorMessage('load', 'Data Size', error.message)
      commit('setError', { message: errorModel })
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Adds one to data size tests by week key into the current week.
   *
   * @param {Store<DataSizeState>} store - The vuex store.
   */
  addTestsByWeek({ commit, state }) {
    const currentWeek = getWeekInterval()[0]

    /**
     * @type {Record<string, number>}
     */
    let data = { ...state.dataSize.testsByWeek }

    const lastWeeks = Object.keys(data)

    if (lastWeeks.includes(currentWeek)) {
      data[currentWeek] += 1
    } else {
      const newData = {}

      for (let i = 5 - 1; i > 0; i--) {
        const weekDate = new Date()
        weekDate.setDate(weekDate.getDate() - i * 7)

        const week = getWeekInterval(weekDate)[0]
        newData[week] = data[week] ?? 0
      }

      data = { ...newData, [currentWeek]: 1 }
    }

    try {
      controller.updateOne({ testsByWeek: data })

      commit('addRemoveSize', { key: 'testsByWeek', data })
    } catch (error) {
      createErrorLog('Data Size Update', error.message, { data })

      const errorModel = showErrorMessage('edition', 'Data Size', error.message)

      commit('setError', { message: errorModel })
    }
  },
  /**
   * Removes of data size tests by week key according to the tests into the given payload.
   *
   * @param {Store<DataSizeState>} store The vuex store.
   * @param {Object} payload The payload of the action.
   * @param {Test[]} payload.tests The tests that will be removed.
   */
  async removeTestsByWeek({ commit, state }, payload) {
    const { tests: quizzes } = payload

    /**
     * @type {Record<string, number>}
     */
    const data = { ...state.dataSize.testsByWeek }

    const lastWeeks = Object.keys(data)

    quizzes.forEach(test => {
      const date = isoToDate(test.created)
      const week = getWeekInterval(date)[0]

      if (lastWeeks.includes(week)) {
        data[week] -= data[week] - 1 < 0 ? 0 : 1
      }
    })

    try {
      controller.updateOne({ testsByWeek: data })

      commit('addRemoveSize', { key: 'testsByWeek', data })
    } catch (error) {
      createErrorLog('Data Size Update', error.message, { data })

      const errorModel = showErrorMessage('edition', 'Data Size', error.message)

      commit('setError', { message: errorModel })
    }
  },
  /**
   * Resets the data size state.
   *
   * @param {Store<DataSizeState>} store - The vuex store.
   */
  resetDataSize({ commit }) {
    commit('RESETDataSize')
  },
}

const getters = {
  /**
   * Gets the data size from state.
   *
   * @param {DataSizeState} state - The data size state.
   * @returns {DataSize} The data size object.
   */
  getDataSize(state) {
    return state.dataSize
  },
  /**
   * Gets the number of questions of a specific subject.
   *
   * @constructor
   * @param {DataSizeState} state - The data size state.
   * @param {string} subjectName - The subject name.
   * @returns {(subjectName: string) => number} The number of questions of the given subject.
   */
  getNumberOfQuestionBySubject(state) {
    return subjectName => state.dataSize.questions.subject[subjectName] || 0
  },
  /**
   * Gets a sorted object of data size tests by week key.
   *
   * @param {DataSizeState} state - The data size state.
   * @returns {Object.<string, number>} The sorted data size tests by week key.
   */
  getTestsByWeek(state) {
    return sortWeekIntervals(state.dataSize.testsByWeek)
  },
  /**
   * Gets the interval of all weeks in data size tests by week key.
   *
   * @param {DataSizeState} state - The data size state.
   * @returns {string[]} The interval of all weeks in data size tests by week key.
   */
  getTestsByWeekInterval(state) {
    /**
     * @type {string[]}
     */
    const intervalsList = []

    const intervals = sortWeekIntervals(state.dataSize.testsByWeek)

    for (const week in intervals) {
      const date = isoToDate(week)
      const weekInterval = getWeekInterval(date)

      const startDay = weekInterval[0].substring(8, 10)
      const startMonth = weekInterval[0].substring(5, 7)

      const endDay = weekInterval[1].substring(8, 10)
      const endMonth = weekInterval[1].substring(5, 7)

      intervalsList.push(`${startDay}/${startMonth} - ${endDay}/${endMonth}`)
    }

    return intervalsList
  },
}

export default {
  state,
  mutations,
  actions,
  getters,
}
