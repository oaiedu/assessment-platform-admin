import Vue from 'vue'

import App from './App.vue'

import vuetify from './plugins/vuetify'
import router from './router'
import store from './store'

import i18n from './i18n'

import { auth } from './api/firebase'

import { showErrorMessage } from './utils/errors'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: h => h(App),
  async created() {
    if (!navigator.onLine) {
      const errorModel = showErrorMessage(
        'connection',
        '',
        'Please try again later.',
      )

      store.commit('setError', { message: errorModel })
      return
    }

    await this.$store.dispatch('loadSubjects')
    await this.$store.dispatch('loadDataSize')

    auth.onAuthStateChanged(user => {
      if (user) {
        this.$store.dispatch('autoSignIn', user)
        this.$store.dispatch('deleteQuestions')
        this.$store.dispatch('deleteRequests')
        this.$store.dispatch('deleteTests')
      }
    })

    this.$store.dispatch('resetLayout')
    this.$store.dispatch('resetQuestions')
    this.$store.dispatch('resetRequests')
    this.$store.dispatch('resetTests')

    this.$store.dispatch('clearSuccess')
    this.$store.dispatch('clearError')
  },
}).$mount('#app')
