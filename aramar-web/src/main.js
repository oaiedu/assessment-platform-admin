import Vue from 'vue'
import App from './App.vue'
import * as firebase from 'firebase'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import AlertCmp from './components/Shared/Alert.vue'
import Combined from './components/Shared/Combined'
import NewQuestion from './components/Questions/NewQuestion'
import EditQuestion from './components/Questions/EditQuestion'
import Stepper from './components/Questions/Stepper'
import DefinitionBlock from './components/Questions/PrintQuestion/Definition'
import ImageBlock from './components/Questions/PrintQuestion/Image'
import AnswerBlock from './components/Questions/PrintQuestion/Answers'
import Body from './components/Questions/PrintQuestion/Body'




Vue.config.productionTip = false

Vue.component('app-alert', AlertCmp)
Vue.component('Combined', Combined)
Vue.component('NewQuestion', NewQuestion)
Vue.component('EditQuestion', EditQuestion)
Vue.component('Stepper', Stepper)
Vue.component('Body', Body)
Vue.component('def-block', DefinitionBlock)
Vue.component('img-block', ImageBlock)
Vue.component('ans-block', AnswerBlock)

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
    this.$store.dispatch('clearError')
    this.$store.dispatch('loadedQuestions')
    this.$store.dispatch('loadedTests')
    console.log(this.$store.state.loadedQuestions)
  }
}).$mount('#app')
