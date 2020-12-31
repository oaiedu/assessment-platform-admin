import { db, storage } from '../../main';

const initialState = () => ({
    questionRequests: [],
    requests: {},
    filteredRequests: [],
    currentRequestsPage: [],
    lastRequestDocument: null
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
    addRequest(state, data) {
        const requests = state.requests[data.page] || [];
        requests.push(data.data);
        state.requests[data.page] = requests;
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
    removeRequest (state, data) {
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
                commit('addRequest', { page: 'p' + (amount === 8 ? pageAmount + 1 : pageAmount), data: request });
                commit('setLoading', false);

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
                                console.log(error);
                            });
                    })
                    .catch(error => {
                        console.log(error);
                    });
            })
            .catch(error => {
                console.error("Error writing request: ", error);
            });
    },
    updateQuestionRequest({ commit }, payload) {
        commit('setLoading', true);
        const { mode, question } = payload;

        db.collection('question-requests').where('iq', '==', question.iq).get()
            .then(snapshot => {
                if(mode === 'sttUpdate') {
                    snapshot.docs[0].ref.update({ status: payload.status })
                        .then(() => {
                            question.status = payload.status;
                            commit('updateQuestionRequest', question);
                            commit('setLoading', false);
                        })
                        .catch(error => {
                            console.log(error);
                        });
                } else {
                    snapshot.docs[0].ref.update(question)
                        .then(() => {
                            commit('updateQuestionRequest', question);
                            commit('setLoading', false);
                        })
                        .catch(error => {
                            console.log(error);
                        });
                }
            })
            .catch(error => {
                console.log(error);
            });
    },
    // loadQuestionRequests({ commit }, payload) {
    //     return new Promise((resolve, reject) => {
    //         try {
    //             commit('setLoading', true);
    //             const { claims, userInfo } = payload;

    //             const data = [];
    //             let dbRequest = null;

    //             if(claims['admin']) {
    //                 dbRequest = db.collection('question-requests').get();
    //             } else {
    //                 dbRequest = db.collection('question-requests').where('user.email', '==', userInfo.email).get();
    //             }

    //             dbRequest.then(snapshot => {
    //                 snapshot.forEach(doc => {
    //                     data.push(doc.data());
    //                 });
    //             })
    //             .then(() => {
    //                 commit('setQuestionRequests', data);
    //                 commit('setLoading', false);
    //                 resolve();
    //             })
    //             .catch(error => {
    //                 console.log(error);
    //             });
    //         } catch {
    //             reject('Error');
    //         }
    //     });
    // },
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
                    console.log(error);
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
                ref = db.collection('question-requests').orderBy('iq').where('user.email', '==', userInfo.email);
            }

            if(mode === 'first') {
                request = ref.limit(itemsPerPage).get();
            } else {
                request = ref.limitToLast(amount || 8).get();
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
                    console.log(error);
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
                console.log(error);
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
                                        console.log(error);
                                    });
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
                console.log(error);
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
                                console.log(error);
                            });
                    })
                    .catch(error => {
                        console.log(error);
                    });
            })
            .catch(error => {
                console.log(error);
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
