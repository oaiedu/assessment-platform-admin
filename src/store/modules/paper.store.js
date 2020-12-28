import { db, storage } from '../../main';

const initialState = () => ({
    loadedPapers: [],
    deletePaperId: null
});

const state = initialState();

const mutations = {
    setLoadedPapers(state, payload) {
        state.loadedPapers = payload;
    },
    createPaper(state, payload) {
        state.loadedPapers.push(payload);
    },
    updatePaper(state, payload) {
        const papers = state.loadedPapers;
        for(let index = 0; index < papers.length; index++) {
            if(papers[index].id === payload.id) {
                state.loadedPapers[index] = payload;
            }
        }
    },
    removePaper(state, payload) {
        const index = state.loadedPapers.indexOf(payload);
        if(index !== -1) {
            state.loadedPapers.splice(index, 1);
        }
    },
    RESETPapers(state) {
        const newState = initialState();
        Object.keys(newState).forEach(key => {
            state[key] = newState[key];
        });
    }
}

const actions = {
    uploadImagePaper({ commit }, payload) {
        const request = new Promise((resolve,reject) => {
            try {
                const storageRef = storage.ref();
                const file = payload.images;
                const paperId = payload.id;
                const type = file.type.split('/')[1];
                const format = `documents/document-$${paperId}.${type}`;
                storageRef.child(format).put(file)
                    .then(snapshot => {
                        console.log("Uploaded a file!: ", snapshot)
                        snapshot.ref.getDownloadURL().then(downloadURL => {
                            console.log('File available at', downloadURL);
                            resolve(downloadURL.toString());
                        });
                    })
                    .catch(error => {
                        console.error("Error uploading file", error);
                        resolve(error);
                    });
            } catch{
                reject();
            }
        });
        return request;
    },
    deletePaper({ commit, dispatch }, payload) {
        commit('setLoading', true);
        db.collection("papers").where('id', '==', payload.id).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    doc.ref.delete();
                    if(doc.data().image && doc.data().image.length > 0) {
                        const image = doc.data().image;
                        const childImage = image.split('?alt=media')[0].split('/o/')[1];
                        const child = decodeURIComponent(childImage);
                        storage.ref().child(child).delete();
                    }

                    db.collection('data-size').get()
                        .then(snap => {
                            const document = snap.docs[0];
                            const size = document.data().papers;

                            document.ref.update({ papers: size - 1 })
                                .then(() => {
                                    commit('addRemoveSize', { key: 'papers', data: size - 1 });
                                })
                                .catch(error => {
                                    console.log(error);
                                });
                        })
                        .catch(error => {
                            console.log(error);
                        });
                });
            })
            .then(() => {
                commit('removePaper', payload);
                commit('setLoading', false);
                console.log("Document successfully deleted!");
            })
            .catch(function (error) {
                console.error("Error removing document: ", error);
            });
    },
    loadedPapers({ commit }) {
        commit('setLoading', true);
        let papers = [];
        db.collection("papers").get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    papers.push(doc.data());
            });
            commit('setLoadedPapers', papers);
            commit('setLoading', false);
        });
    },
    createPaper({ commit, dispatch }, payload) {
        const paper = {
            id: payload.paperId,
            name: payload.paperName,
            image: payload.paperImage,
            description: payload.paperDescription
        }
        console.log(paper);
        db.collection("papers").add(paper)
            .then(() => {
                commit('createPaper', paper);
                commit('setLoading', false);

                db.collection('data-size').get()
                    .then(snap => {
                        const document = snap.docs[0];
                        const size = document.data().papers;

                        document.ref.update({ papers: size + 1 })
                            .then(() => {
                                commit('addRemoveSize', { key: 'papers', data: size + 1 });
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
                console.error("Error writing document: ", error);
            });
    },
    updatePaper({ commit }, payload) {
        const paper = {
            name: payload.paperName,
            image: payload.paperImage,
            description: payload.paperDescription,
            id: payload.paperId
        }
        db.collection("papers").where('id', '==', paper.id).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    doc.ref.update(paper);
                });
            })
            .then(() => {
                commit('updatePaper', paper);
                commit('setLoading', false);
                console.log("Success");
            })
            .catch(error => {
                console.error("Error writing document: ", error);
            });
    },
    resetPapers({ commit }) {
        commit('RESETPapers');
    }
}

const getters = {
    loadedPapers(state) {
        return state.loadedPapers;
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}
