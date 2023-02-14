import { Store } from 'vuex'

import { LogController } from '../../controllers/log.controller'
import { LogEntity } from '../../entities/log.entity'

import { showErrorMessage } from '../../utils/errors'

/**
 * @typedef {Object} LogsState
 * @property {boolean} loading Whether the application is loading or not.
 * @property {LogEntity[]} logs An array of logs.
 * @property {LogEntity?} lastLog The most recent log.
 * @property {Object?} error The error that occurred during the application usage.
 * @property {string} error.message The error message.
 * @property {string?} success The success message that occurred during the application usage.
 */

/**
 * Defines the Log controller.
 */
const controller = new LogController()

/**
 * Gets the initial state for logs store.
 *
 * @returns {LogsState} The initial logs state object.
 */
const initialState = () => ({
  loading: false,
  logs: [],
  lastLog: null,
  error: null,
  success: null,
})

const state = initialState()

const mutations = {
  /**
   * Sets the loading to true or false.
   *
   * @param {LogsState} state The logs state.
   * @param {boolean} data The loading value to be set.
   */
  setLoading(state, data) {
    state.loading = data
  },
  /**
   * Sets to the state a new array of logs.
   *
   * @param {LogsState} state The logs state.
   * @param {LogEntity[]} data An array of error logs.
   */
  setLogs(state, data) {
    state.logs = data.map(log => log.clone())
  },
  /**
   * Sets the most recent error log into the state.
   *
   * @param {LogsState} state The logs state.
   * @param {LogEntity?} data The most recent error log.
   */
  setLastLog(state, data) {
    state.lastLog = data ? data.clone() : null
  },
  /**
   * Adds a new error log to the logs list.
   *
   * @param {LogsState} state The logs state.
   * @param {LogEntity?} data The error log.
   */
  addLog(state, data) {
    if (!data) {
      return
    }

    state.logs.push(data.clone())
  },
  /**
   * Sets an error to the logs state.
   *
   * @param {LogsState} state The logs state.
   * @param {Object} data The error object.
   * @param {string} data.message The error message.
   */
  setError(state, data) {
    state.error = data
  },
  /**
   * Clears the logs state error.
   *
   * @param {LogsState} state The logs state.
   */
  clearError(state) {
    state.error = null
  },
  /**
   * Sets a success message to the logs state.
   *
   * @param {LogsState} state The logs state.
   * @param {string} data The success message.
   */
  setSuccess(state, data) {
    state.success = data
  },
  /**
   * Clears the logs state success.
   *
   * @param {LogsState} state The logs state.
   */
  clearSuccess(state) {
    state.success = null
  },
  /**
   * Resets the logs state to it's initial state.
   *
   * @param {LogsState} state The logs state.
   */
  RESETLogs(state) {
    const newState = initialState()
    Object.keys(newState).forEach(key => {
      state[key] = newState[key]
    })
  },
}

const actions = {
  /**
   * Loads the error logs from Firebase.
   *
   * @param {Store<LogsState>} store The vuex store.
   */
  async loadLogs({ commit }) {
    commit('setLoading', true)

    try {
      const logs = await controller.getAll()
      commit('setLogs', logs)
    } catch (error) {
      const errorModel = showErrorMessage('load', 'Logs', error.message)

      commit('setError', { message: errorModel })
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Loads the most recent error log from Firebase.
   *
   * @param {Store<LogsState>} store The vuex store.
   */
  async loadLastLog({ commit }) {
    commit('setLoading', true)

    try {
      const log = await controller.getLast()
      commit('setLastLog', log)
    } catch (error) {
      const errorModel = showErrorMessage('load', 'Log', error.message)

      commit('setError', { message: errorModel })
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Creates an error log into the Firestore.
   *
   * @param {Store<LogsState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {LogEntity} payload.log The error log to be created.
   * @param {boolean} payload.toAdd Whether to add the log into the state or not.
   */
  async createLog({ commit }, payload) {
    commit('setLoading', true)

    try {
      const log = await controller.createOne(payload.log)

      if (payload.toAdd) {
        commit('addLog', log)
      }
    } catch (error) {
      const errorModel = showErrorMessage('creation', 'Log', error.message)

      commit('setError', { message: errorModel })
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Clears the logs state error.
   *
   * @param {Store<LogsState>} store The vuex store.
   */
  clearError({ commit }) {
    commit('clearError')
  },
  /**
   * Clears the logs state success.
   *
   * @param {Store<LogsState>} store The vuex store.
   */
  clearSuccess({ commit }) {
    commit('clearSuccess')
  },
  /**
   * Clears the logs state loading, setting it to false.
   *
   * @param {Store<LogsState>} store The vuex store.
   */
  clearLoading({ commit }) {
    commit('setLoading', false)
  },
  /**
   * Resets the logs state to it's initial state.
   *
   * @param {Store<LogsState>} store The vuex store.
   */
  resetLogs({ commit }) {
    commit('RESETLogs')
  },
}

const getters = {
  /**
   * Gets the current loading value.
   *
   * @param {LogsState} state The logs state.
   * @returns {boolean} The loading current value.
   */
  loading(state) {
    return state.loading
  },
  /**
   * Gets the logs list from the state.
   *
   * @param {LogsState} state The logs state.
   * @returns {LogEntity[]} An array of logs.
   */
  logs(state) {
    return state.logs
  },
  /**
   * Gets the most recent error log from the state.
   *
   * @param {LogsState} state The logs state.
   * @returns {LogEntity} The most recent log.
   */
  getLastLog(state) {
    return state.lastLog
  },
  /**
   * Gets the current error value.
   *
   * @param {LogsState} state The logs state.
   * @returns {{message: string}|null} The error current value.
   */
  error(state) {
    return state.error
  },
  /**
   * Gets the current success value.
   *
   * @param {LogsState} state The logs state.
   * @returns {string|null} The success current value.
   */
  success(state) {
    return state.success
  },
}

export default {
  state,
  mutations,
  actions,
  getters,
}
