import Vue from 'vue'
import App from './App.vue'
import * as firebase from 'firebase'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import AlertCmp from './components/Shared/Alert.vue'


Vue.config.productionTip = false

Vue.component('app-alert', AlertCmp)

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
    console.log("AAAAAA")
    this.$store.dispatch('loadedQuestions')
    console.log(this.$store.state.loadedQuestions)
  }
}).$mount('#app')
