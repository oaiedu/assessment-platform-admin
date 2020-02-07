import * as firebase from 'firebase'

export default {
    state: {
        user: null,
        userNamer: null,
        userProfileImage: null
    },
    mutations: {
        setUser(state, payload) {
            state.user = payload
        },
    },
    actions: {
        signUserUp({ commit }, payload) {
            commit('setLoading', true)
            commit('clearError')
            firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
                .then(
                    user => {
                        console.log("USer: ",user.user.uid)
                        commit('setLoading', false)
                        const newUser = {
                            id: user.user.uid
                        }
                        console.log("user id: ",newUser.id)
                        const db = firebase.firestore()
                        db.collection("users").doc(newUser.id).set({
                          name: "",
                          profileImages: {}
                        })
                          .then( function () {
                            console.log("Sucess User Firestore")
                          })
                          .catch( function (error) {
                            commit('setLoading', false)
                            commit('setError', error)
                            console.error(error)
                          })
                        commit('setUser', newUser)
                        console.log('Success Auth')
                    }
                )
                .catch(
                    error => {
                        commit('setLoading', false)
                        commit('setError', error)
                        console.error(error)
                    }
                )

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
        autoSignIn({ commit }, payload) {
            commit('setUser', { id: payload.uid })
        },
        user(state) {
            return state.user
        },
    },
    getters: {
        user(state) {
            return state.user
        },
    }
}
