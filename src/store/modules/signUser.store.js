import axios from 'axios';

import { auth, db, storage } from '../../main';
import { createErrorLog, showErrorMessage } from '../../utils/errors';

const initialState = () => ({
    user: null,
    userInfo: null,
    userClaims: null,
    users: []
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
                        snapshot.ref.getDownloadURL().then(function (downloadURL) {
                            resolve(downloadURL.toString())
                        });
                    })
                    .catch(error => {
                        const errorModel = showErrorMessage('connection', '', 'Avatar upload error - ' + error.message);
                        commit('setError', { message: errorModel });
                        createErrorLog('Avatar Upload', error.message, { payload, format, subfolder });
                    });
            } catch(error) {
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
                                console.error(error);
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
                                        console.error(error);
                                    });
                            })
                            .catch(error => {
                                console.error(error);
                            });
                    })
                    .catch(error => {
                        commit('setLoading', false);
                        commit('setError', error);
                        createErrorLog('Sign Up DB Insert', error.message, { payload, newUser, userInfo, url });
                    });

                commit('setUser', newUser);
                commit('setUserInfo', userInfo);
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('default', '', 'Sign up error - ' + error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Sign Up', error.message, { email: payload.email });

            });
    },
    updateUser({ commit, state }, payload) {
        commit('setLoading', true);

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
                    email: state.userInfo.email,
                    role: state.userInfo.role
                });
                commit('setLoading', false);
                commit('setSuccess', `'${userInfo.name || userInfo.email}' editado(a) com sucesso!`);
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('default', '', 'User update error - ' + error.message);
                commit('setError', { message: errorModel });
                createErrorLog('User DB Update', error.message, { payload });
            });
    },
    signUserIn({ commit, dispatch }, payload) {
        commit('setLoading', true);
        commit('clearError');
        commit('clearSuccess');

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
                    const errorModel = showErrorMessage('default', '', 'Login error - ' + error.message);
                    commit('setError', { message: errorModel });
                    createErrorLog('Login', error.message, { email: payload.email });
                }
            );
    },
    loadUserInfo({ commit }, payload) {
        commit('setLoading', true);
        db.collection("users").doc(payload).get()
            .then(doc => {
                commit('setUserInfo', { ...doc.data(), id: payload });
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
                const errorModel = showErrorMessage('load', 'User Claims', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('User Claims Load', error.message, { currentUser: auth.currentUser });
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
                const errorModel = showErrorMessage('load', 'Usuários', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Users Load', error.message, { users });
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
                commit('setSuccess', `'${doc.data().name || email}' editado(a) com sucesso!`);

                axios.post(url, {
                    data: {
                        email,
                        role
                    }
                })
                .catch(error => {
                    commit('setError', error);
                })
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('edition', 'Cargo de Usuário', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('User Role Update', error.message, { payload, url });
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
