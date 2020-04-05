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
        },
        deleteQuestion(state, payload) {
            state.loadedQuestions.forEach((item, i) => {
              if(item.id === payload)
                state.loadedQuestions.splice(i, 1);
            });
        }
    },
    actions: {
        loadedQuestions({ commit }) {
            commit('setLoading', true)
            const db = firebase.firestore().collection("questions")
            let questions = []
            db.get().then(querySnapshot => {
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
                    commit('deleteQuestion', id)
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
        editQuestion({ commit, dispatch }, payload) {
          commit('setLoading', true)

          var today = new Date();

          const db = firebase.firestore()
          const question = {
              id: payload.questionData.id,
              questionDescription: payload.questionData.questionDescription,
              subject: payload.questionData.subject,
              knowledge: payload.questionData.knowledge,
              knowledgePWR: payload.questionData.knowledgePWR,
              knowledgeBWR: payload.questionData.knowledgeBWR,
              answers: payload.questionData.answers,
              images: payload.questionData.images
          }
          const edition = payload.oldData.edited
          edition.push({
            id: payload.user,
            date: today,
            question: payload.oldData.id + "-" + (payload.oldData.edited.length + 1)
          })

          db.collection("questions").doc(question.id).update({
              PERGUNTA: question.questionDescription,
              DISCIPLINA: question.subject,
              CONHECIMENTO: question.knowledge,
              RELEVANCIA_OR: question.knowledgePWR,
              RELEVANCIA_OSR: question.knowledgeBWR,
              RESPOSTAS: question.answers,
              IMAGENS: question.images,
              edited: edition
          })
              .then( () => {
                  dispatch("createdEditedQuestion", payload.oldData)
                  console.log("Success edit")
              })
              .catch(function (error) {
                  console.error("Error writing document: ", error);
              });
        },
        createdEditedQuestion({ commit, dispatch }, payload) {
          const db = firebase.firestore()
          const editedQuestion = {
              id: payload.id,
              questionDescription: payload.questionDescription,
              subject: payload.subject,
              knowledge: payload.knowledge,
              knowledgePWR: payload.knowledgePWR,
              knowledgeBWR: payload.knowledgeBWR,
              answers: payload.answers,
              images: payload.images
          }
          db.collection("edited questions").doc(editedQuestion.id + "-" + payload.edited.length).set({
              PERGUNTA: editedQuestion.questionDescription,
              DISCIPLINA: editedQuestion.subject,
              CONHECIMENTO: editedQuestion.knowledge,
              RELEVANCIA_OR: editedQuestion.knowledgePWR,
              RELEVANCIA_OSR: editedQuestion.knowledgeBWR,
              RESPOSTAS: editedQuestion.answers,
              IMAGENS: editedQuestion.images
          })
              .then( () => {
                  commit('setLoading', false)
                  console.log("Success create edit")
              })
              .catch(function (error) {
                  console.error("Error writing document: ", error);
              });
        },
        createQuestion({ commit, dispatch }, payload) {
            const db = firebase.firestore()
            var question = {
              id: payload.id,
              data: {
                PERGUNTA: payload.questionDescription,
                DISCIPLINA: payload.subject,
                CONHECIMENTO: payload.knowledge,
                RELEVANCIA_OR: payload.knowledgePWR,
                RELEVANCIA_OSR: payload.knowledgeBWR,
                RESPOSTAS: payload.answers,
                IMAGENS: payload.images,
                edited: []
              }
            }
            db.collection("questions").doc(question.id).set(question.data)
                .then(function () {
                    commit('setLoading', false)
                    commit('createQuestion', question)
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
        getAnswersById(state) {
          let aux = state.loadedQuestions.find(question => question.id === id)
          return Object.assign({},aux.data.RESPOSTAS)
        },
        getNumberOfQuestionBySubject:(state) => (subject)=> {
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
