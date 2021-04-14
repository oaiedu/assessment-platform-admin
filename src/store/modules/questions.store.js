import { db, storage } from '../../main';
import { createErrorLog, showErrorMessage } from '../../utils/errors';

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
        const page = data.page;
        const questions = state.questions['p' + page] || [];
        const oneBefore = state.questions['p' + (page - 1)] || [];
        if(questions.length > 0 || oneBefore.length === 8) {
            questions.push(data.data);
            state.questions['p' + page] = [...questions];
        }
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
                    commit('setLoading', false);
                    const errorModel = showErrorMessage('load', 'Questões', error.message);
                    commit('setError', { message: errorModel });
                    createErrorLog('Question Page Load', new Date().toISOString(), error.message, { payload, data });
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
                    commit('setLoading', false);
                    const errorModel = showErrorMessage('load', 'Questões', error.message);
                    commit('setError', { message: errorModel });
                    createErrorLog('Question FOL Page Load', new Date().toISOString(), error.message, { payload, data });
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
                commit('setLoading', false);
                const errorModel = showErrorMessage('load', 'Questões', 'Searching error - ' + error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Question Searching', new Date().toISOString(), error.message, { payload, data });
            });
    },
    async checkQuestionInTests(store, payload) {
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
                        console.error(error);
                    })
            } catch(error) {
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
                const errorModel = showErrorMessage('connection', '', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Question Mark Check', new Date().toISOString(), error.message, { data });
            });
    },
    deleteMarkQuestion({ commit }, payload) {
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

                db.collection('question-subjects').where('name', '==', doc.data().subject).get()
                    .then(snap => {
                        const document = snap.docs[0];
                        const index = document.data().questions.indexOf(iq);
                        const questions = document.data().questions;
                        if(index !== -1) questions.splice(index, 1);
                        document.ref.update({ questions });
                    })
                    .catch(error => {
                        console.error(error);
                    });

                commit('setLoading', false);
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('connection', '', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Question Delete Mark', new Date().toISOString(), error.message, { payload });
            });
    },
    restoreMarkedQuestion({ commit }, payload) {
        commit('setLoading', true);

        const { iq, isSearching, isRequest } = payload;

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

                db.collection('question-subjects').where('name', '==', question.subject).get()
                    .then(snap => {
                        const document = snap.docs[0];
                        const questions = [...document.data().questions, iq];
                        questions.sort((q1, q2) => q1 > q2 ? 1 : -1)
                        document.ref.update({ questions });
                    })
                    .catch(error => {
                        console.error(error);
                    });

                commit('setLoading', false);
                if(!isRequest) commit('setSuccess', 'Questão restaurada com sucesso!');
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('connection', '', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Question Restore', new Date().toISOString(), error.message, { payload });
            });
    },
    restoreAllMarkedQuestions({ commit, state }, payload) {
        commit('setLoading', true);

        const { isSearching } = payload;
        const questionsData = {};

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
                        imageSize: data.imageSize || '1x',
                        edited: data.edited || []
                    };

                    if(questionsData[question.subject]) {
                        questionsData[question.subject] = [...questionsData[question.subject], question.iq];
                    }
                    else {
                        questionsData[question.subject] = [question.iq];
                    }

                    doc.ref.set(question);
                    const falseMarkedQuestions = state.deleteMarkQuestions.filter(q => !q.toDelete.status);
                    commit('setDeleteMarkQuestions', falseMarkedQuestions);
                    commit('updateQuestion', question);
                    commit('updateCurrentQuestionsPage', question);
                    if(isSearching) commit('updateFilteredQuestion', question);
                    commit('setSuccess', 'Questões restauradas com sucesso!');
                });
            })
            .then(() => {
                for(let subject in questionsData) {
                    db.collection('question-subjects').where('name', '==', subject).get()
                        .then(snapshot => {
                            const doc = snapshot.docs[0];
                            const questions = [...doc.data().questions, ...questionsData[subject]];
                            questions.sort((q1, q2) => q1 > q2 ? 1 : -1);
                            doc.ref.update({ questions });
                        })
                        .catch(error => {
                            console.error(error);
                        });
                }
            })
            .then(() => commit('setLoading', false))
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('connection', '', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Question Restore All', new Date().toISOString(), error.message, { payload, questionData });
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

                if(doc) doc.ref.update({ ...doc.data(), toDelete: { status: false } });

                commit('updateCurrentQuestionsPage', { ...doc.data(), toDelete });
                commit('updateQuestion', { ...doc.data(), toDelete });
                commit('updateDeleteMarkQuestion', { ...doc.data(), toDelete });
                if(isSearching) commit('updateFilteredQuestion', { ...doc.data(), toDelete });

                commit('setLoading', false);
            })
            .catch(error => {
                const errorModel = showErrorMessage('exclusion', 'Questão', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Question Confirm Delete', new Date().toISOString(), error.message, { payload });
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
                                console.error(error);
                            });
                    })
                    .catch(error => {
                        console.error(error);
                    });
            })
            .catch(error => {
                console.error("Error removing question: ", error);
                createErrorLog('Question DB Delete', new Date().toISOString(), error.message, { subjects });
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
                        snapshot.ref.getDownloadURL().then(downloadURL => {
                            resolve(downloadURL.toString());
                        });
                    })
                    .catch(error => {
                        const errorModel = showErrorMessage('connection', '', 'Image upload error - ' + error.message);
                        commit('setError', { message: errorModel });
                        createErrorLog('Question Image Upload', new Date().toISOString(), error.message, { payload, format });
                    });
            } catch(error) {
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

        let oldSubject = null;

        db.collection("questions").where('iq', '==', question.iq).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    if(question.subject !== doc.data().subject) {
                        oldSubject = doc.data().subject;
                    }
                    doc.ref.update({ ...question, edited: edition });
                });
            })
            .then(() => {
                commit('updateQuestion', { ...question, edited: edition });
                commit('updateCurrentQuestionsPage', { ...question, edited: edition });
                if(payload.isSearching) commit('updateFilteredQuestion', question);

                if(oldSubject) {
                    db.collection('data-size').get()
                        .then(snap => {
                            const document = snap.docs[0];
                            const general = document.data().questions.general;
                            const sub = question.subject;
                            const subSize = document.data().questions.subject[sub];
                            const oldSubSize = document.data().questions.subject[oldSubject];

                            const questions = {
                                general,
                                subject: {
                                    ...document.data().questions.subject,
                                    [sub]: subSize + 1,
                                    [oldSubject]: oldSubSize - 1
                                }
                            }

                            document.ref.update({ questions })
                                .then(() => {
                                    commit('addRemoveSize', { key: 'questions', data: questions });
                                })
                                .catch(error => {
                                    console.error(error);
                                });
                        })
                        .catch(error => {
                            console.error(error);
                        });

                    db.collection('question-subjects').where('name', '==', question.subject).get()
                        .then(snapshot => {
                            const doc = snapshot.docs[0];
                            const questions = [...doc.data().questions, question.iq];
                            questions.sort((q1, q2) => q1 > q2 ? 1 : -1)
                            doc.ref.update({ questions });
                        })
                        .catch(error => {
                            console.error(error);
                        });

                    db.collection('question-subjects').where('name', '==', oldSubject).get()
                        .then(snapshot => {
                            const doc = snapshot.docs[0];
                            const index = doc.data().questions.indexOf(question.iq);
                            const questions = doc.data().questions;
                            if(index !== -1) questions.splice(index, 1);
                            doc.ref.update({ questions });
                        })
                        .catch(error => {
                            console.error(error);
                        });
                }

                commit('setLoading', false);
                commit('setSuccess', 'Questão editada com sucesso!');
                dispatch("createdEditedQuestion", payload.oldData);
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('edition', 'Questão', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Question DB Upload', new Date().toISOString(), error.message, { payload });
            });
    },
    createdEditedQuestion({ commit }, payload) {
        commit('setLoading', true);

        const editedQuestion = {
            ...payload,
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
                        const errorModel = showErrorMessage('connection', '', error.message);
                        commit('setError', { message: errorModel });
                        createErrorLog('Question Exist Test', new Date().toISOString(), error.message, { payload });
                    });
            } catch(error) {
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
                commit('createQuestion', { page: (amount === 8 || amount === 0 ? pageAmount + 1 : pageAmount), data: question });
                if(!payload.isRequest) commit('setSuccess', 'Questão criada com sucesso!');

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
                                console.error(error);
                            });
                    })
                    .catch(error => {
                        console.error(error);
                    });

                db.collection('question-subjects').where('name', '==', question.subject).get()
                    .then(snap => {
                        const document = snap.docs[0];
                        const questions = [...document.data().questions, question.iq];
                        questions.sort((q1, q2) => q1 > q2 ? 1 : -1);
                        document.ref.update({ questions });
                    })
                    .catch(error => {
                        console.error(error);
                    });
            })
            .catch(error => {
                commit('setLoading', false);
                const errorModel = showErrorMessage('creation', 'Questão', error.message);
                commit('setError', { message: errorModel });
                createErrorLog('Question DB Insert', new Date().toISOString(), error.message, { payload });
            });
    },
    async getQuestionByIQ(store, payload) {
        return new Promise((resolve, reject) => {
            try {
                db.collection('questions').where('iq', '==', payload).get()
                    .then(snapshot => {
                        if(snapshot.docs.length > 0) resolve(snapshot.docs[0].data());
                        else resolve(null);
                    })
                    .catch(error => {
                        const errorModel = showErrorMessage('load', 'Questão', error.message);
                        commit('setError', { message: errorModel });
                        createErrorLog('Question IQ Load', new Date().toISOString(), error.message, { payload });
                    });
            } catch(error) {
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
