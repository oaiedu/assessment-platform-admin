import uuid from 'uuid-random';

import { db, storage } from '../../main';

const initialState = () => ({
    loadedTests: [],
    tests: {},
    filteredTests: [],
    currentTestsPage: [],
    lastTestDocument: null,
    testQuestions: [],
    deleteMarkTests: []
});

const state = initialState();

const mutations = {
    setLoadedTests(state, payload) {
        state.loadedTests = payload
    },
    setTestPage(state, data) {
        state.tests[data.page] = data.data;
    },
    setFilteredTests(state, data) {
        state.filteredTests = data;
    },
    resetFilteredTests(state) {
        state.filteredTests = [];
    },
    resetCurrentTestsPage(state) {
        state.currentTestsPage = [];
    },
    setCurrentTestsPage(state, data) {
        state.currentTestsPage = data;
    },
    addDeleteMarkTest(state, data) {
        state.deleteMarkTests.push(data);
    },
    updateDeleteMarkTest(state, data) {
        const tests = [...state.deleteMarkTests];
        tests.forEach((item, index) => {
            if(item.id === data.id) {
                tests[index] = data;
            }
        });
        state.deleteMarkTests = tests;
    },
    removeDeleteMarkTest(state, data) {
        const tests = [...state.deleteMarkTests];
        tests.forEach((item, index) => {
            if(item.id === data) {
                state.deleteMarkTests.splice(index, 1);
            }
        })
    },
    setDeleteMarkTests(state, data) {
        state.deleteMarkTests = data;
    },
    setDeleteMarkTest(state, data) {
        const tests = state.tests;
        for(let key in tests) {
            if(tests[key]) {
                tests[key].forEach((item, index) => {
                    if(item.id === data.id) {
                        state.tests[key][index] = { ...item, toDelete: data.toDelete };
                    }
                });
            }
        }
    },
    setDeleteMarkFilteredTest(state, data) {
        const tests = [...state.filteredTests];
        tests.forEach((item, index) => {
            if(item.id === data.id) {
                tests[index] = { ...item, toDelete: data.toDelete };
            }
        });
        state.filteredTests = tests;
    },
    setTestQuestions(state, data) {
        state.testQuestions = data;
    },
    createTest(state, data) {
        const page = data.page;
        const tests = state.tests['p' + page] || [];
        const amount = data.amount;
        const oneBefore = state.tests['p' + (page - 1)] || [];
        if(tests.length > 0 || oneBefore.length === 8 || amount === 0) {
            tests.push(data.data);
            state.tests['p' + page] = [...tests];
            if(amount === 0) {
                state.currentTestsPage.push(data.data);
            }
        }
    },
    updateTest(state, data) {
        const tests = state.tests;
        for(let key in tests) {
            if(tests[key]) {
                tests[key].forEach((item, index) => {
                    if(item.id === data.id) {
                        state.tests[key][index] = data;
                    }
                });
            }
        }
    },
    updateFilteredTest(state, data) {
        const tests = [...state.filteredTests];
        tests.forEach((item, index) => {
            if(item.id === data.id) {
                tests[index] = data;
            }
        });
        state.filteredTests = tests;
    },
    updateCurrentTestsPage(state, data) {
        const tests = [...state.currentTestsPage];
        tests.forEach((item, index) => {
            if(item.id === data.id) {
                tests[index] = data;
            }
        });
        state.currentTestsPage = tests;
    },
    deleteTest(state, data) {
        const tests = state.tests;
        for(let key in tests) {
            if(tests[key]) {
                tests[key].forEach((item, index) => {
                    if(item.id === data) {
                        state.tests[key].splice(index, 1);
                    }
                });
            }
        }
    },
    deleteFilteredTest(state, data) {
        const tests = state.filteredTests;
        tests.forEach((item, index) => {
            if(item.id === data) {
                state.filteredTests.splice(index, 1);
            }
        });
    },
    setLastTestDocument(state, data) {
        state.lastTestDocument = data;
    },
    RESETTests(state) {
        const newState = initialState();
        Object.keys(newState).forEach(key => {
            state[key] = newState[key];
        });
    }
}

