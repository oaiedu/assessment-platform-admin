import { Store } from 'vuex';
import uuid from 'uuid-random';

import { db } from '../../main';
import { getNowISOString } from '../../utils/date';
import { createErrorLog, showErrorMessage } from '../../utils/errors';

/**
 * @typedef {import('./questions.store.js').Question} Question
 */

/**
 * @typedef {Object} DeleteStatus
 * @property {boolean} toDelete.status - If true, the question can be restored. If false, it will be deleted.
 * @property {string|undefined} toDelete.userEmail - The user that marked the question to be deleted.
 */

/**
 * @typedef {Object} TestCreation
 * @property {string} userId - The user that created the test.
 * @property {string|null} editedBy - The last user that edited the test.
 * @property {string} title - The test title.
 * @property {string} purpose - The test purpose.
 * @property {"selected"|"random"} type - The test type.
 * @property {Question[]} questions - The test questions.
 */

/**
 * @typedef {Object} Test
 * @property {string} id - The test id.
 * @property {string} created - The test creation date.
 * @property {string} updated - The test edition date.
 * @property {string} userId - The user that created the test.
 * @property {string|null} editedBy - The last user that edited the test.
 * @property {string} title - The test title.
 * @property {string} purpose - The test purpose.
 * @property {"selected"|"random"} type - The test type.
 * @property {Question[]} questions - The test questions.
 * @property {DeleteStatus|undefined} toDelete - The test deletion status.
 */

/**
 * @typedef {Object} TestsState
 * @property {Object.<string, Test[]>} tests - The pages with it's tests list.
 * @property {Test[]} filteredTests - An array of tests filtered by id.
 * @property {Test[]} currentTestsPage - An array of tests of the current page.
 * @property {[string, string]|null} lastTestDocument - An array with the first and last test id from the last request.
 * @property {Question[]} testQuestions - An array of questions from a specific test.
 * @property {Test[]} deleteMarkTests - An array of tests that were marked to be deleted.
 * @property {Test[]} lastTests - An array of the most recent tests.
 */

/**
 * Gets the initial state of tests state.
 *
 * @returns {TestsState} The initial state of tests state.
 */
