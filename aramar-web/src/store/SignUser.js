import * as firebase from 'firebase'

export default {
  state: {
    user: null,
    userInfo: null,
  },
  mutations: {
    setUser(state, payload) {
      state.user = payload
    },
    setUserInfo(state, payload) {
      state.userInfo = payload
    }
  },
  actions: {
    uploadAvatar({ commit }, payload) {
      const puta = new Promise((resolve, reject) => {
        try {
          const storageRef = firebase.storage().ref()
          const file = payload.images
          var images = storageRef.child(file.name).put(file)
            .then(function (snapshot) {
              console.log("Uploaded a file!: ", snapshot)
              snapshot.ref.getDownloadURL().then(function (downloadURL) {
                console.log('File available at', downloadURL);
                resolve(downloadURL.toString())
              });
            })
            .catch(function (error) {
              console.error("Error uploading file", error)

              resolve(error)
            })
        } catch{
          reject()
        }
      })

      return puta
    },
    signUserUp({ commit }, payload) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
        .then(
          user => {
            console.log("User: ", user.user.uid)
            commit('setLoading', false)
            const newUser = {
              id: user.user.uid
            }
            const userInfo = {
              name: "",
              profileImages: "",
              email: payload.email
            }
            console.log("user id: ", newUser.id)
            const db = firebase.firestore()
            db.collection("users").doc(newUser.id).set({
              name: userInfo.name,
              profileImages: userInfo.profileImages,
              email: userInfo.email
            })
              .then(function () {
                console.log("Sucess User Firestore")
              })
              .catch(function (error) {
                commit('setLoading', false)
                commit('setError', error)
                console.error(error)
              })
            commit('setUser', newUser)
            commit('setUserInfo', userInfo)
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
    updateUser({ commit, state }, payload) {
      const userInfo = {
        name: payload.name,
        profileImages: payload.profileImages
      }
      const db = firebase.firestore()
      db.collection("users").doc(state.user.id).update({
        name: userInfo.name,
        profileImages: userInfo.profileImages
      })
        .then(function () {
          commit('setUserInfo', {
            name: userInfo.name,
            profileImages: userInfo.profileImages,
            email: state.userInfo.email
          })
          console.log("Sucess Update")
        })
        .catch(function (error) {
          commit('setLoading', false)
          commit('setError', error)
          console.error(error)
        })
    },
    signUserIn({ commit, dispatch }, payload) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
          .then(
              user => {
                  commit('setLoading', false)
                  const newUser = {
                      id: user.user.uid
                  }
                  commit('setUser', newUser)
                  console.log("newUser: ", newUser)
                  dispatch('loadUserInfo', newUser.id)
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
    loadUserInfo({ commit }, payload) {
      commit('setLoading', true)
      const db = firebase.firestore()
      let user = {}
      db.collection("users").get().then(querySnapshot => {
          querySnapshot.forEach(doc => {
              if( doc.id === payload){
                console.log("deu certo")
                user = doc.data()
              }
          })
          console.log("USer Info: ", user)
          commit('setUserInfo', user)
          commit('setLoading', false)
      })
    },
    logout({ commit }) {
      firebase.auth().signOut()
      commit('setUser', null)
    },
    autoSignIn({ commit, dispatch }, payload) {
      dispatch('loadUserInfo', payload.uid)
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
    userInfo(state) {
      return state.userInfo
    }
  }
}