const actions = {
    loadedTests({ commit }) {
        commit('setLoading', true);
        let tests = []
        db.collection("tests").get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                tests.push(doc.data());
            });
            commit('setLoadedTests', tests);
            commit('setLoading', false);
        })
    },
    findImageTests({ commit }, payload) {
        const pathReference = storage.refFromURL(`gs://pwr-quiz-generator.appspot.com/${payload}`);

        const imageURL = pathReference.getDownloadURL()
            .then(url => {
                console.log("URL",url);
                return url;
            })
            .catch(error => {
                commit('setError', error);
            });

        console.log("After Download: ", imageURL);
        return imageURL;
    },
    loadTestPage({ commit, state }, payload) {
        commit('setLoading', true);

        const { page, itemsPerPage, type } = payload;
        const data = [];

        const pages = Object.keys(state.tests);

        if(!pages.includes('p' + page)) {
            let request = null;
            const ref = db.collection('tests').orderBy('id');

            if(type === 'next') {
                request = ref.startAfter(state.lastTestDocument[1]).limit(itemsPerPage).get();
            } else {
                request = ref.endBefore(state.lastTestDocument[0]).limitToLast(itemsPerPage).get();
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
                    commit('setCurrentTestsPage', data);
                    commit('setTestPage', { page: 'p' + page, data });
                    commit('setLastTestDocument', [first, last]);
                    commit('setLoading', false);
                })
                .catch(error => {
                    console.log(error);
                });
        } else {
            const pageContent = state.tests['p' + page];
            const first = pageContent[0].id;
            const last = pageContent[pageContent.length - 1].id;

            commit('setCurrentTestsPage', pageContent);
            commit('setLastTestDocument', [first, last]);
            commit('setLoading', false);
        }
    },
    loadFOLTestPage({ commit, state }, payload) {
        commit('setLoading', true);

        const { page, itemsPerPage, mode } = payload;
        const data = [];

        const pages = Object.keys(state.tests);

        const testAmount = this.getters.getDataSize.tests;
        const amount = testAmount % 10;

        if(!pages.includes('p' + page)) {
            let request = null;
            const ref = db.collection('tests').orderBy('id');

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
                        commit('setCurrentTestsPage', data);
                        commit('setTestPage', { page: 'p' + page, data });
                        commit('setLastTestDocument', [first, last]);
                    }
                    commit('setLoading', false);
                })
                .catch(error => {
                    console.log(error);
                });
        } else {
            const pageContent = state.tests['p' + page];
            const first = pageContent[0].id;
            const last = pageContent[pageContent.length - 1].id;

            commit('setCurrentTestsPage', pageContent);
            commit('setLastTestDocument', [first, last]);
            commit('setLoading', false);
        }
    },
    async testExists(store, payload) {
        return new Promise((resolve, reject) => {
            try {
                db.collection('tests').where('title', '==', payload).get()
                    .then(snapshot => {
                        if(snapshot.docs.length > 0) resolve(snapshot.docs.length);
                        else resolve(0);
                    })
                    .catch(error => {
                        console.log(error);
                    });
            } catch {
                reject();
            }
        });
    },
    searchTests({ commit }, payload) {
        commit('setLoading', true);

        const data = [];

        db.collection('tests').orderBy('title')
            .where('title', '>=', payload)
            .where('title', '<=', payload + '~')
            .get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    data.push(doc.data());
                });
            })
            .then(() => {
                db.collection('tests').orderBy('title')
                    .where('title', '>=', payload.toUpperCase())
                    .where('title', '<=', payload.toUpperCase() + '~')
                    .get()
                    .then(snap => {
                        const ids = data.map(t => t.id);
                        snap.forEach(document => {
                            if(!ids.includes(document.data().id)) {
                                data.push(document.data());
                            }
                        });
                    });
            })
            .then(() => {
                db.collection('tests').orderBy('title')
                    .where('title', '>=', payload.toLowerCase())
                    .where('title', '<=', payload.toLowerCase() + '~')
                    .get()
                    .then(snap => {
                        const ids = data.map(t => t.id);
                        snap.forEach(document => {
                            if(!ids.includes(document.data().id)) {
                                data.push(document.data());
                            }
                        });
                    });
            })
            .then(() => {
                commit('setFilteredTests', data);
                commit('setLoading', false);
            })
            .catch(error => {
                commit('setLoading', false);
                commit('setError', error);
            });
    },
    loadTestQuestions({ commit }, payload) {
        const data = [...payload.questions];
        commit('setTestQuestions', data);
    },
    checkDeleteMarkTests({ commit }) {
        const data = [];

        db.collection('tests').where('toDelete.status', '==', true).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    data.push(doc.data());
                });
            })
            .then(() => {
                commit('setDeleteMarkTests', data);
            })
            .catch(error => {
                console.log(error);
            });
    },
    deleteMarkTest({ commit }, payload) {
        commit('setLoading', true);

        const { id, isSearching, userEmail } = payload;

        db.collection('tests').where('id', '==', id).get()
            .then(snapshot => {
                const doc = snapshot.docs[0];

                const toDelete = {
                    status: true,
                    userEmail
                }

                doc.ref.update({ toDelete });

                commit('setDeleteMarkTest', { id, toDelete });

                if(isSearching) {
                    commit('setDeleteMarkFilteredTest', { id, toDelete });
                }

                commit('updateCurrentTestsPage', { ...doc.data(), toDelete });
                commit('addDeleteMarkTest', { ...doc.data(), toDelete });
                commit('setLoading', false);
            })
            .catch(error => {
                commit('setLoading', false);
                commit('setError', error);
            });
    },
    restoreMarkedTest({ commit }, payload) {
        commit('setLoading', true);

        const { id, isSearching } = payload;

        db.collection('tests').where('id', '==', id).get()
            .then(snapshot => {
                const doc = snapshot.docs[0];
                const data = doc.data();

                const test = {
                    id: data.id,
                    title: data.title,
                    questions: data.questions,
                    type: data.type,
                    user: data.user,
                    created: data.created,
                    edited: data.edited,
                    purpose: data.purpose
                }

                doc.ref.set(test);
                commit('updateTest', test);

                if(isSearching) {
                    commit('updateFilteredTest', test);
                }

                commit('removeDeleteMarkTest', id);
                commit('updateCurrentTestsPage', test);
                commit('setLoading', false);
                commit('setSuccess', 'Prova restaurada com sucesso!');
            })
            .catch(error => {
                commit('setLoading', false);
                commit('setError', error);
            });
    },
    restoreAllMarkedTests({ commit, state }, payload) {
        commit('setLoading', true);

        const { all, isSearching, user } = payload;

        const ref = db.collection('tests').where('toDelete.status', '==', true);
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

                    const test = {
                        id: data.id,
                        title: data.title,
                        questions: data.questions,
                        type: data.type,
                        user: data.user,
                        created: data.created,
                        edited: data.edited,
                        purpose: data.purpose
                    }

                    doc.ref.set(test);
                    if(all) {
                        const falseMarkedTests = state.deleteMarkTests.filter(t => !t.toDelete.status);
                        commit('setDeleteMarkTests', falseMarkedTests);
                    } else {
                        const markedTests = state.deleteMarkTests.filter(t => t.id !== test.id);
                        commit('setDeleteMarkTests', markedTests);
                    }
                    commit('updateTest', test);
                    commit('updateCurrentTestsPage', test);
                    if(isSearching) commit('updateFilteredTest', test);
                    commit('setSuccess', 'Provas restauradas com sucesso!');
                });
            })
            .then(() => commit('setLoading', false))
            .catch(error => {
                commit('setLoading', false);
                commit('setError', error);
            });
    },
    changeDeleteStatusTests({ commit }, payload) {
        commit('setLoading', true);
        const { id, isSearching } = payload;

        db.collection('tests').where('id', '==', id).get()
            .then(snapshot => {
                const doc = snapshot.docs[0];
                const toDelete = {
                    status: false
                }

                doc.ref.update({ ...doc.data(), toDelete: { status: false } });

                commit('updateCurrentTestsPage', { ...doc.data(), toDelete });
                commit('updateTest', { ...doc.data(), toDelete });
                commit('updateDeleteMarkTest', { ...doc.data(), toDelete });
                if(isSearching) commit('updateFilteredTest', { ...doc.data(), toDelete });

                commit('setLoading', false);
                commit('setSuccess', 'Provas excluídas com sucesso!');
            })
            .catch(error => {
                commit('setError', error);
            });
    },
    deleteTests({ commit }) {
        db.collection("tests").where('toDelete.status', '==', false).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    doc.ref.delete();
                });

                db.collection('data-size').get()
                    .then(snap => {
                        const document = snap.docs[0];
                        const size = document.data().tests;

                        document.ref.update({ tests: size - snapshot.docs.length });
                        commit('addRemoveSize', { key: 'tests', data: size - snapshot.docs.length });
                    })
                    .catch(error => {
                        console.log(error);
                    });
            })
            .catch(error => {
                console.error("Error removing document: ", error);
            });
    },
    createTest({ commit }, payload) {
        commit('setLoading', true);

        const test = { ...payload, id: uuid() }

        const testAmount = this.getters.getDataSize.tests;
        const pageAmount = Math.ceil(testAmount / 8);
        const amount = testAmount % 10;

        db.collection("tests").add(test)
            .then(() => {
                commit('setLoading', false);
                commit('createTest', {
                    page: (amount === 10 || amount === 0 ? pageAmount + 1 : pageAmount),
                    data: test,
                    amount: testAmount
                });
                commit('setSuccess', 'Prova criada com sucesso!');

                db.collection('data-size').get()
                    .then(snap => {
                        const document = snap.docs[0];
                        const size = document.data().tests;

                        document.ref.update({ tests: size + 1 })
                            .then(() => {
                                commit('addRemoveSize', { key: 'tests', data: size + 1 });
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
                commit('setLoading', false);
                commit('setError', error);
            });
    },
    updateTest({ commit }, payload) {
        const test = { ...payload }
        db.collection("tests").where('id', '==', test.id).get()
            .then(snapshot => {
                snapshot.docs[0].ref.update(test);
                commit('updateTest', test);
                commit('updateCurrentTestsPage', test);
                commit('setLoading', false);
                commit('setSuccess', 'Prova editada com sucesso!');
            })
            .catch(error => {
                commit('setLoading', false);
                commit('setError', error);
            });
    },
    async getSubjectIQS({ commit }, payload) {
        const subject = payload;

        return new Promise((resolve, reject) => {
            try {
                db.collection('question-subjects')
                    .where('name', '==', subject)
                    .get()
                    .then(snapshot => {
                        const questions = snapshot.docs[0].data().questions;
                        resolve(questions);
                    })
                    .catch(error => {
                        commit('setError', error);
                    });
            } catch {
                reject('getSubjectIQS');
            }
        });
    },
    resetTests({ commit }) {
        commit('RESETTests');
    }
}

const getters = {
    loadedTests(state) {
        return state.loadedTests;
    },
    getTests(state) {
        return state.tests;
    },
    getDeleteMarkTests(state) {
        return state.deleteMarkTests;
    },
    getTestsByPage: state => page => {
        return state.tests['p' + page];
    },
    getCurrentTestsPage(state) {
        return state.currentTestsPage;
    },
    getFilteredTests(state) {
        return state.filteredTests;
    },
    getTestQuestions(state) {
        return state.testQuestions;
    },
    getNumberOfQuestionBySubjectOnTest: state => (subject, questions) => {
        let counter = 0;
        questions.forEach(element => {
            if (element.subject === subject)
                counter++;
        })
        return counter;
    },
    findTestById: state => id => {
        let test = null;
        for(let key in state.tests) {
            test = state.tests[key].find(t => t.id == id);
        }
        return test;
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}
