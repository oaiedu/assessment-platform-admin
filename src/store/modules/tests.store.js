import uuid from 'uuid-random';

import { db, storage } from '../../main';
import { getNowISOString } from '../../utils/date';
import { createErrorLog, showErrorMessage } from '../../utils/errors';

const initialState = () => ({
    loadedTests: [],
    tests: {},
    filteredTests: [],
    currentTestsPage: [],
    lastTestDocument: null,
    testQuestions: [],
    deleteMarkTests: [],
    lastTests: []
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
    setLastTests(state, data) {
        state.lastTests = data;
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
                return url;
            })
            .catch(error => {
                const errorModel = showErrorMessage('load', 'Prova', 'Image loading error - ' + error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Test Image Search', error.message, { payload });
            });

        return imageURL;
    },
    loadTestPage({ commit, dispatch, state }, payload) {
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

            request.then(async snapshot => {
                    if(snapshot.docs.length > 0) {
                        first = snapshot.docs[0].data().id;
                        last = snapshot.docs[snapshot.docs.length - 1].data().id;

                        const promises = snapshot.docs.map(async doc => {
                            const userData = await dispatch('getUserById', { id: doc.data().userId });
                            data.push({ ...doc.data(), user: userData });
                            return userData;
                        });

                        await Promise.all(promises);
                    }
                })
                .then(() => {
                    commit('setCurrentTestsPage', data);
                    commit('setTestPage', { page: 'p' + page, data });
                    commit('setLastTestDocument', [first, last]);
                    commit('setLoading', false);
                })
                .catch(error => {
                    commit('setLoading', false);
                    const errorModel = showErrorMessage('load', 'Provas', error.message);
                    commit('setError', { message: errorModel });
                    createErrorLog('Test Page Load', error.message, { payload, data });
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
    loadFOLTestPage({ commit, dispatch, state }, payload) {
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

            request.then(async snapshot => {
                    if(snapshot.docs.length > 0) {
                        first = snapshot.docs[0].data().id;
                        last = snapshot.docs[snapshot.docs.length - 1].data().id;

                        const promises = snapshot.docs.map(async doc => {
                            const userData = await dispatch('getUserById', { id: doc.data().userId });
                            data.push({ ...doc.data(), user: userData });
                            return userData;
                        });

                        await Promise.all(promises);
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
                    commit('setLoading', false);
                    const errorModel = showErrorMessage('load', 'Provas', error.message);
                    commit('setError', { message: errorModel });
                    createErrorLog('Test FOL Page Load', error.message, { payload, data });
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
                        const errorModel = showErrorMessage('connection', '', error.message);
                        commit('setError', { message: errorModel });
                        createErrorLog('Test Exists Check', error.message, { payload });
                    });
            } catch(error) {
                reject();
            }
        });
    },
    searchTests({ commit, dispatch }, payload) {
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
            .then(async () => {
                const promises = data.map(async (doc, index) => {
                    const userData = await dispatch('getUserById', { id: doc.userId });
                    data[index] = { ...doc, user: userData };
                    return userData;
                });

                await Promise.all(promises);
            })
            .then(() => {
                commit('setFilteredTests', data);
                commit('setLoading', false);
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('load', 'Provas', 'Searching error - ' + error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Test Search', error.message, { payload, data });
            });
    },
    loadTestQuestions({ commit }, payload) {
        const data = [...payload.questions];
        commit('setTestQuestions', data);
    },
    checkDeleteMarkTests({ commit, dispatch }) {
        const data = [];

        db.collection('tests').where('toDelete.status', '==', true).get()
            .then(async snapshot => {
                const promises = snapshot.docs.map(async doc => {
                    const userData = await dispatch('getUserById', { id: doc.data().userId });
                    data.push({ ...doc.data(), user: userData });
                    return userData;
                });

                await Promise.all(promises);
            })
            .then(() => {
                commit('setDeleteMarkTests', data);
            })
            .catch(error => {
                const errorModel = showErrorMessage('connection', '', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Test Mark Check', error.message, { data });
            });
    },
    deleteMarkTest({ commit, dispatch }, payload) {
        commit('setLoading', true);

        const { id, isSearching, userEmail } = payload;

        db.collection('tests').where('id', '==', id).get()
            .then(async snapshot => {
                const doc = snapshot.docs[0];

                const toDelete = {
                    status: true,
                    userEmail
                }

                doc.ref.update({ toDelete });

                const user = await dispatch('getUserById', { id: doc.data().userId });

                commit('setDeleteMarkTest', { id, toDelete, user });

                if(isSearching) {
                    commit('setDeleteMarkFilteredTest', { id, toDelete, user });
                }

                commit('updateCurrentTestsPage', { ...doc.data(), toDelete, user });
                commit('addDeleteMarkTest', { ...doc.data(), toDelete, user });
                commit('setLoading', false);
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('connection', '', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Test Delete Mark', error.message, { payload });
            });
    },
    restoreMarkedTest({ commit }, payload) {
        commit('setLoading', true);

        const { id, isSearching } = payload;
        let docData = null;

        db.collection('tests').where('id', '==', id).get()
            .then(async snapshot => {
                const doc = snapshot.docs[0];
                const data = doc.data();
                docData = data;

                const test = {
                    id: data.id,
                    title: data.title,
                    questions: data.questions,
                    type: data.type,
                    userId: data.userId,
                    created: data.created,
                    editedBy: data.editedBy,
                    purpose: data.purpose
                }

                doc.ref.set(test);

                const user = await dispatch('getUserById', { id: doc.data().userId });
                test['user'] = user;

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
                const errorModel = showErrorMessage('connection', '', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Test Restore', error.message, { payload, docData });
            });
    },
    restoreAllMarkedTests({ commit, dispatch, state }, payload) {
        commit('setLoading', true);

        const { all, isSearching, user } = payload;
        let docData = null;

        const ref = db.collection('tests').where('toDelete.status', '==', true);
        let request = null;

        if(all) {
            request = ref;
        } else {
            request = ref.where('toDelete.userEmail', '==', user.email);
        }

        request.get()
            .then(snapshot => {
                snapshot.forEach(async doc => {
                    const data = doc.data();
                    docData = data;

                    const test = {
                        id: data.id,
                        title: data.title,
                        questions: data.questions,
                        type: data.type,
                        userId: data.userId,
                        created: data.created,
                        editedId: data.editedId,
                        purpose: data.purpose
                    }

                    doc.ref.set(test);

                    const userData = await dispatch('getUserById', { id: doc.data().userId });

                    test['user'] = userData;

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
                const errorModel = showErrorMessage('connection', '', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Test Restore All', error.message, { payload, docData });
            });
    },
    changeDeleteStatusTests({ commit, dispatch }, payload) {
        commit('setLoading', true);
        const { id, isSearching } = payload;

        db.collection('tests').where('id', '==', id).get()
            .then(async snapshot => {
                const doc = snapshot.docs[0];
                const toDelete = {
                    status: false
                }

                doc.ref.update({ ...doc.data(), toDelete: { status: false } });

                const user = await dispatch('getUserById', { id: doc.data().userId });

                commit('updateCurrentTestsPage', { ...doc.data(), toDelete, user });
                commit('updateTest', { ...doc.data(), toDelete, user });
                commit('updateDeleteMarkTest', { ...doc.data(), toDelete, user });
                if(isSearching) commit('updateFilteredTest', { ...doc.data(), toDelete, user });

                commit('setLoading', false);
                commit('setSuccess', 'Provas excluídas com sucesso!');
            })
            .catch(error => {
                const errorModel = showErrorMessage('exclusion', 'Provas', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Test Confirm Delete', error.message, { payload });
            });
    },
    deleteTests({ commit, dispatch }) {
        const data = [];

        db.collection("tests").where('toDelete.status', '==', false).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    doc.ref.delete();
                    data.push(doc.data());
                });

                db.collection('data-size').get()
                    .then(snap => {
                        const document = snap.docs[0];
                        const size = document.data().tests;

                        document.ref.update({ tests: size - snapshot.docs.length });
                        commit('addRemoveSize', { key: 'tests', data: size - snapshot.docs.length });
                    })
                    .catch(error => {
                        console.error(error);
                    });
            })
            .then(() => {
                if (data.length > 0) dispatch('removeTestsByWeek', { tests: data });
            })
            .catch(error => {
                console.error("Error removing test: ", error);
                createErrorLog('Test DB Delete', error.message, { data });
            });
    },
    createTest({ commit, dispatch }, payload) {
        commit('setLoading', true);

        const createdDate = getNowISOString();
        const { testData, userInfo } = payload;

        const test = {
            id: uuid(),
            ...testData,
            created: createdDate,
            updated: createdDate
        }

        const testAmount = this.getters.getDataSize.tests;
        const pageAmount = Math.ceil(testAmount / 8);
        const amount = testAmount % 10;

        db.collection("tests").add(test)
            .then(() => {
                commit('setLoading', false);
                commit('createTest', {
                    page: (amount === 10 || amount === 0 ? pageAmount + 1 : pageAmount),
                    data: { ...test, user: {...userInfo} },
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
                                dispatch('addTestsByWeek');
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
                const errorModel = showErrorMessage('creation', 'Prova', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Test DB Insert', error.message, { test });
            });
    },
    updateTest({ commit, dispatch }, payload) {
        const test = { ...payload, updated: getNowISOString() }
        db.collection("tests").where('id', '==', test.id).get()
            .then(async snapshot => {
                snapshot.docs[0].ref.update(test);

                const user = await dispatch('getUserById', { id: snapshot.docs[0].userId });
                test['user'] = user;

                commit('updateTest', test);
                commit('updateCurrentTestsPage', test);
                commit('setLoading', false);
                commit('setSuccess', 'Prova editada com sucesso!');
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('edition', 'Prova', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Test DB Update', error.message, { payload });
            });
    },
    async getSubjectIQS({ commit }, payload) {
        const subject = payload;

        return new Promise((resolve, reject) => {
            try {
                db.collection('question-subjects').where('name', '==', subject).get()
                    .then(snapshot => {
                        const questions = snapshot.docs[0].data().questions;
                        resolve(questions);
                    })
                    .catch(error => {
                        const errorModel = showErrorMessage('load', 'IQs' + error.message);
                        commit('setError', { message: errorModel });
                        createErrorLog('Test Subject IQs', error.message, { payload });
                    });
            } catch(error) {
                reject('getSubjectIQS');
            }
        });
    },
    loadLastTests({ commit, dispatch }, payload) {
        commit('setLoading', true);

        const { limit } = payload;

        const data = [];

        db.collection('tests').orderBy('updated', 'desc').limit(limit || 5).get()
            .then(async snapshot => {
                const promises = snapshot.docs.map(async doc => {
                    const userData = await dispatch('getUserById', { id: doc.data().userId });
                    data.push({ ...doc.data(), user: userData });
                    return userData;
                });

                await Promise.all(promises);
            })
            .then(() => {
                commit('setLastTests', data);
                commit('setLoading', false);
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('load', 'Provas', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Last Tests Loading', error.message, { payload });
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
    getLastTests(state) {
        return state.lastTests;
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

        test = state.lastTests.find(t => t.id == id);

        if (!test) {
            for(let key in state.tests) {
                test = state.tests[key].find(t => t.id == id);
            }
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
