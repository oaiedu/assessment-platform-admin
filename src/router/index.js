import Vue from "vue";
import VueRouter from "vue-router";
import Auth from "@/views/Auth.vue";
import Profile from "@/components/User/Profile.vue";
import Questions from "@/components/Questions/Questions.vue";
import Tests from "@/components/Tests/Tests.vue";
import Inbox from "@/components/Requests/Inbox.vue";
import Home from "@/views/Home.vue";
import Management from "@/components/Admin/Management.vue";
import AuthGuard from "./auth-guard";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    component: Home,
    name: "home",
    beforeEnter: AuthGuard
  },
  {
    path: "/admin",
    component: Management,
    name: "management",
    beforeEnter: AuthGuard
  },
  {
    path: "/inbox",
    component: Inbox,
    name: "inbox",
    beforeEnter: AuthGuard
  },
  {
    path: "/auth",
    component: Auth,
    name: "auth"
  },
  {
    path: "/profile",
    component: Profile,
    name: "profile",
    beforeEnter: AuthGuard
  },
  {
    path: "/tests",
    component: Tests,
    name: "tests",
    beforeEnter: AuthGuard
  },
  {
    path: "/questions",
    component: Questions,
    name: "questions",
    beforeEnter: AuthGuard
  }
];

const router = new VueRouter({
  mode: "history",
  routes,
  base: "/"
});

export default router;
