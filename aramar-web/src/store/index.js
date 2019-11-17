import Vue from 'vue'
import Vuex from 'vuex'
import * as firebase from 'firebase'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loadedQuestions: [],
    user: null,
    loading: false,
    error: null,
    deleteQuestionId: null
  },
  mutations: {
    setLoadedQuestions(state, payload) {
      state.loadedQuestions = payload
    },
    setUser(state, payload) {
      state.user = payload
    },
    setDeletedQuestion(state, payload) {
      state.deleteQuestionId = payload
    },
    createQuestion(state, payload) {
      state.loadedQuestions.push(payload)
    },
    setLoading(state, payload) {
      state.loading = payload
    },
    setError(state, payload) {
      state.error = payload
    },
    clearError(state, payload) {
      state.error = null
    }
  },
  actions: {
    loadedQuestions({ commit }) {
      commit('setLoading', true)
      const db = firebase.firestore()
      let questions = []
      db.collection("questions").get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
          questions.push(Object.assign({id: doc.id, data: doc.data()}))
        })
      })
      commit('setLoadedQuestions', questions)
      commit('setLoading', false)
    },
    signUserUp({ commit }, payload) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
        .then(
          user => {
            commit('setLoading', false)
            const newUser = {
              id: user.uid
            }
            commit('setUser', newUser)
            console.log('sucess')
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            commit('setError', error)
            console.log(error)
          }
        )
    },
    deleteQuestion({commit}, payload) {
      const db = firebase.firestore()
      const id = payload
      db.collection("questions").doc(id).delete()
      .then(function () {
        console.log("Document successfully deleted!")
      })
      .catch(function (error) {
        console.error("Error removing document: ", error);
      });
    },
    signUserIn({ commit }, payload) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
        .then(
          user => {
            commit('setLoading', false)
            const newUser = {
              id: user.uid
            }
            commit('setUser', newUser)
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            commit('setError', error)
            console.log(error)
          }
        )
    },
    logout({ commit }) {
      firebase.auth().signOut()
      commit('setUser', null)
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
        answers: payload.answers
      }
      db.collection("questions").doc(question.id).set({
        PERGUNTA: question.questionDescription,
        DISCIPLINA: question.subject,
        CONHECIMENTO: question.knowledge,
        RELEVANCIA_OR: question.knowledgePWR,
        RELEVANCIA_OSR: question.knowledgeBWR,
        RESPOSTAS: question.answers
      })
        .then(function () {
          console.log("Success")
        })
        .catch(function (error) {
          console.error("Error writing document: ", error);
        });
    },
    autoSignIn({ commit }, payload) {
      commit('setUser', { id: payload.uid })
    },
    clearError({ commit }) {
      commit('clearError')
    },
    clearLoading({commit}){
      commit('setLoading', false)
    }
  },
  getters: {
    user(state) {
      return state.user
    },
    loading(state) {
      return state.loading
    },
    error(state) {
      return state.error
    },
    loadedQuestions(state) {
      return state.loadedQuestions
    },
    findQuestionById: state => id => state.loadedQuestions.find(question => question.id === id)
  },
  modules: {
  }
})
