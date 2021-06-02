import { Store } from 'vuex';

import { db } from '../../main';
import { showErrorMessage } from '../../utils/errors';

/**
 * @typedef {Object} ErrorLogUser
 * @property {string} id - The user id.
 * @property {string} name - The user name.
 * @property {string} email - The user e-mail.
 */

/**
 * @typedef {Object} ErrorLog
 * @property {string} id - The log id.
 * @property {string} type - The log type.
 * @property {string} date - The log creation date.
 * @property {string} message - The log error message.
 * @property {*} payload - The log payload.
 * @property {ErrorLogUser} user - The user that teased the error.
 */

/**
 * @typedef {Object} LogsState
 * @property {boolean} loading - Whether the application is loading or not.
 * @property {ErrorLog[]} logs - An array of logs.
 * @property {ErrorLog|null} lastLog - The most recent log.
 * @property {Object|null} error - The error that occurred during the application usage.
 * @property {string} error.message - The error message.
 * @property {string|null} success - The success message that occurred during the application usage.
 */

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
    success: null
});

const state = initialState();

const mutations = {
    /**
     * Sets the loading to true or false.
     *
     * @param {LogsState} state - The logs state.
     * @param {boolean} data - The loading value to be setted.
     */
    setLoading(state, data) {
        state.loading = data;
    },
    /**
     * Sets to the state a new array of logs.
     *
     * @param {LogsState} state - The logs state.
     * @param {ErrorLog[]} data - An array of error logs.
     */
    setLogs(state, data) {
        state.logs = data;
    },
    /**
     * Sets the most recent error log into the state.
     *
     * @param {LogsState} state - The logs state.
     * @param {ErrorLog} data - The most recent error log.
     */
    setLastLog(state, data) {
        state.lastLog = data;
    },
    /**
     * Adds a new error log to the logs list.
     *
     * @param {LogsState} state - The logs state.
     * @param {ErrorLog} data - The error log.
     */
    addLog(state, data) {
        state.logs.push(data);
    },
    /**
     * Sets an error to the logs state.
     *
     * @param {LogsState} state - The logs state.
     * @param {Object} data - The error object.
     * @param {string} data.message - The error message.
     */
    setError(state, data) {
        state.error = data;
    },
    /**
     * Clears the logs state error.
     *
     * @param {LogsState} state - The logs state.
     */
    clearError(state) {
        state.error = null;
    },
    /**
     * Sets a success message to the logs state.
     *
     * @param {LogsState} state - The logs state.
     * @param {string} data - The success message.
     */
    setSuccess(state, data) {
        state.success = data;
    },
    /**
     * Clears the logs state success.
     *
     * @param {LogsState} state - The logs state.
     */
    clearSuccess(state) {
        state.success = null;
    },
    /**
     * Resets the logs state to it's initial state.
     *
     * @param {LogsState} state - The logs state.
     */
    RESETLogs(state) {
        const newState = initialState();
        Object.keys(newState).forEach(key => {
            state[key] = newState[key];
        });
    }
}

const actions = {
    /**
     * Loads the error logs from Firebase.
     *
     * @param {Store} store - The vuex store.
     */
    loadLogs({ commit }) {
        commit('setLoading', true);

        const data = [];

        db.collection('logs').get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    data.push(doc.data());
                });
            })
            .then(() => {
                commit('setLogs', data);
                commit('setLoading', false);
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('load', 'Logs', error.message);
                commit('setError', { message: errorModel });
            });
    },
    /**
     * Loads the most recent error log from Firebase.
     *
     * @param {Store} store - The vuex store.
     */
    loadLastLog({ commit }) {
        commit('setLoading', true);

        db.collection('logs').orderBy('date', 'desc').limit(1).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    commit('setLastLog', doc.data());
                    commit('setLoading', false);
                });
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('load', 'Log', error.message);
                commit('setError', { message: errorModel });
            });
    },
    /**
     * Creates an error log into the Firestore.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {ErrorLog} payload.log - The error log to be created.
     * @param {boolean} payload.toAdd - Whether to add the log into the state or not.
     */
    createLog({ commit }, payload) {
        commit('setLoading', true);

        db.collection('logs').add(payload.log)
            .then(() => {
                if(payload.toAdd) commit('addLog', payload.log);
                commit('setLoading', false);
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('creation', 'Log', error.message);
                commit('setError', { message: errorModel });
            })
    },
    /**
     * Clears the logs state error.
     *
     * @param {Store} store - The vuex store.
     */
    clearError({ commit }) {
        commit('clearError');
    },
    /**
     * Clears the logs state success.
     *
     * @param {Store} store - The vuex store.
     */
    clearSuccess({ commit }) {
        commit('clearSuccess');
    },
    /**
     * Clears the logs state loading, setting it to false.
     *
     * @param {Store} store - The vuex store.
     */
    clearLoading({ commit }) {
        commit('setLoading', false);
    },
    /**
     * Resets the logs state to it's initial state.
     *
     * @param {Store} store - The vuex store.
     */
    resetLogs({ commit }) {
        commit('RESETLogs');
    }
}

const getters = {
    /**
     * Gets the current loading value.
     *
     * @param {LogsState} state - The logs state.
     * @returns {boolean} The loading current value.
     */
    loading(state) {
        return state.loading;
    },
    /**
     * Gets the logs list from the state.
     *
     * @param {LogsState} state - The logs state.
     * @returns {ErrorLog[]} An array of logs.
     */
    logs(state) {
        return state.logs;
    },
    /**
     * Gets the most recent error log from the state.
     *
     * @param {LogsState} state - The logs state.
     * @returns {ErrorLog} The most recent log.
     */
    getLastLog(state) {
        return state.lastLog;
    },
    /**
     * Gets the current error value.
     *
     * @param {LogsState} state - The logs state.
     * @returns {{message: string}|null} The error current value.
     */
    error(state) {
        return state.error;
    },
    /**
     * Gets the current success value.
     *
     * @param {LogsState} state - The logs state.
     * @returns {string|null} The success current value.
     */
    success(state) {
        return state.success;
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}
