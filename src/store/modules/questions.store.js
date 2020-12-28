import { db, storage } from '../../main';

const initialState = () => ({
    deleteQuestionId: null,
    loadedQuestions: [],
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
    lastSnapshot: null
});

const state = initialState();

const mutations = {
    setQuestions(state, data) {
        state.loadedQuestions = data;
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
    setDeletedQuestion(state, data) {
        state.deleteQuestionId = data;
    },
    setCurrentQuestionsPage(state, data) {
        state.currentQuestionsPage = data;
    },
    createQuestion(state, data) {
        state.loadedQuestions.push(data.data);
        const questions = state.questions[data.page] || [];
        questions.push(data.data);
        state.questions[data.page] = questions;
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
        const questions = state.filteredQuestions;
        questions.forEach((item, index) => {
            if(item.iq === data) {
                state.filteredQuestions.splice(index, 1);
            }
        });
    },
    setLastSnapshot(state, data) {
        state.lastSnapshot = data;
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
                request = ref.startAfter(state.lastSnapshot[1]).limit(itemsPerPage).get();
            } else {
                request = ref.endBefore(state.lastSnapshot[0]).limitToLast(itemsPerPage).get();
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
                    commit('setLastSnapshot', [first, last]);
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
            commit('setLastSnapshot', [first, last]);
            commit('setLoading', false);
        }
    },
    loadFOLQuestionPage({ commit, state }, payload) {
        commit('setLoading', true);

        const { page, itemsPerPage, mode } = payload;
        const data = [];

        const pages = Object.keys(state.questions);

        if(!pages.includes('p' + page)) {
            let request = null;
            const ref = db.collection('questions').orderBy('iq');

            if(mode === 'first') {
                request = ref.limit(itemsPerPage).get();
            } else {
                request = ref.limitToLast(itemsPerPage).get();
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
                    commit('setLastSnapshot', [first, last]);
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
            commit('setLastSnapshot', [first, last]);
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
    async deleteQuestion({ commit }, payload) {
        commit('setLoading', true);
        const { iq, isSearching } = payload;

        return db.collection("questions").where('iq', '==', iq).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    doc.ref.delete();
                    if(doc.data().image && doc.data().image.length > 0) {
                        const image = doc.data().image;
                        const childImage = image.split('?alt=media')[0].split('/o/')[1];
                        const child = decodeURIComponent(childImage);
                        storage.ref().child(child).delete();
                    }
                    db.collection('data-size').get()
                        .then(snap => {
                            const document = snap.docs[0];
                            const general = document.data().questions.general;
                            const sub = doc.data().subject;
                            const subSize = document.data().questions.subject[sub];

                            const questions = {
                                general: general - 1,
                                subject: {
                                    ...document.data().questions.subject,
                                    [sub]: subSize - 1
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
                });
            })
            .then(() => {
                commit('setLoading', false);
                commit('deleteQuestion', iq);

                if(isSearching) {
                    commit('deleteFilteredQuestion', iq);
                }
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

        const question = {
            iq: payload.questionData.iq,
            question: payload.questionData.question,
            subject: payload.questionData.subject,
            knowledge: payload.questionData.knowledge,
            knowledgePWR: payload.questionData.knowledgePWR,
            knowledgeBWR: payload.questionData.knowledgeBWR,
            answers: payload.questionData.answers,
            images: payload.questionData.images,
            imageSize: payload.questionData.imageSize,
        }

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
    createQuestion({ commit }, payload) {
        commit('setLoading', true);

        const question = { ...payload, edited: [] }

        const questionAmount = this.getters.getDataSize.questions.general;
        const pageAmount =  Math.ceil(questionAmount / 8);
        const pageQuestions = this.getters.getQuestionsByPage(pageAmount);
        const amount = pageQuestions ? pageQuestions.length : 0;

        db.collection("questions").add(question)
            .then(() => {
                commit('setLoading', false);
                commit('createQuestion', { page: 'p' + (amount === 8 ? pageAmount + 1 : pageAmount), data: question });

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
    getCurrentQuestionsPage(state) {
        return state.currentQuestionsPage;
    },
    getFilteredQuestions(state) {
        return state.filteredQuestions;
    },
    getAnswersById(state) {
        let aux = state.loadedQuestions.find(question => question.iq === iq);
        return { ...aux.answers }
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}
