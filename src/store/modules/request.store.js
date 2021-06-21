import { Store } from 'vuex';

import { db, storage } from '../../main';
import { createErrorLog, showErrorMessage } from '../../utils/errors';
import { getNowISOString } from '../../utils/date';

/**
 * @typedef {import('./questions.store.js').DeleteStatus} DeleteStatus
 * @typedef {import('./questions.store.js').Answer} Answer
 * @typedef {import('./questions.store.js').Subject} Subject
 * @typedef {"Rejeitado"|"Pendente"|"Aprovado"} RequestStatus
 */

/**
 * @typedef {Object} RequestCreation
 * @property {string} iq - The request IQ.
 * @property {string} userId - The user that created the request.
 * @property {Subject} subject - The request subject.
 * @property {string} question - The request description.
 * @property {string} knowledge - The request knowledge.
 * @property {string} knowledgeBWR - The request knowledge (BWR).
 * @property {string} knowledgePWR - The request knowledge (PWR).
 * @property {string} image - The request image url.
 * @property {string} imageSize - The size of the image.
 * @property {Answer[]} answers - The request answers.
 * @property {RequestStatus} status - The request status.
 */

/**
 * @typedef {Object} Request
 * @property {string} iq - The request IQ.
 * @property {string} userId - The user that created the request.
 * @property {Subject} subject - The request subject.
 * @property {string} question - The request description.
 * @property {string} knowledge - The request knowledge.
 * @property {string} knowledgeBWR - The request knowledge (BWR).
 * @property {string} knowledgePWR - The request knowledge (PWR).
 * @property {string} image - The request image url.
 * @property {string} imageSize - The size of the image.
 * @property {string|undefined} created - The request creation date.
 * @property {string|undefined} updated - The request edition date.
 * @property {Answer[]} answers - The request answers.
 * @property {RequestStatus} status - The request status.
 * @property {Array} edited - The request edition history.
 * @property {DeleteStatus|undefined} toDelete - The request deletion status.
 */

/**
 * @typedef {Object} RequestState
 * @property {Object.<string, Request[]} requests - The pages with it's requests list.
 * @property {Request[]} filteredRequests - An array of requests filtered by IQ.
 * @property {Request[]} currentRequestsPage - An array of requests of the current page.
 * @property {[string, string]|null} lastRequestDocument - An array with the first and last test IQ from the last request.
 * @property {Request[]} deleteMarkRequests - An array of requests that were marked to be deleted.
 * @property {Request[]} lastPendentTests - An array of the most recent pending tests.
 * @property {Request[]} currentUserRequests - An array of the current user last pending requests.
 * @property {Request[]} otherUserRequests - An array of other users last pending requests.
 */

/**
 * Gets the initial state of the request state.
 *
 * @returns {RequestState} The initial state of the request state.
 */
