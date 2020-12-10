const axios = require('axios');

import { auth, db, storage } from '../../main';

const initialState = () => ({
    user: null,
    userInfo: null,
    userClaims: null
});

const state = initialState();

const mutations = {
    setUser(state, payload) {
        state.user = payload;
    },
    setUserInfo(state, payload) {
        state.userInfo = payload;
    },
    setUserClaims(state, payload) {
        state.userClaims = payload;
    },
    RESET(state) {
        const newState = initialState();
        Object.keys(newState).forEach(key => {
            state[key] = newState[key];
        });
    }
}

const actions = {
    uploadAvatar({ commit }, payload) {
        const request = new Promise((resolve, reject) => {
            try {
                const storageRef = storage.ref();
                const file = payload.images;
                const name = 'avatar';
                const subfolder = auth.currentUser.uid;
                const type = file.type.split('/')[1];
                const format = `users/${subfolder}/${name}.${type}`;
                storageRef.child(format).put(file)
                    .then(snapshot => {
                        console.log("Uploaded a file!: ", snapshot)
                        snapshot.ref.getDownloadURL().then(function (downloadURL) {
                            console.log('File available at', downloadURL);
                            resolve(downloadURL.toString())
                        });
                    })
                    .catch(error => {
                        console.error("Error uploading file", error);
                        resolve(error);
                    });
            } catch {
                reject();
            }
        });
        return request;
    },
    signUserUp({ commit }, payload) {
        commit('setLoading', true);
        commit('clearError');
        auth.createUserWithEmailAndPassword(payload.email, payload.password)
            .then(user => {
                commit('setLoading', false);
                const newUser = {
                    id: user.user.uid
                }
                const userInfo = {
                    name: payload.name,
                    profileImages: '',
                    email: payload.email,
                    role: {
                        common: true
                    }
                }

                let url = '';

                if(process.env.NODE_ENV === 'development') {
                    url = 'http://localhost:5001/pwr-quiz-generator-develop/us-central1/authentication-userDefaultRole';
                } else if(process.env.NODE_ENV === 'production') {
                    url = 'http://localhost:5001/pwr-quiz-generator/us-central1/authentication-userDefaultRole';
                };

                db.collection("users").doc(newUser.id).set(userInfo)
                    .then(async () => {
                        axios.get(url, { headers: { uid: newUser.id } })
                            .catch(error => {
                                console.log(error);
                            });
                    })
                    .catch(error => {
                        commit('setLoading', false);
                        commit('setError', error);
                        console.error(error);
                    });

                commit('setUser', newUser);
                commit('setUserInfo', userInfo);
                console.log('Success Auth');
            })
            .catch(error => {
                commit('setLoading', false);
                commit('setError', error);
                console.error(error);
            });
    },
    updateUser({ commit, state }, payload) {
        const userInfo = {
            name: payload.name,
            profileImages: payload.profileImages
        }
        db.collection("users").doc(state.user.id).update({
            name: userInfo.name,
            profileImages: userInfo.profileImages
        })
            .then(() => {
                commit('setUserInfo', {
                    name: userInfo.name,
                    profileImages: userInfo.profileImages,
                    email: state.userInfo.email
                });
                console.log("Sucess Update");
            })
            .catch(error => {
                commit('setLoading', false);
                commit('setError', error);
                console.error(error);
            })
    },
    signUserIn({ commit, dispatch }, payload) {
        commit('setLoading', true);
        commit('clearError');
        auth.signInWithEmailAndPassword(payload.email, payload.password)
            .then(user => {
                    commit('setLoading', false);
                    const newUser = {
                        id: user.user.uid
                    }
                    commit('setUser', newUser);
                    console.log("newUser: ", newUser);
                    dispatch('loadUserInfo', newUser.id);
                }
            )
            .catch(error => {
                    commit('setLoading', false);
                    commit('setError', error);
                    console.log(error);
                }
            );
    },
    loadUserInfo({ commit }, payload) {
        commit('setLoading', true);
        let user = {};
        db.collection("users").get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                if(doc.id === payload) {
                    user = doc.data();
                }
            });
            commit('setUserInfo', user);
            commit('setLoading', false);
        });
    },
    loadUserClaims({ commit }) {
        auth.currentUser && auth.currentUser.getIdTokenResult()
            .then(idTokenResult => {
                if(idTokenResult.claims) {
                    commit('setUserClaims', idTokenResult.claims);
                }
            })
            .catch(error => {
                console.log(error);
            });
    },
    logout({ commit }) {
        auth.signOut();
        commit('setUser', null);
    },
    autoSignIn({ commit, dispatch }, payload) {
        dispatch('loadUserInfo', payload.uid);
        dispatch('loadUserClaims');
        commit('setUser', { id: payload.uid });
    },
    user(state) {
        return state.user;
    },
    reset({ commit }) {
        commit('RESET');
    }
}

const getters = {
    user(state) {
        return state.user;
    },
    userInfo(state) {
        return state.userInfo;
    },
    getUserClaims(state) {
        return state.userClaims;
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}
