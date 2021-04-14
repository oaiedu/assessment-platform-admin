import { db, storage } from '../../main';
import { createErrorLog, showErrorMessage } from '../../utils/errors';

const initialState = () => ({
    questionRequests: [],
    requests: {},
    filteredRequests: [],
    currentRequestsPage: [],
    lastRequestDocument: null,
    deleteMarkQuestions: []
});

const state = initialState();

const mutations = {
    setRequests(state, data) {
        state.requests = data;
    },
    setRequestPage(state, data) {
        state.requests[data.page] = data.data;
    },
    setFilteredRequests(state, data) {
        state.filteredRequests = data;
    },
    resetFilteredRequests(state) {
        state.filteredRequests = [];
    },
    resetCurrentRequestsPage(state) {
        state.currentRequestsPage = [];
    },
    setCurrentRequestsPage(state, data) {
        state.currentRequestsPage = data;
    },
    addDeleteMarkRequest(state, data) {
        state.deleteMarkRequests.push(data);
    },
    updateDeleteMarkRequest(state, data) {
        const requests = [...state.deleteMarkRequests];
        requests.forEach((item, index) => {
            if(item.iq === data.iq) {
                requests[index] = data;
            }
        });
        state.deleteMarkRequests = requests;
    },
    removeDeleteMarkRequest(state, data) {
        const requests = [...state.deleteMarkRequests];
        requests.forEach((item, index) => {
            if(item.iq === data) {
                state.deleteMarkRequests.splice(index, 1);
            }
        })
    },
    setDeleteMarkRequests(state, data) {
        state.deleteMarkRequests = data;
    },
    setDeleteMarkRequest(state, data) {
        const requests = state.requests;
        for(let key in requests) {
            if(requests[key]) {
                requests[key].forEach((item, index) => {
                    if(item.iq === data.iq) {
                        state.requests[key][index] = { ...item, toDelete: data.toDelete };
                    }
                });
            }
        }
    },
    setDeleteMarkFilteredRequest(state, data) {
        const requests = [...state.filteredRequests];
        requests.forEach((item, index) => {
            if(item.iq === data.iq) {
                requests[index] = { ...item, toDelete: data.toDelete };
            }
        });
        state.filteredRequests = requests;
    },
    addRequest(state, data) {
        const page = data.page;
        const requests = state.requests['p' + page] || [];
        const amount = data.amount;
        const oneBefore = state.requests['p' + (page - 1)] || [];
        if(requests.length > 0 || oneBefore.length === 8 || amount === 0) {
            requests.push(data.data);
            state.requests['p' + page] = [...requests];
            if(amount === 0) {
                state.currentRequestsPage.push(data.data);
            }
        }
    },
    updateRequest(state, data) {
        const requests = state.requests;
        for(let key in requests) {
            if(requests[key]) {
                requests[key].forEach((item, index) => {
                    if(item.iq === data.iq) {
                        state.requests[key][index] = { ...data, user: item.user };
                    }
                });
            }
        }
    },
    updateFilteredRequest(state, data) {
        const requests = [...state.filteredRequests];
        requests.forEach((item, index) => {
            if(item.iq === data.iq) {
                requests[index] = data;
            }
        });
        state.filteredRequests = requests;
    },
    updateCurrentRequestsPage(state, data) {
        const requests = [...state.currentRequestsPage];
        requests.forEach((item, index) => {
            if(item.iq === data.iq) {
                requests[index] = data;
            }
        });
        state.currentRequestsPage = requests;
    },
    removeRequest(state, data) {
        const requests = state.requests;
        for(let key in requests) {
            if(requests[key]) {
                requests[key].forEach((item, index) => {
                    if(item.iq === data) {
                        state.requests[key].splice(index, 1);
                    }
                });
            }
        }
    },
    removeFilteredRequest(state, data) {
        const request = state.filteredRequests;
        request.forEach((item, index) => {
            if(item.iq === data) {
                state.filteredRequests.splice(index, 1);
            }
        });
    },
    setLastRequestDocument(state, data) {
        state.lastRequestDocument = data;
    },
    RESETRequests(state) {
        const newState = initialState();
        Object.keys(newState).forEach(key => {
            state[key] = newState[key];
        });
    }
}