const initialState = () => ({
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
    /**
     * Sets a page of requests according to the given data.
     *
     * @param {RequestState} state - The request state.
     * @param {Object} data - The data containing the page number and it's data.
     * @param {string} data.page - The page number.
     * @param {Request[]} data.data - An array of requests.
     */
    setRequestPage(state, data) {
        state.requests[data.page] = data.data;
    },
    /**
     * Sets the filtered requests.
     *
     * @param {RequestState} state - The request state.
     * @param {Request[]} data - An array of filtered requests.
     */
    setFilteredRequests(state, data) {
        state.filteredRequests = data;
    },
    /**
     * Cleans the filtered requests array.
     *
     * @param {RequestState} state - The request state.
     */
    resetFilteredRequests(state) {
        state.filteredRequests = [];
    },
    /**
     * Cleans the current requests page array.
     *
     * @param {RequestState} state - The request state.
     */
    resetCurrentRequestsPage(state) {
        state.currentRequestsPage = [];
    },
    /**
     * Sets the current requests page array.
     *
     * @param {RequestState} state - The request state.
     * @param {Request[]} data - An array of requests.
     */
    setCurrentRequestsPage(state, data) {
        state.currentRequestsPage = data;
    },
    /**
     * Sets the most recent pending requests.
     *
     * @param {RequestState} state - The request state.
     * @param {Request[]} data - An array of requests.
     */
    setLastPendentRequests(state, data) {
        state.lastPendentRequests = data;
    },
    /**
     * Sets the most recent pending requests from the current user.
     *
     * @param {RequestState} state - The request state.
     * @param {Request[]} data - An array of requests.
     */
    setCurrentUserRequests(state, data) {
        state.currentUserRequests = data;
    },
    /**
     * Sets the most recent pending requests from other users.
     *
     * @param {RequestState} state - The request state.
     * @param {Request[]} data - An array of requests.
     */
    setOtherUserRequests(state, data) {
        state.otherUserRequests = data;
    },
    /**
     * Adds a request to the array of requests marked to be deleted.
     *
     * @param {RequestState} state - The request state.
     * @param {Request} data - The request to be added.
     */
    addDeleteMarkRequest(state, data) {
        state.deleteMarkRequests.push(data);
    },
    /**
     * Updates a request that's into the array of requests marked to be deleted.
     *
     * @param {RequestState} state - The request state.
     * @param {Request} data - The request to be updated.
     */
    updateDeleteMarkRequest(state, data) {
        const requests = [...state.deleteMarkRequests];
        requests.forEach((item, index) => {
            if(item.iq === data.iq) {
                requests[index] = data;
            }
        });
        state.deleteMarkRequests = requests;
    },
    /**
     * Removes a request from the array of requests marked to be deleted.
     *
     * @param {RequestState} state - The request state.
     * @param {string} data - The IQ of the request to be removed.
     */
    removeDeleteMarkRequest(state, data) {
        const requests = [...state.deleteMarkRequests];
        requests.forEach((item, index) => {
            if(item.iq === data) {
                state.deleteMarkRequests.splice(index, 1);
            }
        })
    },
    /**
     * Sets the array of requests marked to be deleted.
     *
     * @param {RequestState} state - The request state.
     * @param {Request[]} data - An array of requests.
     */
    setDeleteMarkRequests(state, data) {
        state.deleteMarkRequests = data;
    },
    /**
     * Sets a request as marked to be deleted.
     *
     * @param {RequestState} state - The request state.
     * @param {Object} data - The data containing the request IQ and it's deletion status.
     * @param {string} data.iq - The request IQ.
     * @param {DeleteStatus} data.toDelete - The request deletion status.
     */
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
    /**
     * Sets a filtered request as marked to be deleted.
     *
     * @param {RequestState} state - The request state.
     * @param {Object} data - The data containing the request IQ and it's deletion status.
     * @param {string} data.iq - The request IQ.
     * @param {DeleteStatus} data.toDelete - The request deletion status.
     */
    setDeleteMarkFilteredRequest(state, data) {
        const requests = [...state.filteredRequests];
        requests.forEach((item, index) => {
            if(item.iq === data.iq) {
                requests[index] = { ...item, toDelete: data.toDelete };
            }
        });
        state.filteredRequests = requests;
    },
    /**
     * Adds a request into the requests object, according to the given data.
     *
     * @param {RequestState} state - The request state.
     * @param {Object} data - The data containing the page number, requests amount and the data to be added.
     * @param {number} data.page - The page number.
     * @param {number} data.amount - The total amount of requests.
     * @param {Request} data.data - The request to be added.
     */
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
    /**
     * Updates a request.
     *
     * @param {RequestState} state - The request state.
     * @param {Request} data - The request to be updated.
     */
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
    /**
     * Updates a request that's in the filtered requests array.
     *
     * @param {RequestState} state - The request state.
     * @param {Request} data - The request to be updated.
     */
    updateFilteredRequest(state, data) {
        const requests = [...state.filteredRequests];
        requests.forEach((item, index) => {
            if(item.iq === data.iq) {
                requests[index] = data;
            }
        });
        state.filteredRequests = requests;
    },
    /**
     * Updates a request that's in the current requests page array.
     *
     * @param {RequestState} state - The request state.
     * @param {Request} data - The request to be updated.
     */
    updateCurrentRequestsPage(state, data) {
        const requests = [...state.currentRequestsPage];
        requests.forEach((item, index) => {
            if(item.iq === data.iq) {
                requests[index] = data;
            }
        });
        state.currentRequestsPage = [...requests];
    },
    /**
     * Removes a request from the requests object.
     *
     * @param {RequestState} state - The request state.
     * @param {string} data - The IQ of the request to be removed.
     */
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
    /**
     * Removes a request from the filtered requests array.
     *
     * @param {RequestState} state - The request state.
     * @param {string} data The IQ of the request to be removed.
     */
    removeFilteredRequest(state, data) {
        const request = state.filteredRequests;
        request.forEach((item, index) => {
            if(item.iq === data) {
                state.filteredRequests.splice(index, 1);
            }
        });
    },
    /**
     * Sets the last requests request ids.
     *
     * @param {RequestState} state - The request state.
     * @param {[string, string]} data An array of strings containing the first and last IQs from the last request.
     */
    setLastRequestDocument(state, data) {
        state.lastRequestDocument = data;
    },
    /**
     * Resets the request state to it's initial state.
     *
     * @param {RequestState} state - The request state.
     */
    RESETRequests(state) {
        const newState = initialState();
        Object.keys(newState).forEach(key => {
            state[key] = newState[key];
        });
    }
}

const actions = {
    /**
     * Creates a new request.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {RequestCreation} payload.request - The request to be created.
     * @param {string} payload.email - The current user e-mail.
     * @param {import('./user.store.js').UserInfo} payload.user - The current user info.
     */
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
    /**
     * Updates a request based on it's IQ.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {Request} payload.request - The request to be updated.
     * @param {RequestStatus} payload.status - The request new status.
     * @param {"reqUpdate"|"sttUpdate"} payload.mode - If reqUpdate, update all the request data. Otherwise, update only it's status.
     * @param {import('./user.store.js').UserInfo} payload.user - The request to be updated.
     */
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
    /**
     * Loads a page of requests according to the payload data.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {number} payload.page - The page number.
     * @param {number} payload.itemsPerPage - The amount of items per page.
     * @param {"next"|"previous"} payload.type - The data request type.
     * @param {import('./user.store.js').UserInfo} payload.userInfo - The current user info.
     * @param {import('./user.store.js').UserClaims} payload.claims - The current user claims.
     */
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
    /**
     * Loads the first or last page according to the payload data.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {number} payload.page - The page number.
     * @param {number} payload.itemsPerPage - The amount of items per page.
     * @param {"first"|"last"} payload.mode - The data request mode.
     * @param {import('./user.store.js').UserInfo} payload.userInfo - The current user info.
     * @param {import('./user.store.js').UserClaims} payload.claims - The current user claims.
     */
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
    /**
     * Searches for requests based on their IQ.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {string} payload.key - The string to be searched.
     * @param {import('./user.store.js').UserInfo} payload.userInfo - The current user info.
     * @param {import('./user.store.js').UserClaims} payload.claims - The current user claims.
     */
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
    /**
     * Loads all requests that are marked to be deleted.
     *
     * @param {Store} store - The vuex store.
     */
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
    /**
     * Marks a request to be deleted.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {string} payload.iq - The request IQ.
     * @param {boolean} payload.isSearching - Whether the application is using filtered requests or not.
     * @param {string} payload.userId - The current user id.
     */
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
    /**
     * Restores a request from being marked to be deleted.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {string} payload.iq - The request IQ.
     * @param {boolean} payload.isSearching - Whether the application is using filtered requests or not.
     */
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
    /**
     * Restores all requests that are marked to be deleted.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {boolean} payload.isSearching - Whether the application is using filtered requests or not.
     * @param {import('./user.store.js').UserInfo} payload.user - The current user info.
     */
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
    /**
     * Changes a request's delete status to false (confirmed deletion).
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {string} payload.iq - The request IQ.
     * @param {boolean} payload.isSearching - Whether the application is using filtered requests or not.
     */
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
    /**
     * Deletes all requests that are marked to be deleted (toDelete.status = false).
     *
     * @param {Store} store - The vuex store.
     */
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
    /**
     * Deletes all approved request from a user.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {import('./user.store.js').UserInfo} payload.userInfo - The current user info.
     */
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
    /**
     * Loads the most recent pending requests.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {number} payload.limit - The limit of requests on the response.
     */
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
    /**
     * Loads the most recent pending requests.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {number} payload.limit - The limit of requests on the response.
     * @param {string} payload.userId - The current user id.
     * @param {"current"|"other"} payload.mode - The data request mode.
     */
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
    /**
     * Resets the request state to it's initial state.
     *
     * @param {Store} store - The vuex store.
     */
    resetRequests({ commit }) {
        commit('RESETRequests');
    }
}

const getters = {
    /**
     * Gets an array of requests that were marked to be deleted.
     *
     * @param {RequestState} state - The requests state.
     * @returns {Request[]} An array of requests.
     */
    getDeleteMarkRequests(state) {
        return state.deleteMarkRequests;
    },
    /**
     * Gets an array of requests of the given page.
     *
     * @param {RequestState} state - The request state.
     * @param {number} page - The page number.
     * @returns {(page: number) => Request[]} An array of requests.
     */
    getRequestsByPage(state) {
        return page => state.requests['p' + page];
    },
    /**
     * Gets an array of the current page requests.
     *
     * @param {RequestState} state - The request state.
     * @returns {Request[]} An array of requests.
     */
    getCurrentRequestsPage(state) {
        return state.currentRequestsPage;
    },
    /**
     * Gets an array of the filtered requests.
     *
     * @param {RequestState} state - The request state.
     * @returns {Request[]} An array of requests.
     */
    getFilteredRequests(state) {
        return state.filteredRequests;
    },
    /**
     * Gets the most recent pending requests.
     *
     * @param {RequestState} state - The request state.
     * @returns {Request[]} An array of requests.
     */
    getLastPendentRequests(state) {
        return state.lastPendentRequests;
    },
    /**
     * Gets the most recent pending requests from the current user.
     *
     * @param {RequestState} state - The request state.
     * @returns {Request[]} An array of requests.
     */
    getCurrentUserRequests(state) {
        return state.currentUserRequests;
    },
    /**
     * Gets the most recent pending requests from other users.
     *
     * @param {RequestState} state - The request state.
     * @returns {Request[]} An array of requests.
     */
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
