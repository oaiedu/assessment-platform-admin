import Vue from 'vue'
import Vuex from 'vuex'
import * as firebase from 'firebase'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loadedQuestions: [],
    user: null,
    loading: false,
    error: null
  },
  mutations: {
    setUser (state, payload) {
      state.user = payload
    },
    setQuestions (state, payload) {
      state.question = payload
    },
    setLoading (state, payload) {
      state.loading = payload
    },
    setError (state, payload) {
      state.error = payload
    },
    clearError (state, payload) {
      state.error = null
    }
  },
  actions: {
    signUserUp ( {commit}, payload ) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
        .then(
          user => {
            commit('setLoading', false)
            const newUser = {
              id: user.uid
            }
            commit('setUser',newUser)
            console.log('sucess')
          }
        )
        .catch (
          error => {
            commit('setLoading', false)
            commit('setError', error)
            console.log(error)
          }
        )
    },
    signUserIn ({commit}, payload) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
        .then(
          user => {
            commit('setLoading', false)
            const newUser = {
              id: user.uid
            }
            commit('setUser',newUser)
          }
        )
        .catch (
          error => {
            commit('setLoading', false)
            commit('setError', error)
            console.log(error)
          }
        )
    },
    logout ({commit}) {
      firebase.auth().signOut()
      commit('setUser', null)
    },
    createQuestion ({commit}, payload) {
      const db = firebase.firestore()
      const question = {
        id: payload.id,
        description: payload.description,
        assunto: payload.assunto,
        conhecimento: payload.conhecimento,
        conhecimentoPWR: payload.conhecimentoPWR,
        conhecimentoBWR: payload.conhecimentoBWR,
        respostas: payload.respostas
      }
      db.collection("questions").doc(question.id).set({
        description: question.description,
        assunto: question.assunto,
        conhecimento: question.conhecimento,
        conhecimentoPWR: question.conhecimentoPWR,
        conhecimentoBWR: question.conhecimentoBWR,
        respostas: question.respostas
        })
        .then(function() {
            console.log("Success")
        })
        .catch(function(error) {
            console.error("Error writing document: ", error);
        });
    },
    autoSignIn ({commit}, payload) {
      commit('setUser', {id: payload.uid})
    },
    clearError ({commit}) {
      commit('clearError')
    }
  },
  getters: {
    user (state) {
      return state.user
    },
    loading (state) {
      return state.loading
    },
    error (state) {
      return state.error
    }
  },
  modules: {
  }
})
