const initialState = () => ({
    layout: 'toolbar-layout'
});

const state = initialState();

const mutations = {
    setLayout (state, payload) {
        state.layout = payload;
    },
    RESETLayout(state) {
        const newState = initialState();
        Object.keys(newState).forEach(key => {
            state[key] = newState[key];
        });
    }
}

const actions = {
    resetLayout({ commit }) {
        commit('RESETLayout');
    }
}

const getters = {
    getLayout(state) {
        return state.layout;
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}
