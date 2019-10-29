import Vue from 'vue'
import VueRouter from 'vue-router'
import SignUp from '@/components/User/SignUp.vue'
import SignIn from '@/components/User/SignIn.vue'
import Profile from '@/components/User/Profile.vue'
import NewQuestion from '@/components/Questions/NewQuestion.vue'

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
  },
  {
    path: '/newquestion',
    component: NewQuestion,
    name: 'newquestion'
  }
]

const router = new VueRouter({
  mode: 'history',
  routes,
  base: '/'
})

export default router
