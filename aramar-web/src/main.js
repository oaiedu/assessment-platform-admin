import Vue from 'vue'
import App from './App.vue'
import * as firebase from 'firebase'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import AlertCmp from './components/Shared/Alert.vue'
import Combined from './components/Shared/Combined'


Vue.config.productionTip = false

Vue.component('app-alert', AlertCmp)
Vue.component('Combined', Combined)

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
  created () {
    firebase.initializeApp({
      apiKey: 'AIzaSyCnjUyyyo0aS1QdEVCDgSUjB5LSN5RJ1wc',
      authDomain: 'pwr-quiz-generator.firebaseapp.com',
      databaseURL: 'https://pwr-quiz-generator.firebaseio.com',
      projectId: 'pwr-quiz-generator',
      storageBucket: 'pwr-quiz-generator.appspot.com',
      messagingSenderId: '951898114054',
      appId: '1:951898114054:web:919f58aeb4bdd44ed99b87',
      measurementId: 'G-K0PEEHTW4T'
    })
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.$store.dispatch('autoSignIn', user )
      } 
    })
    this.$store.dispatch('loadedQuestions')
    this.$store.dispatch('loadedTests')
    console.log(this.$store.state.loadedQuestions)
  }
}).$mount('#app')