const actions = {
    createQuestionRequest({ commit }, payload) {
        commit('setLoading', true);

        const request = {
            iq: payload.iq,
            user: {
                name: payload.name,
                email: payload.email
            },
            status: payload.status,
            question: payload.question,
            subject: payload.subject,
            knowledge: payload.knowledge,
            knowledgePWR: payload.knowledgePWR,     // RELEVANCIA_OR
            knowledgeBWR: payload.knowledgeBWR,     // RELEVANCIA_OSR
            answers: payload.answers,
            image: payload.image,
            imageSize: payload.imageSize,
            edited: []
        }

        const requestAmount = this.getters.getDataSize['question-requests'].users[payload.email];
        const pageAmount = Math.ceil(requestAmount / 8);
        const amount = requestAmount % 8;

        db.collection('question-requests').add(request)
            .then(() => {
                commit('addRequest', { page: (amount === 8 || amount === 0 ? pageAmount + 1 : pageAmount), data: request });
                commit('setLoading', false);
                commit('setSuccess', 'Solicitação criada com sucesso!');

                db.collection('data-size').get()
                    .then(snap => {
                        const document = snap.docs[0];
                        const general = document.data()['question-requests'].general;
                        const email = request.user.email;
                        const subSize = document.data()['question-requests'].users[email];

                        const questionRequests = {
                            general: general + 1,
                            users: {
                                ...document.data()['question-requests'].users,
                                [email]: subSize + 1
                            }
                        }

                        document.ref.update({ ['question-requests']: questionRequests })
                            .then(() => {
                                commit('addRemoveSize', { key: 'question-requests', data: questionRequests });
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
                const errorModel = showErrorMessage('creation', 'Solicitação', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Request DB Insert', new Date().toISOString(), error.message, { payload, requestAmount });
            });
    },
    updateQuestionRequest({ commit }, payload) {
        commit('setLoading', true);
        const { mode, request } = payload;

        db.collection('question-requests').where('iq', '==', request.iq).get()
            .then(snapshot => {
                if(mode === 'sttUpdate') {
                    snapshot.docs[0].ref.update({ status: payload.status })
                        .then(() => {
                            request.status = payload.status;
                            commit('updateRequest', request);
                            commit('updateCurrentRequestsPage', request);
                            commit('setLoading', false);
                        });
                } else {
                    snapshot.docs[0].ref.update(request)
                        .then(() => {
                            commit('updateRequest', request);
                            commit('updateCurrentRequestsPage', request);
                            commit('setLoading', false);
                            commit('setSuccess', 'Solicitação editada com sucesso!');
                        });
                }
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('edition', 'Solicitação', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Request DB Update', new Date().toISOString(), error.message, { payload });
            });
    },
    loadRequestPage({ commit, state }, payload) {
        commit('setLoading', true);

        const { claims, page, itemsPerPage, type, userInfo } = payload;
        const data = [];
        const pages = Object.keys(state.requests);

        if(!pages.includes('p' + page)) {
            let request = null;
            let ref = null;

            if(claims['admin']) {
                ref = db.collection('question-requests').orderBy('iq');
            } else {
                ref = db.collection('question-requests').orderBy('iq').where('user.email', '==', userInfo.email);
            }

            if(type === 'next') {
                request = ref.startAfter(state.lastRequestDocument[1]).limit(itemsPerPage).get();
            } else {
                request = ref.endBefore(state.lastRequestDocument[0]).limitToLast(itemsPerPage).get();
            }

            let first = null,
                last = null;

            request.then(snapshot => {
                    first = snapshot.docs[0].data().iq;
                    last = snapshot.docs[snapshot.docs.length - 1].data().iq;

                    snapshot.forEach(doc => {
                        data.push(doc.data());
                    });
                })
                .then(() => {
                    commit('setCurrentRequestsPage', data);
                    commit('setRequestPage', { page: 'p' + page, data });
                    commit('setLastRequestDocument', [first, last]);
                    commit('setLoading', false);
                })
                .catch(error => {
                    commit('setLoading', false);
                    const errorModel = showErrorMessage('load', 'Solicitações', error.message);
                    commit('setError', { message: errorModel });
                    createErrorLog('Request Page Load', new Date().toISOString(), error.message, { payload, data });
                });
        } else {
            const pageContent = state.request['p' + page];
            const first = pageContent[0].iq;
            const last = pageContent[pageContent.length - 1].iq;

            commit('setCurrentRequestsPage', pageContent);
            commit('setLastRequestDocument', [first, last]);
            commit('setLoading', false);
        }
    },
    loadFOLRequestPage({ commit, state }, payload) {
        commit('setLoading', true);

        const { claims, page, itemsPerPage, mode, userInfo } = payload;
        const data = [];
        const pages = Object.keys(state.requests);

        const requestAmount = this.getters.getDataSize['question-requests'].users[payload.email];
        const amount = requestAmount % 8;

        if(!pages.includes('p' + page)) {
            let request = null;
            let ref = null;

            if(claims['admin']) {
                ref = db.collection('question-requests').orderBy('iq');
            } else {
                ref = db.collection('question-requests').where('user.email', '==', userInfo.email);
            }

            if(mode === 'first') {
                request = ref.limit(itemsPerPage).get();
            } else {
                request = ref.limitToLast(amount || 8).get();
            }

            let first = null,
                last = null;

            request.then(snapshot => {
                if(snapshot.docs.length > 0) {
                        first = snapshot.docs.length > 0 ? snapshot.docs[0].data().iq : '';
                        last = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].data().iq : '';

                        snapshot.forEach(doc => {
                            data.push(doc.data());
                        });

                        commit('setCurrentRequestsPage', data);
                        commit('setRequestPage', { page: 'p' + page, data });
                        commit('setLastRequestDocument', [first, last]);
                    }
                    commit('setLoading', false);
                })
                .catch(error => {
                    commit('setLoading', false);
                    const errorModel = showErrorMessage('load', 'Solicitações', error.message);
                    commit('setError', { message: errorModel });
                    createErrorLog('Request FOL Page Load', new Date().toISOString(), error.message, { payload, data, requestAmount });
                });
        } else {
            const pageContent = state.requests['p' + page];
            const first = pageContent[0].iq;
            const last = pageContent[pageContent.length - 1].iq;

            commit('setCurrentRequestsPage', pageContent);
            commit('setLastRequestDocument', [first, last]);
            commit('setLoading', false);
        }
    },
    searchRequests({ commit }, payload) {
        commit('setLoading', true);

        const { claims, key, userInfo } = payload;
        const data = [];

        let req = db.collection('question-requests').orderBy('iq')
            .where('iq', '>=', key.toUpperCase())
            .where('iq', '<=', key.toUpperCase() + '~');

        if(!claims['admin']) {
            req = req.where('user.email', '==', userInfo.email);
        }

        req.get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    data.push(doc.data());
                });
            })
            .then(() => {
                commit('setFilteredRequests', data);
                commit('setLoading', false);
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('load', 'Solicitações', 'Searching error - ' + error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Request Searching', new Date().toISOString(), error.message, { payload, data });
            });
    },
    checkDeleteMarkRequests({ commit }) {
        const data = [];

        db.collection('question-requests').where('toDelete.status', '==', true).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    data.push(doc.data());
                });
            })
            .then(() => {
                commit('setDeleteMarkRequests', data);
            })
            .catch(error => {
                const errorModel = showErrorMessage('connection', '', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Request Mark Check', new Date().toISOString(), error.message, { data });
            });
    },
    deleteMarkRequest({ commit }, payload) {
        commit('setLoading', true);

        const { iq, isSearching, userEmail } = payload;

        db.collection('question-requests').where('iq', '==', iq).get()
            .then(snapshot => {
                const doc = snapshot.docs[0];

                const toDelete = {
                    status: true,
                    userEmail
                }

                doc.ref.update({ toDelete });

                commit('setDeleteMarkRequest', { iq, toDelete });

                if(isSearching) {
                    commit('setDeleteMarkFilteredRequest', { iq, toDelete });
                }

                commit('updateCurrentRequestsPage', { ...doc.data(), toDelete });
                commit('addDeleteMarkRequest', { ...doc.data(), toDelete });
                commit('setLoading', false);
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('connection', '', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Request Delete Mark', new Date().toISOString(), error.message, { payload });
            });
    },
    restoreMarkedRequest({ commit }, payload) {
        commit('setLoading', true);

        const { iq, isSearching } = payload;
        let docData = null;

        db.collection('question-requests').where('iq', '==', iq).get()
            .then(snapshot => {
                const doc = snapshot.docs[0];
                const data = doc.data();
                docData = data;

                const request = {
                    iq: data.iq,
                    subject: data.subject,
                    question: data.question,
                    knowledge: data.knowledge,
                    knowledgePWR: data.knowledgePWR,
                    knowledgeBWR: data.knowledgeBWR,
                    answers: data.answers,
                    image: data.image,
                    imageSize: data.imageSize,
                    edited: data.edited || [],
                    status: data.status,
                    user: data.user
                };

                doc.ref.set(request);
                commit('updateRequest', request);

                if(isSearching) {
                    commit('updateFilteredRequest', request);
                }

                commit('removeDeleteMarkRequest', iq);
                commit('updateCurrentRequestsPage', request);
                commit('setLoading', false);
                commit('setSuccess', 'Solicitação restaurada com sucesso!');
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('connection', '', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Request Restore', new Date().toISOString(), error.message, { payload, docData });
            });
    },
    restoreAllMarkedRequests({ commit, state }, payload) {
        commit('setLoading', true);

        const { isSearching, user } = payload;
        let docData = null;

        db.collection('question-requests').where('toDelete.status', '==', true)
            .where('toDelete.userEmail', '==', user.email).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    const data = doc.data();
                    docData = data;

                    const request = {
                        iq: data.iq,
                        subject: data.subject,
                        question: data.question,
                        knowledge: data.knowledge,
                        knowledgePWR: data.knowledgePWR,
                        knowledgeBWR: data.knowledgeBWR,
                        answers: data.answers,
                        image: data.image,
                        imageSize: data.imageSize,
                        edited: data.edited || [],
                        status: data.status,
                        user: data.user
                    };

                    doc.ref.set(request);
                    const falseMarkedRequests = state.deleteMarkRequests.filter(q => !q.toDelete.status);
                    commit('setDeleteMarkRequests', falseMarkedRequests);
                    commit('updateRequest', request);
                    commit('updateCurrentRequestsPage', request);
                    if(isSearching) commit('updateFilteredRequest', request);
                    commit('setSuccess', 'Solicitações restauradas com sucesso!');
                });
            })
            .then(() => commit('setLoading', false))
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('connection', '', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Request Restore All', new Date().toISOString(), error.message, { payload, docData });
            });
    },
    changeDeleteStatusRequests({ commit }, payload) {
        commit('setLoading', true);
        const { iq, isSearching } = payload;

        db.collection('question-requests').where('iq', '==', iq).get()
            .then(snapshot => {
                const doc = snapshot.docs[0];
                const toDelete = {
                    status: false
                }

                doc.ref.update({ ...doc.data(), toDelete: { status: false } });

                commit('updateCurrentRequestsPage', { ...doc.data(), toDelete });
                commit('updateRequest', { ...doc.data(), toDelete });
                commit('updateDeleteMarkRequest', { ...doc.data(), toDelete });
                if(isSearching) commit('updateFilteredRequest', { ...doc.data(), toDelete });

                commit('setLoading', false);
                commit('setSuccess', 'Solicitação excluída com sucesso!');
            })
            .catch(error => {
                const errorModel = showErrorMessage('exclusion', 'Solicitação', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Request Confirm Delete', new Date().toISOString(), error.message, { payload });
            });
    },
    deleteRequests({ commit }) {
        const data = [];

        db.collection("question-requests").where('toDelete.status', '==', false).get()
            .then(snapshot => {
                const users = {}
                snapshot.forEach(doc => {
                    doc.ref.delete();
                    data.push(doc.data());
                    if(doc.data().image && doc.data().image.length > 0) {
                        const image = doc.data().image;
                        const childImage = image.split('?alt=media')[0].split('/o/')[1];
                        const child = decodeURIComponent(childImage);
                        storage.ref().child(child).delete();
                    }
                    if(users[doc.data().user.email]) {
                        users[doc.data().user.email] += 1;
                    } else {
                        users[doc.data().user.email] = 1;
                    }
                });
                db.collection('data-size').get()
                    .then(snap => {
                        const document = snap.docs[0];
                        const general = document.data()['question-requests'].general;

                        const questionRequests = {
                            general: general - snapshot.docs.length,
                            users: {
                                ...document.data()['question-requests'].users
                            }
                        }

                        for(let key in users) {
                            questionRequests.users[key] -= users[key];
                        }

                        document.ref.update({ ['question-requests']: questionRequests })
                            .then(() => {
                                commit('addRemoveSize', { key: 'question-requests', data: questionRequests });
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
                console.error("Error removing request: ", error);
                createErrorLog('Request DB Delete', new Date().toISOString(), error.message, { data });
            });
    },
    deleteQuestionRequest({ commit }, payload) {
        commit('setLoading', true);

        const { request, isSearching } = payload;

        db.collection('question-requests').where('iq', '==', request.iq).get()
            .then(snapshot => {
                const doc = snapshot.docs[0];
                doc.ref.delete()
                    .then(() => {
                        commit('removeRequest', request.iq);

                        if(isSearching) {
                            commit('removeFilteredRequest', request.iq);
                        }

                        commit('setLoading', false);
                        commit('setSuccess', 'Solicitação excluída com sucesso!');
                        if(doc.data().image && doc.data().image.length > 0) {
                            const image = doc.data().image;
                            const childImage = image.split('?alt=media')[0].split('/o/')[1];
                            const child = decodeURIComponent(childImage);
                            storage.ref().child(child).delete();
                        }

                        db.collection('data-size').get()
                            .then(snap => {
                                const document = snap.docs[0];
                                const general = document.data()['question-requests'].general;
                                const email = request.user.email;
                                const subSize = document.data()['question-requests'].users[email];

                                const questionRequests = {
                                    general: general - 1,
                                    users: {
                                        ...document.data()['question-requests'].users,
                                        [email]: subSize - 1
                                    }
                                }

                                document.ref.update({ ['question-requests']: questionRequests })
                                    .then(() => {
                                        commit('addRemoveSize', { key: 'question-requests', data: questionRequests });
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
                        console.error(error);
                    });
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('exclusion', 'Solicitação', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Request Delete', new Date().toISOString(), error.message, { payload });
            });
    },
    deleteApprovedRequests({ commit }, payload) {
        const { userInfo } = payload;

        db.collection('question-requests')
            .where('user.email', '==', userInfo.email)
            .where('status', '==', 'Aprovado')
            .get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    doc.ref.delete();
                    commit('removeRequest', doc.data().iq);
                });

                db.collection('data-size').get()
                    .then(snap => {
                        const document = snap.docs[0];
                        const general = document.data()['question-requests'].general;
                        const email = userInfo.email;
                        const subSize = document.data()['question-requests'].users[email];

                        const questionRequests = {
                            general: general - 1,
                            users: {
                                ...document.data()['question-requests'].users,
                                [email]: subSize - 1
                            }
                        }

                        document.ref.update({ ['question-requests']: questionRequests })
                            .then(() => {
                                commit('addRemoveSize', { key: 'question-requests', data: questionRequests });
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
                const errorModel = showErrorMessage('connection', '', 'Requests auto delete error - ' + error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Request Approved Delete', new Date().toISOString(), error.message, { payload });
            });
    },
    resetRequests({ commit }) {
        commit('RESETRequests');
    }
}

const getters = {
    getRequests(state) {
        return state.questionRequests;
    },
    getDeleteMarkRequests(state) {
        return state.deleteMarkRequests;
    },
    getRequestsByPage: state => page => {
        return state.requests['p' + page];
    },
    getCurrentRequestsPage(state) {
        return state.currentRequestsPage;
    },
    getFilteredRequests(state) {
        return state.filteredRequests;
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}
