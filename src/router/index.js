import Vue from 'vue';
import VueRouter from 'vue-router';
import SignUser from '@/components/SignUser.vue';
import Profile from '@/components/User/Profile.vue';
import NewQuestion from '@/components/Questions/NewQuestion.vue';
import Questions from '@/components/Questions/Questions.vue';
import EditQuestion from '@/components/Questions/EditQuestion.vue';
import NewTestForm from '@/components/Tests/NewTestForm.vue';
import Tests from '@/components/Tests/Tests.vue';
import PrintTest from '@/components/Tests/PrintTest.vue';
import PrintQuestions from '@/components/Questions/PrintQuestion/Body.vue';
import Papers from '@/components/Documents/Papers.vue';
import Inbox from '@/components/Inbox.vue';
import Home from '@/views/Home.vue';
import AuthGuard from './auth-guard';
import Management from '@/components/Admin/Management.vue';

Vue.use(VueRouter);

const routes = [
    {
        path:'/',
        component:Home,
        name:'home',
    },
    {
        path: '/admin',
        component: Management,
        name: 'management',
        beforeEnter: AuthGuard
    },
    {
        path:'/inbox',
        component: Inbox,
        name:'inbox',
    },
    {
        path: '/signup',
        component: SignUser,
        name: 'signup'
    },
    {
        path: '/signin',
        component: SignUser,
        name: 'signin'
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
        path: '/papers',
        component: Papers,
        name: 'papers',
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
        path: '/tests/:testId',
        component: PrintTest,
        name: 'testsById',
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
});

export default router;
