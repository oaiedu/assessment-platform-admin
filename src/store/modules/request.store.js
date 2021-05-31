import { db, storage } from '../../main';
import { createErrorLog, showErrorMessage } from '../../utils/errors';
import { getNowISOString } from '../../utils/date';

const initialState = () => ({
    questionRequests: [],
    requests: {},
    filteredRequests: [],
    currentRequestsPage: [],
    lastRequestDocument: null,
    deleteMarkQuestions: [],
    lastPendentRequests: [],
    currentUserRequests: [],
    otherUserRequests: []
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
    setLastPendentRequests(state, data) {
        state.lastPendentRequests = data;
    },
    setCurrentUserRequests(state, data) {
        state.currentUserRequests = data;
    },
    setOtherUserRequests(state, data) {
        state.otherUserRequests = data;
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
        const requests = {...state.requests};
        for(let key in requests) {
            if(requests[key]) {
                requests[key].forEach((item, index) => {
                    if(item.iq === data.iq) {
                        requests[key][index] = { ...data, user: item.user };
                    }
                });
            }
        }
        state.requests = requests;
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
        state.currentRequestsPage = [...requests];
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

        const createdDate = getNowISOString();

        const request = {
            ...payload.request,
            created: createdDate,
            updated: createdDate,
            edited: []
        }

        const requestAmount = this.getters.getDataSize['question-requests'].users[payload.email];
        const pageAmount = Math.ceil(requestAmount / 8);
        const amount = requestAmount % 8;

        db.collection('question-requests').add(request)
            .then(() => {
                commit('addRequest', { page: (amount === 0 ? pageAmount + 1 : pageAmount), data: { ...request, user: payload.user } });
                commit('setLoading', false);
                commit('setSuccess', 'Solicitação criada com sucesso!');

                db.collection('data-size').get()
                    .then(snap => {
                        const document = snap.docs[0];
                        const general = document.data()['question-requests'].general;
                        const userId = request.id;
                        const subSize = document.data()['question-requests'].users[userId];

                        const questionRequests = {
                            general: general + 1,
                            users: {
                                ...document.data()['question-requests'].users,
                                [userId]: subSize + 1
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
                createErrorLog('Request DB Insert', error.message, { payload, requestAmount });
            });
    },
    updateQuestionRequest({ commit }, payload) {
        commit('setLoading', true);
        const { mode, request, user } = payload;

        const toUpdate = { ...request, status: payload.status, updated: getNowISOString() };

        db.collection('question-requests').where('iq', '==', request.iq).get()
            .then(snapshot => {
                if(mode === 'sttUpdate') {
                    snapshot.docs[0].ref.update({ status: payload.status, updated: getNowISOString() })
                        .then(() => {
                            request.status = payload.status;
                            commit('updateRequest', { ...toUpdate, user});
                            commit('updateCurrentRequestsPage', { ...toUpdate, user});
                            commit('setLoading', false);
                        });
                } else {
                    snapshot.docs[0].ref.update(toUpdate)
                        .then(() => {
                            commit('updateRequest', { ...toUpdate, user });
                            commit('updateCurrentRequestsPage', { ...toUpdate, user });
                            commit('setLoading', false);
                            commit('setSuccess', 'Solicitação editada com sucesso!');
                        });
                }
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('edition', 'Solicitação', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Request DB Update', error.message, { payload });
            });
    },
    loadRequestPage({ commit, dispatch, state }, payload) {
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
                ref = db.collection('question-requests').orderBy('iq').where('userId', '==', userInfo.id);
            }

            if(type === 'next') {
                request = ref.startAfter(state.lastRequestDocument[1]).limit(itemsPerPage).get();
            } else {
                request = ref.endBefore(state.lastRequestDocument[0]).limitToLast(itemsPerPage).get();
            }

            let first = null,
                last = null;

            request.then(async snapshot => {
                    if (snapshot.docs.length > 0) {
                        first = snapshot.docs[0].data().iq;
                        last = snapshot.docs[snapshot.docs.length - 1].data().iq;

                        const promises = snapshot.docs.map(async doc => {
                            const userData = await dispatch('getUserById', { id: doc.data().userId });
                            data.push({ ...doc.data(), user: userData });
                            return userData;
                        });

                        await Promise.all(promises);
                    }
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
                    createErrorLog('Request Page Load', error.message, { payload, data });
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
    loadFOLRequestPage({ commit, dispatch, state }, payload) {
        commit('setLoading', true);

        const { claims, page, itemsPerPage, mode, userInfo } = payload;
        const data = [];
        const pages = Object.keys(state.requests);

        const requestAmount = this.getters.getDataSize['question-requests'].users[userInfo.id];
        const amount = requestAmount % 8;

        if(!pages.includes('p' + page)) {
            let request = null;
            let ref = null;

            if(claims['admin']) {
                ref = db.collection('question-requests').orderBy('iq');
            } else {
                ref = db.collection('question-requests').orderBy('iq').where('userId', '==', userInfo.id);
            }

            if(mode === 'first') {
                request = ref.limit(itemsPerPage).get();
            } else {
                request = ref.limitToLast(amount || 8).get();
            }

            let first = null,
                last = null;

            request.then(async snapshot => {
                if(snapshot.docs.length > 0) {
                        first = snapshot.docs.length > 0 ? snapshot.docs[0].data().iq : '';
                        last = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].data().iq : '';

                        const promises = snapshot.docs.map(async doc => {
                            const userData = await dispatch('getUserById', { id: doc.data().userId });
                            data.push({ ...doc.data(), user: userData });
                            return userData;
                        });

                        await Promise.all(promises);

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
                    createErrorLog('Request FOL Page Load', error.message, { payload, data, requestAmount });
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
    searchRequests({ commit, dispatch }, payload) {
        commit('setLoading', true);

        const { claims, key, userInfo } = payload;
        const data = [];

        let req = db.collection('question-requests').orderBy('iq')
            .where('iq', '>=', key.toUpperCase())
            .where('iq', '<=', key.toUpperCase() + '~');

        if(!claims['admin']) {
            req = req.where('userId', '==', userInfo.id);
        }

        req.get()
            .then(async snapshot => {
                const promises = snapshot.docs.map(async doc => {
                    const userData = await dispatch('getUserById', { id: doc.data().userId });
                    data.push({ ...doc.data(), user: userData });
                    return userData;
                });

                await Promise.all(promises);
            })
            .then(() => {
                commit('setFilteredRequests', data);
                commit('setLoading', false);
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('load', 'Solicitações', 'Searching error - ' + error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Request Searching', error.message, { payload, data });
            });
    },
    checkDeleteMarkRequests({ commit, dispatch }) {
        const data = [];

        db.collection('question-requests').where('toDelete.status', '==', true).get()
            .then(async snapshot => {
                const promises = snapshot.docs.map(async doc => {
                    const userData = await dispatch('getUserById', { id: doc.data().userId });
                    data.push({ ...doc.data(), user: userData });
                    return userData;
                });

                await Promise.all(promises);
            })
            .then(() => {
                commit('setDeleteMarkRequests', data);
            })
            .catch(error => {
                const errorModel = showErrorMessage('connection', '', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Request Mark Check', error.message, { data });
            });
    },
    deleteMarkRequest({ commit, dispatch }, payload) {
        commit('setLoading', true);

        const { iq, isSearching, userId } = payload;

        db.collection('question-requests').where('iq', '==', iq).get()
            .then(async snapshot => {
                const doc = snapshot.docs[0];

                const toDelete = {
                    status: true,
                    userId
                }

                doc.ref.update({ toDelete });

                const user = await dispatch('getUserById', { id: doc.data().userId });

                commit('setDeleteMarkRequest', { iq, toDelete, user });

                if(isSearching) {
                    commit('setDeleteMarkFilteredRequest', { iq, toDelete, user });
                }

                commit('updateCurrentRequestsPage', { ...doc.data(), toDelete, user });
                commit('addDeleteMarkRequest', { ...doc.data(), toDelete, user });
                commit('setLoading', false);
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('connection', '', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Request Delete Mark', error.message, { payload });
            });
    },
    restoreMarkedRequest({ commit, dispatch }, payload) {
        commit('setLoading', true);

        const { iq, isSearching } = payload;
        let docData = null;

        db.collection('question-requests').where('iq', '==', iq).get()
            .then(async snapshot => {
                const doc = snapshot.docs[0];
                const data = doc.data();
                docData = data;

                const request = {
                    created: data.created,
                    image: data.image,
                    imageSize: data.imageSize,
                    iq: data.iq,
                    knowledge: data.knowledge,
                    knowledgeBWR: data.knowledgeBWR,
                    knowledgePWR: data.knowledgePWR,
                    question: data.question,
                    status: data.status,
                    subject: data.subject,
                    updated: data.updated,
                    userId: data.userId,
                    edited: data.edited || []
                };

                const user = await dispatch('getUserById', { id: doc.data().userId });

                doc.ref.set(request);
                commit('updateRequest', { ...request, user });

                if(isSearching) {
                    commit('updateFilteredRequest', { ...request, user });
                }

                commit('removeDeleteMarkRequest', iq);
                commit('updateCurrentRequestsPage', { ...request, user });
                commit('setLoading', false);
                commit('setSuccess', 'Solicitação restaurada com sucesso!');
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('connection', '', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Request Restore', error.message, { payload, docData });
            });
    },
    restoreAllMarkedRequests({ commit, state }, payload) {
        commit('setLoading', true);

        const { isSearching, user } = payload;
        let docData = null;

        db.collection('question-requests').where('toDelete.status', '==', true)
            .where('toDelete.userId', '==', user.id).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    const data = doc.data();
                    docData = data;

                    const request = {
                        created: data.created,
                        image: data.image,
                        imageSize: data.imageSize,
                        iq: data.iq,
                        knowledge: data.knowledge,
                        knowledgeBWR: data.knowledgeBWR,
                        knowledgePWR: data.knowledgePWR,
                        question: data.question,
                        status: data.status,
                        subject: data.subject,
                        updated: data.updated,
                        userId: data.userId,
                        edited: data.edited || []
                    };

                    doc.ref.set(request);
                    const falseMarkedRequests = state.deleteMarkRequests.filter(q => !q.toDelete.status);
                    commit('setDeleteMarkRequests', falseMarkedRequests);
                    commit('updateRequest', { ...request, user });
                    commit('updateCurrentRequestsPage', { ...request, user });
                    if(isSearching) commit('updateFilteredRequest', { ...request, user });
                    commit('setSuccess', 'Solicitações restauradas com sucesso!');
                });
            })
            .then(() => commit('setLoading', false))
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('connection', '', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Request Restore All', error.message, { payload, docData });
            });
    },
    changeDeleteStatusRequests({ commit, dispatch }, payload) {
        commit('setLoading', true);
        const { iq, isSearching } = payload;

        db.collection('question-requests').where('iq', '==', iq).get()
            .then(async snapshot => {
                const doc = snapshot.docs[0];
                const toDelete = {
                    status: false
                }

                doc.ref.update({ ...doc.data(), toDelete: { status: false } });

                const user = await dispatch('getUserById', { id: doc.data().userId });

                commit('updateCurrentRequestsPage', { ...doc.data(), toDelete, user });
                commit('updateRequest', { ...doc.data(), toDelete, user });
                commit('updateDeleteMarkRequest', { ...doc.data(), toDelete, user });
                if(isSearching) commit('updateFilteredRequest', { ...doc.data(), toDelete, user });

                commit('setLoading', false);
                commit('setSuccess', 'Solicitação excluída com sucesso!');
            })
            .catch(error => {
                const errorModel = showErrorMessage('exclusion', 'Solicitação', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Request Confirm Delete', error.message, { payload });
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
                    if(users[doc.data().userId]) {
                        users[doc.data().userId] += 1;
                    } else {
                        users[doc.data().userId] = 1;
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
                createErrorLog('Request DB Delete', error.message, { data });
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
                                const userId = request.userId;
                                const subSize = document.data()['question-requests'].users[userId];

                                const questionRequests = {
                                    general: general - 1,
                                    users: {
                                        ...document.data()['question-requests'].users,
                                        [userId]: subSize - 1
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
                createErrorLog('Request Delete', error.message, { payload });
            });
    },
    deleteApprovedRequests({ commit }, payload) {
        const { userInfo } = payload;

        db.collection('question-requests')
            .where('userId', '==', userInfo.id)
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
                        const userId = userInfo.id;
                        const subSize = document.data()['question-requests'].users[userId];

                        const questionRequests = {
                            general: general - 1,
                            users: {
                                ...document.data()['question-requests'].users,
                                [userId]: subSize - 1
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
                createErrorLog('Request Approved Delete', error.message, { payload });
            });
    },
    loadLastPendentRequests({ commit, dispatch }, payload) {
        commit('setLoading', true);

        const data = [];

        db.collection('question-requests')
            .orderBy('updated', 'desc')
            .where('status', '==', 'Pendente')
            .limit(payload ? payload.limit : 5)
            .get()
            .then(async snapshot => {
                const promises = snapshot.docs.map(async doc => {
                    const userData = await dispatch('getUserById', { id: doc.data().userId });
                    data.push({ ...doc.data(), user: userData });
                    return userData;
                });

                await Promise.all(promises);
            })
            .then(() => {
                commit('setLastPendentRequests', data);
                commit('setLoading', false);
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('load', 'Solicitações Pendentes', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Pendent Requests Loading', error.message, { payload });
            });
    },
    loadUserRequests({ commit, dispatch }, payload) {
        commit('setLoading', true);

        const { userId, mode, limit } = payload;

        const data = [];

        const reference = db.collection('question-requests');

        let request = null;

        if (mode === 'other') {
            request = reference.orderBy('userId').orderBy('updated', 'desc').where('userId', '!=', userId);
        } else {
            request = reference.orderBy('updated', 'desc').where('userId', '==', userId);
        }

        request.limit(limit || 5).get()
            .then(async snapshot => {
                const promises = snapshot.docs.map(async doc => {
                    const userData = await dispatch('getUserById', { id: doc.data().userId });
                    data.push({ ...doc.data(), user: userData });
                    return userData;
                });

                await Promise.all(promises);
            })
            .then(() => {
                if (mode === 'other') {
                    commit('setOtherUserRequests', data);
                } else {
                    commit('setCurrentUserRequests', data);
                }
                commit('setLoading', false);
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('load', mode === 'other' ? 'Solicitações Pendentes' : 'Solicitações do Usuário', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Pendent User Requests Load', error.message, { payload });
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
    },
    getLastPendentRequests(state) {
        return state.lastPendentRequests;
    },
    getCurrentUserRequests(state) {
        return state.currentUserRequests;
    },
    getOtherUserRequests(state) {
        return state.otherUserRequests;
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}
