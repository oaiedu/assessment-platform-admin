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
        findImageTests({commit},payload){
            var storage = firebase.storage();
            var pathReference = storage.refFromURL(`gs://pwr-quiz-generator.appspot.com/${payload}`);

            var imageURL =  pathReference.getDownloadURL()
              .then(function(url) {
                console.log("URL",url)
                return url
              })
              .catch(function(error) {
                console.error("Error downloading the image", error)
              })

                console.log("After Download: ", imageURL)

            return imageURL
        },
        deleteTest({ commit }, payload) {
            const db = firebase.firestore()
            const id = payload
            db.collection("tests").doc(id).delete()
                .then(function () {
                    console.log("Document successfully deleted!")
                })
                .catch(function (error) {
                    console.error("Error removing document: ", error);
                });
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
        },
        getNumberOfQuestionBySubjectOnTest:(state) => (subject, questions)=>{
            let counter = 0
            questions.forEach(element => {
                if (element.data.DISCIPLINA === subject)
                    counter++
            })
            return counter
        },
        findTestById: state => id => state.loadedTests.find(test => test.id === id)
    }
}
