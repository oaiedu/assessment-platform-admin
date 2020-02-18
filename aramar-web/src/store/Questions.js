import * as firebase from 'firebase'

export default {
    state: {
        deleteQuestionId: null,
        loadedQuestions: [],
        subjects: [
            "Teoria do Reator",
            "Termodinâmica",
            "Instrumentação e Controle",
            "Válvulas e Bombas",
            "Eletricidade",
            "Mecânica dos Fluidos",
            "Tratamento Qúimico Refrigerante",
            "Análise Integrada",
            "Instrumentação Nuclear",
            "Física Nuclear",
            "Transferência de Calor",
            "Materiais"
        ]
    },
    mutations: {
        setLoadedQuestions(state, payload) {
            state.loadedQuestions = payload
        },
        setDeletedQuestion(state, payload) {
            state.deleteQuestionId = payload
        },
        createQuestion(state, payload) {
            state.loadedQuestions.push(payload)
        }
    },
    actions: {
        loadedQuestions({ commit }) {
            commit('setLoading', true)
            const db = firebase.firestore()
            let questions = []
            db.collection("questions").get().then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    questions.push(Object.assign({ id: doc.id, data: doc.data() }))
                })
                commit('setLoadedQuestions', questions)
                commit('setLoading', false)
            })
        },
        deleteQuestion({ commit, dispatch }, payload) {
            commit('setLoading', true)
            const db = firebase.firestore()
            const id = payload
            return db.collection("questions").doc(id).delete()
                .then( () => {
                    commit('setLoading', false)
                    dispatch("loadedQuestions")
                    console.log("Document successfully deleted!")
                })
                .catch(function (error) {
                    console.error("Error removing document: ", error);
                });
        },
        uploadImage({ commit }, payload) {
          const puta = new Promise((resolve,reject)=>{
            try{
              const storageRef = firebase.storage().ref()
              const file = payload.images
              var images = storageRef.child(file.name).put(file)
                .then(function(snapshot){
                  console.log("Uploaded a file!: ", snapshot)
                  snapshot.ref.getDownloadURL().then(function(downloadURL) {
                    console.log('File available at', downloadURL);
                    resolve(downloadURL.toString())
                  });
                })
                .catch(function(error){
                  console.error("Error uploading file",error)

                  resolve(error)
                })
            }catch{
              reject("yuuiijioj")
            }
          })

          return puta
        },
        createQuestion({ commit }, payload) {
            const db = firebase.firestore()
            const question = {
                id: payload.id,
                questionDescription: payload.questionDescription,
                subject: payload.subject,
                knowledge: payload.knowledge,
                knowledgePWR: payload.knowledgePWR,
                knowledgeBWR: payload.knowledgeBWR,
                answers: payload.answers,
                images: payload.images
            }
            db.collection("questions").doc(question.id).set({
                PERGUNTA: question.questionDescription,
                DISCIPLINA: question.subject,
                CONHECIMENTO: question.knowledge,
                RELEVANCIA_OR: question.knowledgePWR,
                RELEVANCIA_OSR: question.knowledgeBWR,
                RESPOSTAS: question.answers,
                IMAGENS: question.images
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
        getSubjects(state){
          return state.subjects
        },
        numberOfQuestions(state){
          return state.loadedQuestions.length
        },
        loadedQuestions(state) {
            return state.loadedQuestions
        },
        getNumberOfQuestionBySubject:(state) => (subject)=>{
            let counter = 0
            state.loadedQuestions.forEach(element => {
                if (element.data.DISCIPLINA === subject)
                    counter++
            })
            return counter
        },
        findQuestionById: state => id => state.loadedQuestions.find(question => question.id === id)
    }
}
