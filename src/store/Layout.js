export default {
    state: {
        layout: 'toolbar-layout'
    },
    mutations: {
        setLayout (state, payload) {
            state.layout = payload;
        }
    },
    getters: {
        getLayout(state) {
            return state.layout;
        }
    }
}
