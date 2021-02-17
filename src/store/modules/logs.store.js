import { db } from '../../main';
import { showErrorMessage } from '../../utils/errors';

const initialState = () => ({
    loading: false,
    logs: [],
    error: null,
    success: null
});

const state = initialState();

const mutations = {
    setLoading(state, data) {
        state.loading = data;
    },
    setLogs(state, data) {
        state.logs = data;
    },
    addLog(state, data) {
        state.logs.push(data);
    },
    setError(state, data) {
        state.error = data;
    },
    clearError(state) {
        state.error = null;
    },
    setSuccess(state, data) {
        state.success = data;
    },
    clearSuccess(state) {
        state.success = null;
    },
    RESETLogs(state) {
        const newState = initialState();
        Object.keys(newState).forEach(key => {
            state[key] = newState[key];
        });
    }
}

const actions = {
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
    createLog({ commit, state }, payload) {
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
    clearError({ commit }) {
        commit('clearError');
    },
    clearSuccess({ commit }) {
        commit('clearSuccess');
    },
    clearLoading({ commit }) {
        commit('setLoading', false);
    },
    resetLogs({ commit }) {
        commit('RESETLogs');
    }
}

const getters = {
    loading(state) {
        return state.loading;
    },
    logs(state) {
        return state.logs;
    },
    error(state) {
        return state.error;
    },
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
