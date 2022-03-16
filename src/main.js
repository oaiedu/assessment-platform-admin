import Vue from "vue";
import App from "./App.vue";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import { getConfig } from "./api/firebase";

Vue.config.productionTip = false;

firebase.initializeApp(getConfig());

export const googleProvider = new firebase.auth.GoogleAuthProvider();

export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
  async created() {
    await this.$store.dispatch("loadSubjects");
    await this.$store.dispatch("loadDataSize");

    auth.onAuthStateChanged(user => {
      if (user) {
        this.$store.dispatch("autoSignIn", user);
        this.$store.dispatch("deleteQuestions");
        this.$store.dispatch("deleteRequests");
        this.$store.dispatch("deleteTests");
      }
    });

    this.$store.dispatch("resetLayout");
    this.$store.dispatch("resetQuestions");
    this.$store.dispatch("resetRequests");
    this.$store.dispatch("resetTests");

    this.$store.dispatch("clearSuccess");
    this.$store.dispatch("clearError");
  }
}).$mount("#app");
