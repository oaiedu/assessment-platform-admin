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
                name: payload.name,
                questions: payload.questions
            }
            db.collection("tests").doc().set({
                TITULO: test.name,
                PERGUNTAS: test.questions
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
        },
        findQuestionById: state => id => state.loadedQuestions.find(question => question.id === id)
    }
}