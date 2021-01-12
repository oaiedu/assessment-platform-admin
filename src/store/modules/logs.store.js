const initialState = () => ({
    loading: false,
    error: null,
    success: null
});

const state = initialState();

const mutations = {
    setLoading(state, data) {
        state.loading = data;
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
