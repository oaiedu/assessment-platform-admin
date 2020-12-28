const initialState = () => ({
    loading: false,
    error: null
});

const state = initialState();

const mutations = {
    setLoading(state, payload) {
        state.loading = payload;
    },
    setError(state, payload) {
        state.error = payload;
    },
    clearError(state) {
        state.error = null;
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
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}
