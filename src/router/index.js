import Vue from 'vue';
import VueRouter from 'vue-router';
import SignUser from '@/components/User/SignUser.vue';
import Profile from '@/components/User/Profile.vue';
import Questions from '@/components/Questions/Questions.vue';
import Tests from '@/components/Tests/Tests.vue';
import PrintTest from '@/components/Tests/PrintTest.vue';
import Papers from '@/components/Documents/Papers.vue';
import Inbox from '@/components/Requests/Inbox.vue';
import Home from '@/views/Home.vue';
import Management from '@/components/Admin/Management.vue';
import AuthGuard from './auth-guard';

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
        path: '/papers',
        component: Papers,
        name: 'papers',
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
