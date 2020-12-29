import { db, storage } from '../../main';

const initialState = () => ({
    loadedPapers: [],
    deletePaperId: null,
    papers: {},
    filteredPapers: [],
    currentPapersPage: [],
    lastPaperDocument: null
});

const state = initialState();

const mutations = {
    setLoadedPapers(state, data) {
        state.loadedPapers = data;
    },
    setPaperPage(state, data) {
        state.papers[data.page] = data.data;
    },
    setFilteredPapers(state, data) {
        state.filteredPapers = data;
    },
    resetFilteredPapers(state) {
        state.filteredPapers = [];
    },
    resetCurrentPapersPage(state) {
        state.currentPapersPage = [];
    },
    setCurrentPapersPage(state, data) {
        state.currentPapersPage = data;
    },
    createPaper(state, data) {
        const papers = state.papers[data.page] || [];
        papers.push(data.data);
        state.papers[data.page] = papers;
    },
    updatePaper(state, data) {
        const papers = state.loadedPapers;
        for(let key in papers) {
            if(papers[key]) {
                papers[key].forEach((item, index) => {
                    if(item.id === data.id) {
                        state.papers[key][index] = data;
                    }
                });
            }
        }
    },
    removePaper(state, data) {
        const papers = state.papers;
        for(let key in papers) {
            if(papers[key]) {
                papers[key].forEach((item, index) => {
                    if(item.id === data) {
                        state.papers[key].splice(index, 1);
                    }
                });
            }
        }
    },
    removeFilteredPaper(state, data) {
        const papers = state.filteredPapers;
        papers.forEach((item, index) => {
            if(item.id === data) {
                state.filteredPapers.splice(index, 1);
            }
        });
    },
    setLastPaperDocument(state, data) {
        state.lastPaperDocument = data;
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
    deletePaper({ commit }, payload) {
        commit('setLoading', true);
        const { id, isSearching } = payload;

        db.collection("papers").where('id', '==', id).get()
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
                commit('removePaper', id);

                if(isSearching) {
                    commit('removeFilteredPaper', id);
                }

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
    loadPaperPage({ commit, state }, payload) {
        commit('setLoading', true);

        const { page, itemsPerPage, type } = payload;
        const data = [];

        const pages = Object.keys(state.papers);

        if(!pages.includes('p' + page)) {
            let request = null;
            const ref = db.collection('papers').orderBy('id');

            if(type === 'next') {
                request = ref.startAfter(state.lastPaperDocument[1]).limit(itemsPerPage).get();
            } else {
                request = ref.endBefore(state.lastPaperDocument[0]).limitToLast(itemsPerPage).get();
            }

            let first = null,
                last = null;

            request.then(snapshot => {
                    first = snapshot.docs[0].data().id;
                    last = snapshot.docs[snapshot.docs.length - 1].data().id;

                    snapshot.forEach(doc => {
                        data.push(doc.data());
                    });
                })
                .then(() => {
                    commit('setCurrentPapersPage', data);
                    commit('setPaperPage', { page: 'p' + page, data });
                    commit('setLastPaperDocument', [first, last]);
                    commit('setLoading', false);
                })
                .catch(error => {
                    console.log(error);
                });
        } else {
            const pageContent = state.papers['p' + page];
            const first = pageContent[0].id;
            const last = pageContent[pageContent.length - 1].id;

            commit('setCurrentPapersPage', pageContent);
            commit('setLastPaperDocument', [first, last]);
            commit('setLoading', false);
        }
    },
    loadFOLPaperPage({ commit, state }, payload) {
        commit('setLoading', true);

        const { page, itemsPerPage, mode } = payload;
        const data = [];

        const pages = Object.keys(state.papers);

        if(!pages.includes('p' + page)) {
            let request = null;
            const ref = db.collection('papers').orderBy('id');

            if(mode === 'first') {
                request = ref.limit(itemsPerPage).get();
            } else {
                request = ref.limitToLast(itemsPerPage).get();
            }

            let first = null,
                last = null;

            request.then(snapshot => {
                    first = snapshot.docs[0].data().id;
                    last = snapshot.docs[snapshot.docs.length - 1].data().id;

                    snapshot.forEach(doc => {
                        data.push(doc.data());
                    });
                })
                .then(() => {
                    commit('setCurrentPapersPage', data);
                    commit('setPaperPage', { page: 'p' + page, data });
                    commit('setLastPaperDocument', [first, last]);
                    commit('setLoading', false);
                })
                .catch(error => {
                    console.log(error);
                });
        } else {
            const pageContent = state.papers['p' + page];
            const first = pageContent[0].id;
            const last = pageContent[pageContent.length - 1].id;

            commit('setCurrentPapersPage', pageContent);
            commit('setLastPaperDocument', [first, last]);
            commit('setLoading', false);
        }
    },
    searchPapers({ commit }, payload) {
        commit('setLoading', true);

        const data = [];

        db.collection('papers').orderBy('name')
            .where('name', '>=', payload.toLowerCase())
            .where('name', '<=', payload.toLowerCase() + '~')
            .get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    data.push(doc.data());
                });
            })
            .then(() => {
                db.collection('papers').orderBy('name')
                    .where('name', '>=', payload.toUpperCase())
                    .where('name', '<=', payload.toUpperCase() + '~')
                    .get()
                    .then(snapshot => {
                        const ids = data.map(t => t.id);
                        snapshot.forEach(doc => {
                            if(!ids.includes(doc.data().id)) {
                                data.push(doc.data());
                            }
                        });
                    });
            })
            .then(() => {
                db.collection('papers').orderBy('name')
                    .where('name', '>=', payload)
                    .where('name', '<=', payload + '~')
                    .get()
                    .then(snapshot => {
                        const ids = data.map(t => t.id);
                        snapshot.forEach(doc => {
                            if(!ids.includes(doc.data().id)) {
                                data.push(doc.data());
                            }
                        });
                    });
            })
            .then(() => {
                commit('setFilteredPapers', data);
                commit('setLoading', false);
            })
            .catch(error => {
                console.log(error);
            });
    },
    async paperExists(store, payload) {
        return new Promise((resolve, reject) => {
            try {
                db.collection('papers').where('name', '==', payload).get()
                    .then(snapshot => {
                        if(snapshot.docs.length > 0) resolve({ id: snapshot.docs[0].data().id, exist: true });
                        else resolve({ id: null, exist: false });
                    })
                    .catch(error => {
                        console.log(error);
                    });
            } catch {
                reject();
            }
        });
    },
    createPaper({ commit }, payload) {
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
    },
    getPapersByPage: state => page => {
        return state.papers['p' + page];
    },
    getCurrentPapersPage(state) {
        return state.currentPapersPage;
    },
    getFilteredPapers(state) {
        return state.filteredPapers;
    },
}

export default {
    state,
    mutations,
    actions,
    getters
}
