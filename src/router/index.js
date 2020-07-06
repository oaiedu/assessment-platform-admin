import Vue from 'vue'
import VueRouter from 'vue-router'
import SignUp from '@/components/User/SignUp.vue'
import SignIn from '@/components/User/SignIn.vue'
import Profile from '@/components/User/Profile.vue'
import NewQuestion from '@/components/Questions/NewQuestion.vue'
import Questions from '@/components/Questions/Questions.vue'
import EditQuestion from '@/components/Questions/EditQuestion.vue'
import NewTestForm from '@/components/Tests/NewTestForm.vue'
import Tests from '@/components/Tests/Tests.vue'
import HtmlTest from '@/components/Tests/HtmlToPdfTest.vue'
import PrintTest from '@/components/Tests/PrintTest.vue'
import PrintQuestions from '@/components/Questions/PrintQuestion/Body.vue'
import Papers from '@/components/Documents/Papers.vue'
import Inbox from '@/components/Inbox.vue'
import Home from '@/views/Home.vue'
import AuthGuard from './auth-guard'

Vue.use(VueRouter)

const routes = [
  {
    path:'/',
    component:Home,
    name:'home',
  },
  {
    path:'/inbox',
    component: Inbox,
    name:'inbox',
  },
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
    path: '/htmltest/:id',
    component: HtmlTest,
    name: 'htmltest',
  },
  {
    path: '/profile',
    component: Profile,
    name: 'profile',
    beforeEnter: AuthGuard
  },
  {
    path: '/newquestion',
    component: NewQuestion,
    name: 'newquestion',
    beforeEnter: AuthGuard
  },
  {
    path: '/createpaper',
    component: Papers,
    name: 'createpaper',
    beforeEnter: AuthGuard
  },
  {
    path: '/editquestions/:id',
    component: EditQuestion,
    name: 'editquestions',
    beforeEnter: AuthGuard
  },
  {
    path: '/tests',
    component: Tests,
    name: 'tests',
    beforeEnter: AuthGuard
  },
  {
    path: '/test/:testId',
    component: PrintTest,
    name: 'test',
    beforeEnter: AuthGuard
  },
  {
    path: '/printquestion/:questionId',
    component: PrintQuestions,
    name: 'printquestion',
    beforeEnter: AuthGuard
  },
  {
    path: '/newtestform',
    component: NewTestForm,
    name: 'newtestform',
    beforeEnter: AuthGuard
  },
  {
    path: '/questions',
    component: Questions,
    name: 'questions',
    beforeEnter: AuthGuard
  }
]

const router = new VueRouter({
  mode: 'history',
  routes,
  base: '/'
})

export default router
