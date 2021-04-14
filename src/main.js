import Vue from 'vue';
import App from './App.vue';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false;

const firebaseConfig = {
    apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
    authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.VUE_APP_FIREBASE_DB_URL,
    projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VUE_APP_FIREBASE_APP_ID,
    measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENT_ID
}

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();

new Vue({
    router,
    store,
    vuetify,
    render: h => h(App),
    created() {
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.$store.dispatch('autoSignIn', user);
                this.$store.dispatch('deleteQuestions');
                this.$store.dispatch('deleteRequests');
                this.$store.dispatch('deletePapers');
                this.$store.dispatch('deleteTests');
            }
        });

        this.$store.dispatch('resetPapers');
        this.$store.dispatch('resetQuestions');
        this.$store.dispatch('resetRequests');
        this.$store.dispatch('resetTests');

        this.$store.dispatch('clearSuccess');
        this.$store.dispatch('clearError');
        this.$store.dispatch('loadDataSize');
    }
}).$mount('#app');