const initialState = () => ({
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
    /**
     * Sets a page of tests according to the given data.
     *
     * @param {TestsState} state - The tests state.
     * @param {Object} data - The data containing the page number and it's data.
     * @param {string} data.page - The page number.
     * @param {Test[]} data.data - An array of tests.
     */
    setTestPage(state, data) {
        state.tests[data.page] = data.data;
    },
    /**
     * Sets the filtered tests.
     *
     * @param {TestsState} state - The tests state.
     * @param {Test[]} data - An array of filtered tests.
     */
    setFilteredTests(state, data) {
        state.filteredTests = data;
    },
    /**
     * Sets the most recent tests.
     *
     * @param {TestsState} state - The tests state.
     * @param {Test[]} data - An array of tests.
     */
    setLastTests(state, data) {
        state.lastTests = data;
    },
    /**
     * Cleans the filtered tests array.
     *
     * @param {TestsState} state - The tests state.
     */
    resetFilteredTests(state) {
        state.filteredTests = [];
    },
    /**
     * Cleans the current tests page array.
     *
     * @param {TestsState} state - The tests state.
     */
    resetCurrentTestsPage(state) {
        state.currentTestsPage = [];
    },
    /**
     * Sets the current tests page array.
     *
     * @param {TestsState} state - The tests state.
     * @param {Test[]} data - An array of tests.
     */
    setCurrentTestsPage(state, data) {
        state.currentTestsPage = data;
    },
    /**
     * Adds a test to the array of tests marked to be deleted.
     *
     * @param {TestsState} state - The tests state.
     * @param {Test} data - The test to be added.
     */
    addDeleteMarkTest(state, data) {
        state.deleteMarkTests.push(data);
    },
    /**
     * Updates a test that's in the array of tests marked to be deleted.
     *
     * @param {TestsState} state - The tests state.
     * @param {Test} data - The test to be updated.
     */
    updateDeleteMarkTest(state, data) {
        const tests = [...state.deleteMarkTests];
        tests.forEach((item, index) => {
            if(item.id === data.id) {
                tests[index] = data;
            }
        });
        state.deleteMarkTests = tests;
    },
    /**
     * Removes a test from the array of tests marked to be deleted.
     *
     * @param {TestsState} state - The tests state.
     * @param {Test} data - The id of the test to be removed.
     */
    removeDeleteMarkTest(state, data) {
        const tests = [...state.deleteMarkTests];
        tests.forEach((item, index) => {
            if(item.id === data) {
                state.deleteMarkTests.splice(index, 1);
            }
        })
    },
    /**
     * Sets the array of tests marked to be deleted.
     *
     * @param {TestsState} state - The tests state.
     * @param {Test[]} data - An array of tests marked to be deleted.
     */
    setDeleteMarkTests(state, data) {
        state.deleteMarkTests = data;
    },
    /**
     * Sets a test as marked to be deleted.
     *
     * @param {TestsState} state - The tests state.
     * @param {Object} data - The data containing the test id and the deletion status.
     * @param {string} data.id - The test id.
     * @param {DeleteStatus} data.toDelete - The test deletion status.
     */
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
    /**
     * Sets a test as marked to be deleted into the filtered tests array.
     *
     * @param {TestsState} state - The tests state.
     * @param {Object} data - The data containing the test id and the deletion status.
     * @param {string} data.id - The test id.
     * @param {DeleteStatus} data.toDelete - The test deletion status.
     */
    setDeleteMarkFilteredTest(state, data) {
        const tests = [...state.filteredTests];
        tests.forEach((item, index) => {
            if(item.id === data.id) {
                tests[index] = { ...item, toDelete: data.toDelete };
            }
        });
        state.filteredTests = tests;
    },
    /**
     * Sets the test questions.
     *
     * @param {TestsState} state - The tests state.
     * @param {Question[]} data - An array of questions.
     */
    setTestQuestions(state, data) {
        state.testQuestions = data;
    },
    /**
     * Creates a test into the tests object, according to the given data.
     *
     * @param {TestsState} state - The tests state.
     * @param {Object} data - The data containing the test data and the page number.
     * @param {number} data.page - The page number.
     * @param {number} data.amount - The total amount of tests.
     * @param {Test} data.data - The test to be created.
     */
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
    /**
     * Updates a test into the test object, according to the test's id.
     *
     * @param {TestsState} state - The tests state.
     * @param {test} data - The test to be updated.
     */
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
    /**
     * Updates a test that's in the filtered tests array, according to the test's id.
     *
     * @param {TestsState} state - The tests state.
     * @param {Test} data - The test to be updated.
     */
    updateFilteredTest(state, data) {
        const tests = [...state.filteredTests];
        tests.forEach((item, index) => {
            if(item.id === data.id) {
                tests[index] = data;
            }
        });
        state.filteredTests = tests;
    },
    /**
     * Updates a test that's in the current tests page array, according to the test's id.
     *
     * @param {TestsState} state - The tests state.
     * @param {Test} data - The test to be updated.
     */
    updateCurrentTestsPage(state, data) {
        const tests = [...state.currentTestsPage];
        tests.forEach((item, index) => {
            if(item.id === data.id) {
                tests[index] = data;
            }
        });
        state.currentTestsPage = tests;
    },
    /**
     * Deletes a test from the test object, according to the given data.
     *
     * @param {TestsState} state - The tests state.
     * @param {string} data - The id of the test to be deleted.
     */
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
    /**
     * Deletes a test from the filtered tests array, according to the given data.
     *
     * @param {TestsState} state - The tests state.
     * @param {string} data - The IQ of the test to be deleted.
     */
    deleteFilteredTest(state, data) {
        const tests = state.filteredTests;
        tests.forEach((item, index) => {
            if(item.id === data) {
                state.filteredTests.splice(index, 1);
            }
        });
    },
    /**
     * Sets the last test request IQs.
     *
     * @param {TestsState} state - The tests state.
     * @param {[string, string]} data An array of strings containing the first and last test ids from the last request.
     */
    setLastTestDocument(state, data) {
        state.lastTestDocument = data;
    },
    /**
     * Resets the tests state to it's initial state.
     *
     * @param {TestsState} state - The tests state.
     */
    RESETTests(state) {
        const newState = initialState();
        Object.keys(newState).forEach(key => {
            state[key] = newState[key];
        });
    }
}

const actions = {
    /**
     * Loads a page of tests according to the payload data.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {number} payload.page - The page number.
     * @param {number} payload.itemsPerPage - The amount of items per page.
     * @param {"next"|"previous"} payload.type - The request type.
     */
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
    /**
     * Loads the first or last page according to the payload data.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {number} payload.page - The page number.
     * @param {number} payload.itemsPerPage - The amount of items per page.
     * @param {"first"|"last"} payload.mode - The request mode.
     */
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
    /**
     * Checks if a test with the given title exists.
     *
     * @param {Store} store - The vuex store.
     * @param {string} payload - The test title.
     * @returns {Promise<number>} The number of tests that match the given title.
     */
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
    /**
     * Searches for tests based on their title.
     *
     * @param {Store} store - The vuex store.
     * @param {string} payload - The string to be searched.
     */
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
    /**
     * Loads the questions from a given test.
     *
     * @param {Store} store - The vuex store.
     * @param {Test} payload - The test payload.
     */
    loadTestQuestions({ commit }, payload) {
        commit('setTestQuestions', [...payload.questions]);
    },
    /**
     * Loads all tests that are marked to be deleted.
     *
     * @param {Store} store - The vuex store.
     */
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
    /**
     * Marks a test to be deleted.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {string} payload.id - The test id.
     * @param {boolean} payload.isSearching - Whether the application is using filtered tests or not.
     * @param {string} payload.userEmail - The current user e-mail.
     */
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

                commit('setDeleteMarkTest', { id, toDelete });

                if(isSearching) {
                    commit('setDeleteMarkFilteredTest', { id, toDelete });
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
    /**
     * Restores a test from being marked to be deleted.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {string} payload.id - The test id.
     * @param {boolean} payload.isSearching - Whether the application is using filtered tests or not.
     */
    restoreMarkedTest({ commit }, payload) {
        commit('setLoading', true);

        const { id, isSearching } = payload;
        let docData = null;

        db.collection('tests').where('id', '==', id).get()
            .then(async snapshot => {
                const doc = snapshot.docs[0];
                const data = doc.data();
                docData = data;

                /**
                 * @type {Test}
                 */
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

                const user = await dispatch('getUserById', { id: test.userId });
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
    /**
     * Restores all tests that are marked to be deleted from the database or the current user, depending on the given data.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {boolean} payload.all - Whether will restore all database tests or only from the current user.
     * @param {boolean} payload.isSearching - Whether the application is using filtered tests or not.
     * @param {import('./signUser.store.js').UserInfo} payload.user - The current user info.
     */
    restoreAllMarkedTests({ commit, dispatch }, payload) {
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

                    /**
                     * @type {Test}
                     */
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

                    const userData = await dispatch('getUserById', { id: test.userId });
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
    /**
     * Changes a test's delete status to false (confirmed deletion).
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {string} payload.id - The test id.
     * @param {boolean} payload.isSearching - Whether the application is using filtered tests or not.
     */
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
    /**
     * Deletes all tests that are marked to be deleted (toDelete.status = false).
     *
     * @param {Store} store - The vuex store.
     */
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
    /**
     * Creates a new test.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {TestCreation} payload.testData - The test to be created.
     * @param {import('./signUser.store.js').UserInfo} payload.userInfo - The current user info.
     */
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
                    page: (amount === 0 ? pageAmount + 1 : pageAmount),
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
    /**
     * Updates a test based on it's id.
     *
     * @param {Store} store - The vuex store.
     * @param {Test} payload - The test to be updated.
     */
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
    /**
     * Gets all the questions IQs from a subject.
     *
     * @param {Store} store - The vuex store.
     * @param {string} payload - The subject name.
     * @returns {Promise<string[]>} An array of IQs.
     */
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
    /**
     * Loads the most recent tests.
     *
     * @param {Store} store - The vuex store.
     */
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
    /**
     * Resets the tests state to it's initial state.
     *
     * @param {Store} store - The vuex store.
     */
    resetTests({ commit }) {
        commit('RESETTests');
    }
}

const getters = {
    /**
     * Gets an object with all loaded pages and it's tests.
     *
     * @param {TestsState} state - The tests state.
     * @returns {Object.<string, Test[]>} The tests pages object.
     */
    getTests(state) {
        return state.tests;
    },
    /**
     * Gets the most recent tests.
     *
     * @param {TestsState} state - The tests state.
     * @returns {Test[]} An array of tests.
     */
    getLastTests(state) {
        return [...state.lastTests].sort((t1, t2) => t1.updated > t2.updated ? -1 : 1);
    },
    /**
     * Gets an array of tests that are marked to be deleted.
     *
     * @param {TestsState} state - The tests state.
     * @returns {Test[]} An array of tests that are marked to be deleted.
     */
    getDeleteMarkTests(state) {
        return state.deleteMarkTests;
    },
    /**
     * Gets an array of tests of the given page.
     *
     * @param {TestsState} state - The tests state.
     * @param {number} page - The page number.
     * @returns {Test[]} An array of tests.
     */
    getTestsByPage: state => page => {
        return state.tests['p' + page];
    },
    /**
     * Gets an array of the current page tests.
     *
     * @param {TestsState} state - The tests state.
     * @returns {Test[]} An array of tests.
     */
    getCurrentTestsPage(state) {
        return state.currentTestsPage;
    },
    /**
     * Gets an array of filtered tests.
     *
     * @param {TestsState} state - The tests state.
     * @returns {Test[]} An array of tests.
     */
    getFilteredTests(state) {
        return state.filteredTests;
    },
    /**
     * Gets an array of questions from a specific test.
     *
     * @param {TestsState} state - The tests state.
     * @returns {Question[]} An array of questions.
     */
    getTestQuestions(state) {
        return state.testQuestions;
    },
    /**
     * Gets the number of questions of the given subject.
     *
     * @param {TestsState} state - The tests state.
     * @param {string} subject - The subject name.
     * @param {Question[]} questions - An array of questions.
     * @returns {(subject: string, questions: Question[]) => number} The number of questions of the subject.
     */
    getNumberOfQuestionBySubjectOnTest(state) {

        return (subject, questions) => {
            let counter = 0;
            questions.forEach(question => {
                if (question.subject === subject)
                    counter++;
            })
            return counter;
        }
    },
    /**
     * Gets a test from the test state based on it's id.
     *
     * @param {TestsState} state - The tests state.
     * @param {string} id - The test id.
     * @returns {(id: string) => Test|null} The test or null if not found.
     */
    findTestById(state) {
        return id => {
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
}

export default {
    state,
    mutations,
    actions,
    getters
}
