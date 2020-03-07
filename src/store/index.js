import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersist from 'vuex-persist'

import signUser from './SignUser'
import logs from './Logs'
import questions from './Questions'
import tests from './Tests'
import layout from './Layout'
import paper from './Paper'


Vue.use(Vuex)

const vuexPersist = new VuexPersist({
  key: 'my-app',
  storage: window.localStorage
})

export default new Vuex.Store({
  modules: {
    signUser,
    logs,
    questions,
    tests,
    layout,
    paper
  },
  plugins: [
    vuexPersist.plugin
  ]
})
