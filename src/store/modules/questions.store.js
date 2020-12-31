import { db, storage } from '../../main';

const initialState = () => ({
    deleteQuestionId: null,
    questions: {},
    filteredQuestions: [],
    currentQuestionsPage: [],
    subjects: [
        "Teoria do Reator",
        "Termodinâmica",
        "Instrumentação e Controle",
        "Válvulas e Bombas",
        "Eletricidade",
        "Mecânica dos Fluidos",
        "Tratamento Qúimico Refrigerante",
        "Análise Integrada",
        "Instrumentação Nuclear",
        "Física Nuclear",
        "Transferência de Calor",
        "Materiais"
    ],
    subjectsAmount: null,
    lastQuestionDocument: null,
    deleteMarkQuestions: []
});

const state = initialState();

const mutations = {
    setQuestions(state, data) {
        state.questions = data;
    },
    setQuestionPage(state, data) {
        state.questions[data.page] = data.data;
    },
    setFilteredQuestions(state, data) {
        state.filteredQuestions = data;
    },
    resetFilteredQuestions(state) {
        state.filteredQuestions = [];
    },
    resetCurrentQuestionsPage(state) {
        state.currentQuestionsPage = [];
    },
    addDeleteMarkQuestion(state, data) {
        state.deleteMarkQuestions.push(data);
    },
    updateDeleteMarkQuestion(state, data) {
        const questions = [...state.deleteMarkQuestions];
        questions.forEach((item, index) => {
            if(item.iq === data.iq) {
                questions[index] = data;
            }
        });
        state.deleteMarkQuestions = questions;
    },
    removeDeleteMarkQuestion(state, data) {
        const questions = [...state.deleteMarkQuestions];
        questions.forEach((item, index) => {
            if(item.iq === data) {
                state.deleteMarkQuestions.splice(index, 1);
            }
        })
    },
    setDeleteMarkQuestions(state, data) {
        state.deleteMarkQuestions = data;
    },
    setDeleteMarkQuestion(state, data) {
        const questions = state.questions;
        for(let key in questions) {
            if(questions[key]) {
                questions[key].forEach((item, index) => {
                    if(item.iq === data.iq) {
                        state.questions[key][index] = { ...item, toDelete: data.toDelete };
                    }
                });
            }
        }
    },
    setDeleteMarkFilteredQuestion(state, data) {
        const questions = [...state.filteredQuestions];
        questions.forEach((item, index) => {
            if(item.iq === data.iq) {
                questions[index] = { ...item, toDelete: data.toDelete };
            }
        });
        state.filteredQuestions = questions;
    },
    setDeletedQuestion(state, data) {
        state.deleteQuestionId = data;
    },
    addCurrentQuestion(state, data) {
        const questions = [...state.currentQuestionsPage];
        questions.push(data);
        state.currentQuestionsPage = questions;
    },
    setCurrentQuestionsPage(state, data) {
        state.currentQuestionsPage = data;
    },
    createQuestion(state, data) {
        const questions = state.questions[data.page] || [];
        questions.push(data.data);
        state.questions[data.page] = questions;
    },
    updateQuestion(state, data) {
        const questions = state.questions;
        for(let key in questions) {
            if(questions[key]) {
                questions[key].forEach((item, index) => {
                    if(item.iq === data.iq) {
                        state.questions[key][index] = data;
                    }
                });
            }
        }
    },
    updateFilteredQuestion(state, data) {
        const questions = [...state.filteredQuestions];
        questions.forEach((item, index) => {
            if(item.iq === data.iq) {
                questions[index] = data;
            }
        });
        state.filteredQuestions = questions;
    },
    updateCurrentQuestionsPage(state, data) {
        const questions = [...state.currentQuestionsPage];
        questions.forEach((item, index) => {
            if(item.iq === data.iq) {
                questions[index] = data;
            }
        });
        state.currentQuestionsPage = questions;
    },
    deleteQuestion(state, data) {
        const questions = state.questions;
        for(let key in questions) {
            if(questions[key]) {
                questions[key].forEach((item, index) => {
                    if(item.iq === data) {
                        state.questions[key].splice(index, 1);
                    }
                });
            }
        }
    },
    deleteFilteredQuestion(state, data) {
        const questions = [...state.filteredQuestions];
        questions.forEach((item, index) => {
            if(item.iq === data) {
                state.filteredQuestions.splice(index, 1);
            }
        });
    },
    setLastQuestionDocument(state, data) {
        state.lastQuestionDocument = data;
    },
    RESETQuestions(state) {
        const newState = initialState();
        Object.keys(newState).forEach(key => {
            state[key] = newState[key];
        });
    }
}

