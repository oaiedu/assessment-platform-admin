import { db, storage } from '../../main';
import { getNowISOString } from '../../utils/date';
import { createErrorLog, showErrorMessage } from '../../utils/errors';

const initialState = () => ({
    deletePaperId: null,
    papers: {},
    filteredPapers: [],
    currentPapersPage: [],
    lastPaperDocument: null,
    deleteMarkPapers: [],
    lastPapers: []
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
    setLastPapers(state, data) {
        state.lastPapers = data;
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
    addDeleteMarkPaper(state, data) {
        state.deleteMarkPapers.push(data);
    },
    updateDeleteMarkPaper(state, data) {
        const papers = [...state.deleteMarkPapers];
        papers.forEach((item, index) => {
            if(item.id === data.id) {
                papers[index] = data;
            }
        });
        state.deleteMarkPapers = papers;
    },
    removeDeleteMarkPaper(state, data) {
        const papers = [...state.deleteMarkPapers];
        papers.forEach((item, index) => {
            if(item.id === data) {
                state.deleteMarkPapers.splice(index, 1);
            }
        })
    },
    setDeleteMarkPapers(state, data) {
        state.deleteMarkPapers = data;
    },
    setDeleteMarkPaper(state, data) {
        const papers = state.papers;
        for(let key in papers) {
            if(papers[key]) {
                papers[key].forEach((item, index) => {
                    if(item.id === data.id) {
                        state.papers[key][index] = { ...item, toDelete: data.toDelete };
                    }
                });
            }
        }
    },
    setDeleteMarkFilteredPaper(state, data) {
        const papers = [...state.filteredPapers];
        papers.forEach((item, index) => {
            if(item.id === data.id) {
                papers[index] = { ...item, toDelete: data.toDelete };
            }
        });
        state.filteredPapers = papers;
    },
    createPaper(state, data) {
        const page = data.page;
        const papers = state.papers['p' + page] || [];
        const amount = data.amount;
        const oneBefore = state.papers['p' + (page - 1)] || [];
        if(papers.length > 0 || oneBefore.length === 8 || amount === 0) {
            papers.push(data.data);
            state.papers['p' + page] = [...papers];
            if(amount === 0) {
                state.currentPapersPage.push(data.data);
            }
        }
    },
    updatePaper(state, data) {
        const papers = {...state.papers};
        for(let key in papers) {
            if(papers[key]) {
                papers[key].forEach((item, index) => {
                    if(item.id === data.id) {
                        papers[key][index] = data;
                    }
                });
            }
        }
        state.papers = papers;
    },
    updateFilteredPaper(state, data) {
        const papers = [...state.filteredPapers];
        papers.forEach((item, index) => {
            if(item.id === data.id) {
                papers[index] = data;
            }
        });
        state.filteredPapers = papers;
    },
    updateCurrentPapersPage(state, data) {
        const papers = [...state.currentPapersPage];
        papers.forEach((item, index) => {
            if(item.id === data.id) {
                papers[index] = data;
            }
        });
        state.currentPapersPage = papers;
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
                        snapshot.ref.getDownloadURL().then(downloadURL => {
                            resolve(downloadURL.toString());
                        });
                    })
                    .catch(error => {
                        const errorModel = showErrorMessage('connection', '', 'Image upload error - ' + error.message);
                        commit('setError', { message: errorModel });
                        createErrorLog('Docs Image Upload', error.message, { payload, format });
                    });
            } catch(error) {
                reject('Paper Image Upload Error');
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
                                    console.error(error);
                                });
                        })
                        .catch(error => {
                            console.error(error);
                        });
                });
            })
            .then(() => {
                commit('removePaper', id);

                if(isSearching) {
                    commit('removeFilteredPaper', id);
                }

                commit('setLoading', false);
                commit('setSuccess', 'Documento excluído com sucesso!');
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('exclusion', 'Documento', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Document Delete', error.message, { payload });
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
                    commit('setLoading', false);
                    const errorModel = showErrorMessage('load', 'Documentos', error.message);
                    commit('setError', { message: errorModel });
                    createErrorLog('Document Page Load', error.message, { payload, data });
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

        const paperAmount = this.getters.getDataSize.papers;
        const amount = paperAmount % 10;

        if(!pages.includes('p' + page)) {
            let request = null;
            const ref = db.collection('papers').orderBy('id');

            if(mode === 'first') {
                request = ref.limit(itemsPerPage).get();
            } else {
                request = ref.limitToLast(amount || 10).get();
            }

            let first = null,
                last = null;

            request.then(snapshot => {
                    if(snapshot.docs.length > 0) {
                        first = snapshot.docs[0].data().id;
                        last = snapshot.docs[snapshot.docs.length - 1].data().id;

                        snapshot.forEach(doc => {
                            data.push(doc.data());
                        });
                    }
                })
                .then(() => {
                    if(data.length > 0) {
                        commit('setCurrentPapersPage', data);
                        commit('setPaperPage', { page: 'p' + page, data });
                        commit('setLastPaperDocument', [first, last]);
                    }
                    commit('setLoading', false);
                })
                .catch(error => {
                    commit('setLoading', false);
                    const errorModel = showErrorMessage('load', 'Documentos', error.message);
                    commit('setError', { message: errorModel });
                    createErrorLog('Document FOL Page Load', error.message, { payload, data });
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
            .where('name', '>=', payload)
            .where('name', '<=', payload + '~')
            .get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    data.push(doc.algo.data());
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
                    .where('name', '>=', payload.toLowerCase())
                    .where('name', '<=', payload.toLowerCase() + '~')
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
                commit('setLoading', false);
                const errorModel = showErrorMessage('load', 'Documentos', 'Searching error - ' + error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Document Searching', error.message, { payload, data });
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
                        const errorModel = showErrorMessage('connection', '', error.message);
                        commit('setError', { message: errorModel });
                        createErrorLog('Document Exist Test', error.message, { payload });
                    });
            } catch(error) {
                reject();
            }
        });
    },
    checkDeleteMarkPapers({ commit }) {
        const data = [];

        db.collection('papers').where('toDelete.status', '==', true).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    data.push(doc.data());
                });
            })
            .then(() => {
                commit('setDeleteMarkPapers', data);
            })
            .catch(error => {
                const errorModel = showErrorMessage('connection', '', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Document Mark Check', error.message, { data });
            });
    },
    deleteMarkPaper({ commit }, payload) {
        commit('setLoading', true);

        const { id, isSearching, userEmail } = payload;

        db.collection('papers').where('id', '==', id).get()
            .then(snapshot => {
                const doc = snapshot.docs[0];

                const toDelete = {
                    status: true,
                    userEmail
                }

                doc.ref.update({ toDelete });

                commit('setDeleteMarkPaper', { id, toDelete });

                if(isSearching) {
                    commit('setDeleteMarkFilteredPaper', { id, toDelete });
                }

                commit('updateCurrentPapersPage', { ...doc.data(), toDelete });
                commit('addDeleteMarkPaper', { ...doc.data(), toDelete });
                commit('setLoading', false);
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('connection', '', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Document Delete Mark', error.message, { payload });
            });
    },
    restoreMarkedPaper({ commit }, payload) {
        commit('setLoading', true);

        const { id, isSearching } = payload;

        db.collection('papers').where('id', '==', id).get()
            .then(snapshot => {
                const doc = snapshot.docs[0];
                const data = doc.data();

                const paper = {
                    id: data.id,
                    image: data.image,
                    description: data.description,
                    name: data.name
                }

                doc.ref.set(paper);
                commit('updatePaper', paper);

                if(isSearching) {
                    commit('updateFilteredPaper', paper);
                }

                commit('removeDeleteMarkPaper', id);
                commit('updateCurrentPapersPage', paper);
                commit('setLoading', false);
                commit('setSuccess', 'Documento restaurado com sucesso!');
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('connection', '', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Document Restore', error.message, { payload });
            });
    },
    restoreAllMarkedPapers({ commit, state }, payload) {
        commit('setLoading', true);

        const { all, isSearching, user } = payload;

        const ref = db.collection('papers').where('toDelete.status', '==', true);
        let request = null;

        if(all) {
            request = ref;
        } else {
            request = ref.where('toDelete.userEmail', '==', user.email);
        }

        request.get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    const data = doc.data();

                    const paper = {
                        id: data.id,
                        image: data.image,
                        description: data.description,
                        name: data.name
                    }

                    doc.ref.set(paper);
                    if(all) {
                        const falseMarkedPapers = state.deleteMarkPapers.filter(t => !t.toDelete.status);
                        commit('setDeleteMarkPapers', falseMarkedPapers);
                    } else {
                        const markedPapers = state.deleteMarkPapers.filter(t => t.id !== paper.id);
                        commit('setDeleteMarkPapers', markedPapers);
                    }
                    commit('updatePaper', paper);
                    commit('updateCurrentPapersPage', paper);
                    if(isSearching) commit('updateFilteredPaper', paper);
                    commit('setSuccess', 'Documentos restaurados com sucesso!');
                });
            })
            .then(() => commit('setLoading', false))
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('connection', '', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Document Restore All', error.message, { payload });
            });
    },
    changeDeleteStatusPapers({ commit }, payload) {
        commit('setLoading', true);
        const { id, isSearching } = payload;

        db.collection('papers').where('id', '==', id).get()
            .then(snapshot => {
                const doc = snapshot.docs[0];
                const toDelete = {
                    status: false
                }

                doc.ref.update({ ...doc.data(), toDelete });

                db.collection('paper-names').get()
                    .then(snapNames => {
                        const docNames = snapNames.docs[0];
                        const dPapers = docNames.data().papers;
                        let newPapers = [...dPapers];

                        dPapers.forEach((p, i) => {
                            if(p.id === id) {
                                newPapers.splice(i, 1);
                            }
                        });

                        docNames.ref.update({ papers: newPapers });
                    })
                    .catch(error => {
                        console.error(error);
                    });

                commit('updateCurrentPapersPage', { ...doc.data(), toDelete });
                commit('updatePaper', { ...doc.data(), toDelete });
                commit('updateDeleteMarkPaper', { ...doc.data(), toDelete });
                if(isSearching) commit('updateFilteredPaper', { ...doc.data(), toDelete });

                commit('setLoading', false);
                commit('setSuccess', 'Documento excluído com sucesso!');
            })
            .catch(error => {
                const errorModel = showErrorMessage('exclusion', 'Documento', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Document Confirm Delete', error.message, { payload });
            });
    },
    deletePapers({ commit }) {
        const data = [];
        db.collection("papers").where('toDelete.status', '==', false).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    doc.ref.delete();
                    data.push(doc.data());
                    if(doc.data().image && doc.data().image.length > 0) {
                        const image = doc.data().image;
                        const childImage = image.split('?alt=media')[0].split('/o/')[1];
                        const child = decodeURIComponent(childImage);
                        storage.ref().child(child).delete();
                    }
                });

                db.collection('data-size').get()
                    .then(snap => {
                        const document = snap.docs[0];
                        const size = document.data().papers;

                        document.ref.update({ papers: size - snapshot.docs.length });
                        commit('addRemoveSize', { key: 'papers', data: size - snapshot.docs.length });
                    })
                    .catch(error => {
                        console.error(error);
                    });
            })
            .catch(error => {
                console.error("Error removing document: ", error);
                createErrorLog('Document DB Delete', error.message, { data });
            });
    },
    createPaper({ commit }, payload) {
        commit('setLoading', true);

        const createdDate = getNowISOString();

        const paper = {
            id: payload.paperId,
            name: payload.paperName,
            image: payload.paperImage,
            description: payload.paperDescription,
            created: createdDate,
            updated: createdDate
        }

        const paperAmount = this.getters.getDataSize.papers;
        const pageAmount = Math.ceil(paperAmount / 10);
        const amount = paperAmount % 10;

        db.collection("papers").add(paper)
            .then(() => {
                commit('createPaper', {
                    page: (amount === 10 || amount === 0 ? pageAmount + 1 : pageAmount),
                    data: paper,
                    amount: paperAmount
                });
                commit('setLoading', false);

                db.collection('data-size').get()
                    .then(snap => {
                        const document = snap.docs[0];
                        const size = document.data().papers;

                        document.ref.update({ papers: size + 1 })
                            .then(() => {
                                commit('addRemoveSize', { key: 'papers', data: size + 1 });
                                commit('setSuccess', 'Documento criado com sucesso!');
                            })
                            .catch(error => {
                                console.error(error);
                            });
                    })
                    .catch(error => {
                        console.error(error);
                    });
            })
            .then(() => {
                db.collection('paper-names').get()
                    .then(snapshot => {
                        const doc = snapshot.docs[0];
                        const dPapers = doc.data().papers;

                        dPapers.push({ id: paper.id, name: paper.name });
                        doc.ref.update({ papers: dPapers });
                    })
                    .catch(error => {
                        console.error(error);
                    });
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('creation', 'Document', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Document DB Insert', error.message, { payload });
            });
    },
    updatePaper({ commit }, payload) {
        const paper = {
            ...payload,
            updated: getNowISOString()
        }

        db.collection("papers").where('id', '==', paper.id).get()
            .then(snapshot => {
                const doc = snapshot.docs[0];
                doc.ref.update(paper);

                db.collection('paper-names').get()
                    .then(snapNames => {
                        const docNames = snapNames.docs[0];
                        const dPapers = docNames.data().papers;
                        let newPapers = [...dPapers];

                        dPapers.forEach((p, i) => {
                            if(p.id === paper.id) {
                                newPapers[i] = { id: paper.id, name: paper.name };
                            }
                        });

                        docNames.ref.update({ papers: newPapers });
                    })
                    .catch(error => {
                        console.error(error);
                    });

                commit('updatePaper', paper);
                commit('updateCurrentPapersPage', paper);
                commit('setLoading', false);
                commit('setSuccess', 'Documento editado com sucesso!');
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('edition', 'Document', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Document DB Update', error.message, { payload });
            });
    },
    async getPaperNames({ commit }) {
        return new Promise((resolve, reject) => {
            try {
                db.collection('paper-names').get()
                    .then(snapshot => {
                        const data = snapshot.docs[0].data();
                        resolve(data.papers);
                    })
                    .catch(error => {
                        console.error(error);
                    });
            } catch(error) {
                reject('getPaperNames error');
            }
        });
    },
    async getPaperById({ commit }, payload) {
        const id = payload;

        return new Promise((resolve, reject) => {
            try {
                db.collection('papers').where('id', '==', id).get()
                    .then(snapshot => {
                        const doc = snapshot.docs[0];
                        resolve(doc.data());
                    })
                    .catch(error => {
                        const errorModel = showErrorMessage('load', 'Documento', error.message);
                        commit('setError', { message: errorModel });
                        createErrorLog('Document ID Load', error.message, { data });
                    });
            } catch(error) {
                reject('getPaperById error')
            }
        });
    },
    loadLastPapers({ commit }) {
        commit('setLoading', true);

        const data = [];

        db.collection('papers').orderBy('updated', 'desc').limit(6).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    data.push(doc.data());
                });
            })
            .then(() => {
                commit('setLastPapers', data);
                commit('setLoading', false);
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('load', 'Documentos', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Last Documents Loading', error.message, { data });
            })
    },
    resetPapers({ commit }) {
        commit('RESETPapers');
    }
}

const getters = {
    getPapers(state) {
        return state.papers;
    },
    getDeleteMarkPapers(state) {
        return state.deleteMarkPapers;
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
    getLastPapers(state) {
        return state.lastPapers;
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}
