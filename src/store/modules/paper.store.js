import { db, storage } from '../../main';

const initialState = () => ({
    loadedPapers: [],
    deletePaperId: null
});

const state = initialState();

const mutations = {
    setLoadedPapers(state,payload) {
        state.loadedPapers = payload;
    },
    createPaper(state,payload) {
        state.loadedPapers.push(payload);
    },
    deletePaper(state,payload) {
        state.deletePaper = payload;
    },
    RESET(state) {
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
                const format = `documents/document-$${paperId}`;
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
        const id = payload;
        return db.collection("papers").where('id', '==', id).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    doc.ref.delete();
                    if(doc.data().image && doc.data().image.length > 0) {
                        const image = doc.data().image;
                        const childImage = image.split('?alt=media')[0].split('/o/')[1];
                        const child = decodeURIComponent(childImage);
                        storage.ref().child(child).delete();
                    }
                });
            })
            .then(() => {
                commit('setLoading', false);
                dispatch("loadedPapers");
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
                    papers.push(Object.assign({id: doc.data().id, data: doc.data()}));
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
        db.collection("papers").add(paper)
            .then(() => {
                commit('setLoading', false);
                dispatch("loadedPapers");
                console.log("Success");
            })
            .catch(error => {
                console.error("Error writing document: ", error);
            });
    },
    updatePaper({ commit, dispatch }, payload) {
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
                commit('setLoading', false);
                dispatch("loadedPapers");
                console.log("Success");
            })
            .catch(error => {
                console.error("Error writing document: ", error);
            });
    },
    reset({ commit }) {
        commit('RESET');
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
