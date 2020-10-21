import { auth, db, storage } from '../../main';

const initialState = () => ({
    user: null,
    userInfo: null,
});

const state = initialState();

const mutations = {
    setUser(state, payload) {
        state.user = payload
    },
    setUserInfo(state, payload) {
        state.userInfo = payload
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
                const prefix = 'avatar';
                const suffix = auth.currentUser.uid;
                const format = `users/${prefix}-${suffix}`;
                storageRef.child(format).put(file)
                    .then(function (snapshot) {
                        console.log("Uploaded a file!: ", snapshot)
                        snapshot.ref.getDownloadURL().then(function (downloadURL) {
                            console.log('File available at', downloadURL);
                            resolve(downloadURL.toString())
                        });
                    })
                    .catch(function (error) {
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
            .then(
                user => {
                    console.log("User: ", user.user.uid);
                    commit('setLoading', false);
                    const newUser = {
                        id: user.user.uid
                    }
                    const userInfo = {
                        name: "",
                        profileImages: "",
                        email: payload.email
                    }
                    console.log("user id: ", newUser.id);
                    db.collection("users").doc(newUser.id).set({
                        name: userInfo.name,
                        profileImages: userInfo.profileImages,
                        email: userInfo.email
                    })
                        .then(() => {
                            console.log("Sucess User Firestore");
                        })
                        .catch(error => {
                            commit('setLoading', false);
                            commit('setError', error);
                            console.error(error);
                        });
                    commit('setUser', newUser);
                    commit('setUserInfo', userInfo);
                    console.log('Success Auth');
                }
            )
            .catch(error => {
                    commit('setLoading', false);
                    commit('setError', error);
                    console.error(error);
                }
            );
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
                if( doc.id === payload) {
                    console.log("deu certo");
                    user = doc.data();
                }
            })
            console.log("USer Info: ", user);
            commit('setUserInfo', user);
            commit('setLoading', false);
        });
    },
    logout({ commit }) {
        auth.signOut();
        commit('setUser', null);
    },
    autoSignIn({ commit, dispatch }, payload) {
        dispatch('loadUserInfo', payload.uid);
        commit('setUser', { id: payload.uid });
    },
    user(state) {
        return state.user;
    },
    reset({ commit }) {
        commit('RESET');
    },
    moveImages(state) {
        return new Promise((resolve, reject) => {
            try {
                const storageRef = storage.ref();
                const check = 'keyboard';
                storageRef.child('').listAll().then(image => {
                    const items = image.items;

                    items.forEach(i => {
                        if(i.location.path.includes(check)) {
                            console.log(i);
                        }
                    })
                });
            } catch {
                reject();
            }
        });
    }
}

const getters = {
    user(state) {
        return state.user;
    },
    userInfo(state) {
        return state.userInfo;
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}
