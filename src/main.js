import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';

import VueRouter from 'vue-router'
import firebase from 'firebase'
//import Vuex from 'vuex'
import SignUp from './components/User/SignUp.vue'
import SignIn from './components/User/SignIn.vue'
import Profile from './components/User/Profile.vue'

Vue.config.productionTip = false

Vue.use(VueRouter)

const routes = [
  {
    path: '/signup',
    component: SignUp,
    name: 'signup'
  },
  {
    path: '/signin',
    component: SignIn,
    name: 'signin'
  },
  {
    path: '/profile',
    component: Profile,
    name: 'profile'
  }
]

const router = new VueRouter({
  mode: 'history',
  routes,
  base: '/'
})

new Vue({
  vuetify,
  router,
  render: h => h(App),
  created () {
    firebase.initializeApp({
      apiKey: "AIzaSyCnjUyyyo0aS1QdEVCDgSUjB5LSN5RJ1wc",
      authDomain: "pwr-quiz-generator.firebaseapp.com",
      databaseURL: "https://pwr-quiz-generator.firebaseio.com",
      projectId: "pwr-quiz-generator",
      storageBucket: "pwr-quiz-generator.appspot.com",
      messagingSenderId: "951898114054",
      appId: "1:951898114054:web:919f58aeb4bdd44ed99b87",
      measurementId: "G-K0PEEHTW4T"
    })
  }
}).$mount('#app')
