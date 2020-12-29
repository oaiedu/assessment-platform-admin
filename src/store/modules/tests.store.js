import * as firebase from 'firebase';
import uuid from 'uuid-random';

import { db, storage } from '../../main';

const initialState = () => ({
    loadedTests: [],
    tests: {},
    filteredTests: [],
    currentTestsPage: [],
    lastTestDocument: null,
    testQuestions: []
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
    setTestQuestions(state, data) {
        state.testQuestions = data;
    },
    createTest(state, data) {
        const tests = state.tests[data.page] || [];
        tests.push(data.data);
        state.tests[data.page] = tests;
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
    findImageTests({ commit },payload) {
        const pathReference = storage.refFromURL(`gs://pwr-quiz-generator.appspot.com/${payload}`);

        const imageURL =  pathReference.getDownloadURL()
            .then(url => {
                console.log("URL",url);
                return url;
            })
            .catch(error => {
                console.error("Error downloading the image", error);
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

        if(!pages.includes('p' + page)) {
            let request = null;
            const ref = db.collection('tests').orderBy('id');

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
            .where('title', '>=', payload.toLowerCase())
            .where('title', '<=', payload.toLowerCase() + '~')
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
                    .where('title', '>=', payload)
                    .where('title', '<=', payload + '~')
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
                console.log(error);
            });
    },
    async loadTestQuestions({ commit, dispatch }, payload) {
        const data = [];

        const promises = payload.questions.map(element => {
            return dispatch('getQuestionByIQ', element)
                .then(question => {
                    data.push(question);
                });
        });

        await Promise.all(promises);

        commit('setTestQuestions', data);
    },
    deleteTest({ commit }, payload) {
        commit('setLoading', true);
        const { id, isSearching } = payload;
        db.collection("tests").where('id', '==', id).get()
            .then(snapshot => {
                snapshot.docs[0].ref.delete();
            })
            .then(() => {
                commit('setLoading', false);
                commit('deleteTest', id);

                if(isSearching) {
                    commit('deleteFilteredTest', id);
                }

                db.collection('data-size').get()
                    .then(snap => {
                        const document = snap.docs[0];
                        const size = document.data().tests;

                        document.ref.update({ tests: size - 1 })
                            .then(() => {
                                commit('addRemoveSize', { key: 'tests', data: size - 1 });
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
                console.error("Error removing document: ", error);
            });
    },
    createTest({ commit }, payload) {
        commit('setLoading', true);

        const test = { ...payload, id: uuid() }

        const testAmount = this.getters.getDataSize.tests;
        const pageAmount =  Math.ceil(testAmount / 8);
        const pageTests = this.getters.getTestsByPage(pageAmount);
        const amount = pageTests ? pageTests.length : 0;

        db.collection("tests").add(test)
            .then(() => {
                commit('setLoading', false);
                commit('createTest', { page: 'p' + (amount === 8 ? pageAmount + 1 : pageAmount), data: test });

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
                console.error("Error writing document: ", error);
            });
    },
    updateTest({ commit }, payload) {
        const test = { ...payload }
        db.collection("tests").where('id', '==', test.id).get()
            .then(snapshot => {
                snapshot.docs[0].ref.update(test);
            })
            .then(() => {
                commit('updateTest', payload);
                commit('setLoading', false);
            })
            .catch(error => {
                console.error("Error writing document: ", error);
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
        for(let key in state.tests) {
            return state.tests[key].find(t => t.id == id);
        }
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}
