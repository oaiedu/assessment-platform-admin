import { Store } from 'vuex'

import { BackupController } from '../../controllers/backup.controller'
import { BackupEntity } from '../../entities/backup.entity'

import { createErrorLog, showErrorMessage } from '../../utils/errors'

/**
 * @typedef {Object} BackupState
 * @property {Record<string, string>} months - The months object, from 1 to 12.
 * @property {BackupEntity[]} backups - An array of backups.
 * @property {BackupEntity|null} lastBackup - The last backup made.
 */

/**
 * Defines the backup controller.
 */
const controller = new BackupController()

/**
 * Gets the initial state for backup store.
 *
 * @returns {BackupState} The initial backup state object.
 */
const initialState = () => ({
  months: {
    '1': 'january',
    '2': 'february',
    '3': 'march',
    '4': 'april',
    '5': 'may',
    '6': 'june',
    '7': 'july',
    '8': 'august',
    '9': 'septembre',
    '10': 'octobre',
    '11': 'november',
    '12': 'december',
  },
  backups: [],
  lastBackup: null,
})

const state = initialState()

const mutations = {
  /**
   * Sets to the state a new array of backups.
   *
   * @param {BackupState} state The backup state.
   * @param {BackupEntity[]} data An array of backups.
   */
  setBackups(state, data) {
    state.backups = data.map(backup => backup.clone())
  },
  /**
   * Pushes a new backup to backups list.
   *
   * @param {BackupState} state The backup state.
   * @param {BackupEntity} data
   */
  newBackup(state, data) {
    if (!data) {
      return
    }

    state.backups.push(data.clone())
  },
  /**
   * Remove a backup from backups list.
   *
   * @param {BackupState} state The backup state.
   * @param {BackupEntity} data The backup to remove.
   */
  removeBackup(state, data) {
    const backups = [...state.backups]
    const ids = state.backups.map(backup => backup.id)
    const index = ids.indexOf(data.id)

    if (index !== -1) {
      backups.splice(index, 1)
    }

    state.backups = backups
  },
  /**
   * Sets the last backup with the given data.
   *
   * @param {BackupState} state The backup state.
   * @param {BackupEntity?} data The backup to be set.
   */
  setLastBackup(state, data) {
    state.lastBackup = data ? data.clone() : null
  },
  /**
   * Resets the backup state to it's initial state.
   *
   * @param {BackupState} state The backup state.
   */
  RESETBackup(state) {
    const newState = initialState()
    Object.keys(newState).forEach(key => {
      state[key] = newState[key]
    })
  },
}

const actions = {
  /**
   * Backups all Firebase data and sends it to the google drive cloud service.
   *
   * @param {Store<BackupState>} store The vuex store.
   */
  async backupFirebase({ commit }) {
    commit('setLoading', true)

    try {
      const backup = await controller.backup()

      if (backup) {
        commit('newBackup', backup)
      }

      commit('setSuccess', 'Backup successfully done!')
    } catch (error) {
      createErrorLog('Backup Data', error.message, null)

      const errorModel = showErrorMessage('creation', 'Backup', error.message)
      commit('setError', { message: errorModel })
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Loads all the backups from the last 3 months.
   *
   * @param {Store<BackupState>} store The vuex store.
   */
  async loadBackups({ commit }) {
    commit('setLoading', true)

    try {
      const backups = await controller.getLastMonths()
      commit('setBackups', backups)
    } catch (error) {
      createErrorLog('Backups Load', error.message, null)

      const errorModel = showErrorMessage('load', 'Backup', error.message)
      commit('setError', { message: errorModel })
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Downloads a backup according to it's cloudId.
   *
   * @param {Store<BackupState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {string} payload.registry The backup registry.
   * @param {string} payload.cloudId The backup cloud id.
   * @param {string} payload.date The backup start date.
   */
  async downloadBackup({ commit }, payload) {
    commit('setLoading', true)

    const setError = error => {
      createErrorLog('Backup Download', error.message, { payload })

      const errorModel = showErrorMessage(
        'connection',
        '',
        'Download error - ' + error.message,
      )
      commit('setError', { message: errorModel })
    }

    try {
      const result = await controller.download(payload)

      if (!result) {
        return
      }

      if (result.error) {
        return setError(result.error)
      }

      const a = document.createElement('a')
      a.href = result.url

      a.download = `${payload.registry.toUpperCase()}-${payload.date.replace(
        /\s/g,
        '_',
      )}.zip`

      a.click()
      a.remove()
    } catch (error) {
      setError(error)
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Deletes a backup.
   *
   * @param {Store<BackupState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {string} payload.id The backup cloud id.
   */
  async deleteBackup({ commit }, payload) {
    commit('setLoading', true)

    const setError = error => {
      createErrorLog('Backup Delete', error.message ?? '', {
        id: payload.id,
      })

      const errorModel = showErrorMessage(
        'exclusion',
        'Backup',
        error.message ?? '',
      )
      commit('setError', { message: errorModel })
    }

    try {
      const { backup, success, error } = await controller.delete(payload.id)

      if (!success) {
        return setError(error)
      }

      commit('removeBackup', backup)
      commit('setSuccess', 'Backup successfully deleted!')
    } catch (error) {
      setError(error)
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Loads the most recent backup.
   *
   * @param {Store<BackupState>} store The vuex store.
   */
  async loadLastBackup({ commit }) {
    commit('setLoading', true)

    try {
      const backup = await controller.getLast()
      commit('setLastBackup', backup)
    } catch (error) {
      createErrorLog('Last Backup Loading', error.message, null)

      const errorModel = showErrorMessage('load', 'Backup', error.message)
      commit('setError', { message: errorModel })
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Resets the backup state to it's initial state.
   *
   * @param {Store<BackupState>} store The vuex store.
   */
  resetBackup({ commit }) {
    commit('RESETBackup')
  },
}

const getters = {
  /**
   * Gets the months object from the backup state.
   *
   * @param {BackupState} state The backup state.
   * @returns {Record<string, string>} The months object, from 1 to 12.
   */
  getMonths(state) {
    return state.months
  },
  /**
   * Gets all the backups from the backup state.
   *
   * @param {BackupState} state The backup state.
   * @returns {BackupEntity[]} An array of backups.
   */
  getBackups(state) {
    return state.backups
  },
  /**
   * Gets the most recent backup from the backup state.
   *
   * @param {BackupState} state The backup state.
   * @returns {BackupEntity} The most recent backup.
   */
  getLastBackup(state) {
    return state.lastBackup
  },
}

export default {
  state,
  mutations,
  actions,
  getters,
}
