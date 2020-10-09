import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersist from 'vuex-persist';

import modules from './modules';

Vue.use(Vuex);

const vuexPersist = new VuexPersist({
    key: 'my-app',
    storage: window.localStorage
});

export default new Vuex.Store({
    modules,
    actions: {
        reset({ commit }) {
            Object.keys(modules).forEach(moduleName => {
                commit(`${moduleName}/RESET`);
            });
        }
    },
    plugins: [
        vuexPersist.plugin
    ]
});
