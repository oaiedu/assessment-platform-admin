import * as firebase from 'firebase'

export default {
    state: {
        loadedTests: [],
    },
    mutations: {
        setLoadedTests(state, payload) {
            state.loadedTests = payload
        },
    },
    actions: {
        loadedTests({ commit }) {
            commit('setLoading', true)
            const db = firebase.firestore()
            let tests = []
            db.collection("tests").get().then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    tests.push(Object.assign({ id: doc.id, data: doc.data() }))
                })
            })
            commit('setLoadedTests', tests)
            commit('setLoading', false)
        },
        createTest({ commit }, payload) {
            const db = firebase.firestore()
            const test = {
              title: payload.title,
              questions: payload.questions,
              type: payload.type,
              user: payload.user,
              created: payload.created,
              edited: payload.edited,
              purpose: payload.purpose
            }
            db.collection("tests").doc().set({
              title: test.title,
              questions: test.questions,
              type: test.type,
              user: test.user,
              created: test.created,
              edited: test.edited,
              purpose: test.purpose
            })
                .then(function () {
                    console.log("Success")
                })
                .catch(function (error) {
                    console.error("Error writing document: ", error);
                });
        },
    },
    getters: {
        loadedTests(state) {
            return state.loadedTests
        }
    }
}
