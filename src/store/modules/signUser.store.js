import axios from 'axios';

import { auth, db, storage } from '../../main';

const initialState = () => ({
    user: null,
    userInfo: null,
    userClaims: null,
    users: null
});

const state = initialState();

const mutations = {
    setUser(state, data) {
        state.user = data;
    },
    setUserInfo(state, data) {
        state.userInfo = data;
    },
    setUserClaims(state, data) {
        state.userClaims = data;
    },
    setUsers(state, data) {
        state.users = data;
    },
    setUserRole(state, data) {
        const { email, role } = data;
        const users = [];

        state.users.forEach(user => {
            if(user.email === email) {
                users.push({
                    ...user,
                    role
                });
            } else {
                users.push(user);
            }
        });

        state.users = [...users];
    },
    RESETUsers(state) {
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
                        student: true
                    }
                }

                let url = '';

                if(process.env.VUE_APP_FIREBASE_PROJECT_ID === 'pwr-quiz-generator-develop') {
                    url = 'http://localhost:5001/pwr-quiz-generator-develop/us-central1/authentication-userDefaultRole';
                } else if(process.env.VUE_APP_FIREBASE_PROJECT_ID === 'pwr-quiz-generator') {
                    url = 'https://us-central1-pwr-quiz-generator.cloudfunctions.net/authentication-userDefaultRole';
                } else {
                    url = 'https://us-central1-stage-pwr-quiz-generator.cloudfunctions.net/authentication-userDefaultRole';
                }

                db.collection("users").doc(newUser.id).set(userInfo)
                    .then(async () => {
                        axios.get(url, { headers: { uid: newUser.id } })
                            .catch(error => {
                                console.log(error);
                            });

                        db.collection('data-size').get()
                            .then(snap => {
                                const document = snap.docs[0];
                                const size = document.data().users;

                                document.ref.update({ users: size + 1 })
                                    .then(() => {
                                        commit('addRemoveSize', { key: 'users', data: size + 1 });
                                    })
                                    .catch(error => {
                                        console.log(error);
                                    });
                            })
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

        dispatch('deleteQuestions');
        dispatch('deleteRequests');
        dispatch('deletePapers');
        dispatch('deleteTests');
        dispatch('loadDataSize');
        dispatch('resetPapers');
        dispatch('resetQuestions');
        dispatch('resetRequests');
        dispatch('resetTests');

        auth.signInWithEmailAndPassword(payload.email, payload.password)
            .then(user => {
                    commit('setLoading', false);
                    const newUser = {
                        id: user.user.uid
                    }
                    commit('setUser', newUser);
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
    loadUsers({ commit }) {
        const users = [];

        db.collection('users').get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    users.push(doc.data());
                });
            })
            .then(() => {
                commit('setUsers', users);
            })
            .catch(error => {
                console.log(error + '');
            });
    },
    setUserRole({ commit }, payload) {
        commit('setLoading', true);

        const { email, role } = payload;

        let url = '';

        if(process.env.VUE_APP_FIREBASE_PROJECT_ID === 'pwr-quiz-generator-develop') {
            url = 'http://localhost:5001/pwr-quiz-generator-develop/us-central1/authentication-setRole';
        } else if(process.env.VUE_APP_FIREBASE_PROJECT_ID === 'pwr-quiz-generator') {
            url = 'https://us-central1-pwr-quiz-generator.cloudfunctions.net/authentication-setRole';
        } else {
            url = 'https://us-central1-stage-pwr-quiz-generator.cloudfunctions.net/authentication-setRole';
        }

        db.collection('users').where('email', '==', email).get()
            .then(snapshot => {
                const doc = snapshot.docs[0];

                doc.ref.update({ role });

                commit('setUserRole', payload);
                commit('setLoading', false);

                axios.post(url, {
                    data: {
                        email,
                        role
                    }
                })
                .catch(error => {
                    console.log('Auth error: ' + error);
                });
            })
            .catch(error => {
                console.log('Database error!');
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
    resetUsers({ commit }) {
        commit('RESETUsers');
    }
}

const getters = {
    user(state) {
        return state.user;
    },
    userInfo(state) {
        return state.userInfo;
    },
    users(state) {
        return state.users;
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