const actions = {
    loadQuestions({ commit }) {
        commit('setLoading', true);
        let data = [];
        db.collection('questions').get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                data.push(doc.data());
            });
            commit('setQuestions', data);
            commit('setLoading', false);
        })
    },
    loadQuestionPage({ commit, state }, payload) {
        commit('setLoading', true);

        const { page, itemsPerPage, type } = payload;
        const data = [];

        const pages = Object.keys(state.questions);

        if(!pages.includes('p' + page)) {
            let request = null;
            const ref = db.collection('questions').orderBy('iq');

            if(type === 'next') {
                request = ref.startAfter(state.lastQuestionDocument[1]).limit(itemsPerPage).get();
            } else {
                request = ref.endBefore(state.lastQuestionDocument[0]).limitToLast(itemsPerPage).get();
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
                    commit('setCurrentQuestionsPage', data);
                    commit('setQuestionPage', { page: 'p' + page, data });
                    commit('setLastQuestionDocument', [first, last]);
                    commit('setLoading', false);
                })
                .catch(error => {
                    console.log(error);
                });
        } else {
            const pageContent = state.questions['p' + page];
            const first = pageContent[0].iq;
            const last = pageContent[pageContent.length - 1].iq;

            commit('setCurrentQuestionsPage', pageContent);
            commit('setLastQuestionDocument', [first, last]);
            commit('setLoading', false);
        }
    },
    loadFOLQuestionPage({ commit, state }, payload) {
        commit('setLoading', true);

        const { page, itemsPerPage, mode } = payload;
        const data = [];

        const pages = Object.keys(state.questions);

        const questionAmount = this.getters.getDataSize.questions.general;
        const amount = questionAmount % 8;

        if(!pages.includes('p' + page)) {
            let request = null;
            const ref = db.collection('questions').orderBy('iq');

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
                    commit('setCurrentQuestionsPage', data);
                    commit('setQuestionPage', { page: 'p' + page, data });
                    commit('setLastQuestionDocument', [first, last]);
                    commit('setLoading', false);
                })
                .catch(error => {
                    console.log(error);
                });
        } else {
            const pageContent = state.questions['p' + page];
            const first = pageContent[0].iq;
            const last = pageContent[pageContent.length - 1].iq;

            commit('setCurrentQuestionsPage', pageContent);
            commit('setLastQuestionDocument', [first, last]);
            commit('setLoading', false);
        }
    },
    searchQuestions({ commit }, payload) {
        commit('setLoading', true);

        const data = [];

        db.collection('questions').orderBy('iq')
            .where('iq', '>=', payload.toUpperCase())
            .where('iq', '<=', payload.toUpperCase() + '~')
            .get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    data.push(doc.data());
                });
            })
            .then(() => {
                commit('setFilteredQuestions', data);
                commit('setLoading', false);
            })
            .catch(error => {
                console.log(error);
            });
    },
    async checkQuestioninTests(store, payload) {
        const { iq } = payload;

        return new Promise((resolve, reject) => {
            try {
                const tests = [];

                db.collection('tests').where('questions', 'array-contains', iq).get()
                    .then(snapshot => {
                        snapshot.forEach(doc => {
                            tests.push(doc.data());
                        });
                    })
                    .then(() => {
                        resolve(tests);
                    })
                    .catch(error => {
                        console.log(error);
                    })
            } catch {
                reject('Check Questions In Tests Error!');
            }
        });
    },
    checkDeleteMarkQuestions({ commit }) {
        const data = [];

        db.collection('questions').where('toDelete.status', '==', true).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    data.push(doc.data());
                });
            })
            .then(() => {
                commit('setDeleteMarkQuestions', data);
            })
            .catch(error => {
                console.log(error);
            });
    },
    deleteMarkQuestion({ commit, state }, payload) {
        commit('setLoading', true);

        const { iq, isSearching, userEmail } = payload;

        db.collection('questions').where('iq', '==', iq).get()
            .then(snapshot => {
                const doc = snapshot.docs[0];

                const toDelete = {
                    status: true,
                    userEmail
                }

                doc.ref.update({ toDelete });

                commit('setDeleteMarkQuestion', { iq, toDelete });

                if(isSearching) {
                    commit('setDeleteMarkFilteredQuestion', { iq, toDelete });
                }

                commit('updateCurrentQuestionsPage', { ...doc.data(), toDelete });
                commit('addDeleteMarkQuestion', { ...doc.data(), toDelete });
                commit('setLoading', false);
            })
            .catch(error => {
                console.log(error);
            });
    },
    restoreMarkedQuestion({ commit }, payload) {
        commit('setLoading', true);

        const { iq, isSearching } = payload;

        db.collection('questions').where('iq', '==', iq).get()
            .then(snapshot => {
                const doc = snapshot.docs[0];
                const data = doc.data();

                const question = {
                    iq: data.iq,
                    subject: data.subject,
                    question: data.question,
                    knowledge: data.knowledge,
                    knowledgePWR: data.knowledgePWR,
                    knowledgeBWR: data.knowledgeBWR,
                    answers: data.answers,
                    image: data.image,
                    imageSize: data.imageSize,
                    edited: data.edited || []
                };

                doc.ref.set(question);
                commit('updateQuestion', question);

                if(isSearching) {
                    commit('updateFilteredQuestion', question);
                }

                commit('removeDeleteMarkQuestion', iq);
                commit('updateCurrentQuestionsPage', question);
                commit('setLoading', false);
            })
            .catch(error => {
                console.log(error);
            });
    },
    restoreAllMarkedQuestions({ commit, state }, payload) {
        commit('setLoading', true);

        const { isSearching } = payload;

        db.collection('questions').where('toDelete.status', '==', true).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    const data = doc.data();

                    const question = {
                        iq: data.iq,
                        subject: data.subject,
                        question: data.question,
                        knowledge: data.knowledge,
                        knowledgePWR: data.knowledgePWR,
                        knowledgeBWR: data.knowledgeBWR,
                        answers: data.answers,
                        image: data.image,
                        imageSize: data.imageSize,
                        edited: data.edited || []
                    };

                    doc.ref.set(question);
                    const falseMarkedQuestions = state.deleteMarkQuestions.filter(q => !q.toDelete.status);
                    commit('setDeleteMarkQuestions', falseMarkedQuestions);
                    commit('updateQuestion', question);
                    commit('updateCurrentQuestionsPage', question);
                    if(isSearching) commit('updateFilteredQuestion', question);
                });
            })
            .then(() => commit('setLoading', false))
            .catch(error => {
                console.log(error);
            });
    },
    changeDeleteStatusQuestions({ commit }, payload) {
        commit('setLoading', true);
        const { iq, isSearching } = payload;

        db.collection('questions').where('iq', '==', iq).get()
            .then(snapshot => {
                const doc = snapshot.docs[0];
                const toDelete = {
                    status: false
                }

                doc.ref.update({ ...doc.data(), toDelete: { status: false } });

                commit('updateCurrentQuestionsPage', { ...doc.data(), toDelete });
                commit('updateQuestion', { ...doc.data(), toDelete });
                commit('updateDeleteMarkQuestion', { ...doc.data(), toDelete });
                if(isSearching) commit('updateFilteredQuestion', { ...doc.data(), toDelete });

                commit('setLoading', false);
            })
            .catch(error => {
                console.log(error);
            });
    },
    deleteQuestions({ commit }) {
        const subjects = {
            "Teoria do Reator": 0,
            "Termodinâmica": 0,
            "Instrumentação e Controle": 0,
            "Válvulas e Bombas": 0,
            "Eletricidade": 0,
            "Mecânica dos Fluidos": 0,
            "Tratamento Qúimico Refrigerante": 0,
            "Análise Integrada": 0,
            "Instrumentação Nuclear": 0,
            "Física Nuclear": 0,
            "Transferência de Calor": 0,
            "Materiais": 0
        };

        db.collection("questions").where('toDelete.status', '==', false).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    doc.ref.delete();
                    subjects[doc.data().subject] += 1;
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
                        const general = document.data().questions.general;

                        const questions = {
                            general: general - snapshot.docs.length,
                            subject: {
                                ...document.data().questions.subject
                            }
                        }

                        for(let key in questions.subject) {
                            questions.subject[key] -= subjects[key];
                        }

                        document.ref.update({ questions })
                            .then(() => {
                                commit('addRemoveSize', { key: 'questions', data: questions });
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
    async uploadImageQuestion({ commit }, payload) {
        return new Promise((resolve,reject) => {
            try {
                const storageRef = storage.ref();
                const file = payload.image;
                const questionIQ = payload.iq;
                const type = file.type.split('/')[1];
                const format = `questions/question-${questionIQ}.${type}`;

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
            } catch {
                reject();
            }
        });
    },
    editQuestion({ commit, dispatch }, payload) {
        commit('setLoading', true);

        const question = { ...payload.questionData }

        const today = new Date();
        const edition = payload.oldData.edited;
        edition.push({
            id: payload.user,
            date: today,
            question: payload.oldData.iq + "-" + (payload.oldData.edited.length + 1)
        });

        db.collection("questions").where('iq', '==', question.iq).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    doc.ref.update({ ...question, edited: edition });
                });
            })
            .then(() => {
                commit('updateQuestion', { ...question, edited: edition });
                commit('setLoading', false);
                dispatch("createdEditedQuestion", payload.oldData);
                console.log("Success edit");
            })
            .catch(error => {
                console.error("Error writing document: ", error);
            });
    },
    createdEditedQuestion({ commit }, payload) {
        commit('setLoading', true);

        const editedQuestion = {
            ...question,
            iq: payload.iq + '-' + payload.edited.length
        }
        db.collection("edited questions")
            .add(editedQuestion)
            .then(() => {
                commit('setLoading', false);
            })
            .catch(error => {
                console.error("Error writing document: ", error);
            });
    },
    async questionExists(store, payload) {
        return new Promise((resolve, reject) => {
            try {
                db.collection('questions').where('iq', '==', payload).get()
                    .then(snapshot => {
                        if(snapshot.docs.length > 0) resolve(true);
                        else {
                            db.collection('question-requests').where('iq', '==', payload).get()
                                .then(snap => {
                                    if(snap.docs.length > 0) resolve(true);
                                    else resolve(false);
                                })
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    });
            } catch {
                reject();
            }
        });
    },
    createQuestion({ commit, state }, payload) {
        commit('setLoading', true);

        const question = { ...payload.question, edited: [] }

        const questionAmount = this.getters.getDataSize.questions.general;
        const pageAmount = Math.ceil(questionAmount / 8);
        const amount = questionAmount % 8;

        db.collection("questions").add(question)
            .then(() => {
                commit('setLoading', false);
                commit('createQuestion', { page: 'p' + (amount === 8 || amount === 0 ? pageAmount + 1 : pageAmount), data: question });

                db.collection('data-size').get()
                    .then(snap => {
                        const document = snap.docs[0];
                        const general = document.data().questions.general;
                        const sub = question.subject;
                        const subSize = document.data().questions.subject[sub];

                        const questions = {
                            general: general + 1,
                            subject: {
                                ...document.data().questions.subject,
                                [sub]: subSize + 1
                            }
                        }

                        document.ref.update({ questions })
                            .then(() => {
                                commit('addRemoveSize', { key: 'questions', data: questions });
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
    async getQuestionByIQ(store, payload) {
        return new Promise((resolve, reject) => {
            try {
                db.collection('questions').where('iq', '==', payload).get()
                    .then(snapshot => {
                        resolve(snapshot.docs[0].data());
                    })
                    .catch(error => {
                        console.log(error);
                    });
            } catch {
                reject();
            }
        });
    },
    resetQuestions({ commit }) {
        commit('RESETQuestions');
    }
}

const getters = {
    getSubjects(state) {
        return state.subjects;
    },
    getQuestions(state) {
        return state.questions;
    },
    getDeleteMarkQuestions(state) {
        return state.deleteMarkQuestions;
    },
    getQuestionsByPage: state => page => {
        return state.questions['p' + page];
    },
    getCurrentQuestionsPage(state) {
        return state.currentQuestionsPage;
    },
    getFilteredQuestions(state) {
        return state.filteredQuestions;
    },
    getAnswersById: state => iq => {
        let aux = [];

        for(let key in state.questions) {
            if(state.questions[key].iq === iq) {
                aux = state.questions[key];
            }
        }

        return { ...aux.answers }
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}
