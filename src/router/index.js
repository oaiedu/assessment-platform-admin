import Vue from 'vue'
import VueRouter from 'vue-router'

import Auth from '@/views/Auth.vue'
import Profile from '@/components/User/Profile.vue'
import Questions from '@/components/Questions/Questions.vue'
import Tests from '@/components/Tests/Tests.vue'
import Quiz from '@/components/Tests/Quiz.vue'
import QuizDetails from '@/components/Tests/QuizDetails.vue'
import Inbox from '@/components/Requests/Inbox.vue'
import Home from '@/views/Home.vue'
import Management from '@/components/Admin/Management.vue'

import AuthGuard from './auth-guard'

import { analytics } from '../api/firebase'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Home,
    name: 'home',
    beforeEnter: AuthGuard,
  },
  {
    path: '/admin',
    component: Management,
    name: 'management',
    beforeEnter: AuthGuard,
  },
  {
    path: '/inbox',
    component: Inbox,
    name: 'inbox',
    beforeEnter: AuthGuard,
  },
  {
    path: '/inbox/:id',
    component: Inbox,
    name: 'inbox.details',
    beforeEnter: AuthGuard,
  },
  {
    path: '/auth',
    component: Auth,
    name: 'auth',
  },
  {
    path: '/profile',
    component: Profile,
    name: 'profile',
    beforeEnter: AuthGuard,
  },
  {
    path: '/quizzes',
    component: Tests,
    name: 'quizzes',
    beforeEnter: AuthGuard,
  },
  {
    path: '/quizzes/:id',
    component: QuizDetails,
    name: 'quiz.details',
    beforeEnter: AuthGuard,
  },
  {
    path: '/quiz/:id',
    component: Quiz,
    name: 'quiz.exam',
    beforeEnter: AuthGuard,
  },
  {
    path: '/questions',
    component: Questions,
    name: 'questions',
    beforeEnter: AuthGuard,
  },
]

const router = new VueRouter({
  mode: 'history',
  routes,
  base: '/',
})

router.afterEach((to, from) => {
  const authNeededTo = to.params.to

  analytics.setCurrentScreen(to.name)
  analytics.logEvent('screen_view', {
    firebase_screen_name: to.name,
  })

  analytics.logEvent('navigation', {
    page_name: to.name,
    access_denied: authNeededTo,
    from: from.name,
  })
})

export default router
