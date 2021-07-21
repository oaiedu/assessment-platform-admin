import { Store } from "vuex";

import { db, storage } from "../../main";
import { getNowISOString } from "../../utils/date";
import { createErrorLog, showErrorMessage } from "../../utils/errors";

/**
 * @typedef {import('./tests.store.js').Test} Test
 */

/**
 * @typedef {"Teoria do Reator"
 *  |"Termodinâmica"
 *  |"Instrumentação e Controle"
 *  |"Válvulas e Bombas"
 *  |"Eletricidade"
 *  |"Mecânica dos Fluidos"
 *  |"Tratamento Qúimico Refrigerante"
 *  |"Análise Integrada"
 *  |"Instrumentação Nuclear"
 *  |"Física Nuclear"
 *  |"Transferência de Calor"
 *  |"Materiais"} Subject
 */

/**
 * @typedef {Object} DeleteStatus
 * @property {boolean} toDelete.status - If true, the question can be restored. If false, it will be deleted.
 * @property {string|undefined} toDelete.userEmail - The user that marked the question to be deleted.
 */

/**
 * @typedef {Object} AnswerText
 * @property {string} title - The text column title.
 * @property {string} answerDescription - The text column answer description.
 */

/**
 * @typedef {Object} Answer
 * @property {"radio-1"|"radio-2"|"radio-3"|"radio-4"} ansId - The answer id.
 * @property {AnswerText[]|string} text - The answer description.
 * @property {boolean} value - Whether the answer is correct or not.
 */

/**
 * @typedef {Object} QuestionCreation
 * @property {string} iq - The question IQ.
 * @property {Subject} subject - The question subject.
 * @property {string} question - The question description.
 * @property {string} knowledge - The question knowledge.
 * @property {string} knowledgeBWR - The question knowledge (BWR).
 * @property {string} knowledgePWR - The question knowledge (PWR).
 * @property {string} image - The question image url.
 * @property {string} imageSize - The size of the image.
 * @property {Answer[]} answers - The question answers.
 */

/**
 * @typedef {Object} Question
 * @property {string} iq - The question IQ.
 * @property {Subject} subject - The question subject.
 * @property {string} question - The question description.
 * @property {string} knowledge - The question knowledge.
 * @property {string} knowledgeBWR - The question knowledge (BWR).
 * @property {string} knowledgePWR - The question knowledge (PWR).
 * @property {string} image - The question image url.
 * @property {string} imageSize - The size of the image.
 * @property {string|undefined} created - The question creation date.
 * @property {string|undefined} updated - The question edition date.
 * @property {Answer[]} answers - The question answers.
 * @property {Array} edited - The question edition history.
 * @property {DeleteStatus|undefined} toDelete - The question deletion status.
 */

/**
 * @typedef {Object} QuestionsState
 * @property {Object.<string, Question[]>} questions - The pages with it's questions list.
 * @property {Question[]} filteredQuestions - An array of questions filtered by IQ.
 * @property {Question[]} currentQuestionsPage - An array of questions of the current page.
 * @property {Subject[]} subjects - An array of subjects.
 * @property {[string, string]|null} lastQuestionDocument - An array with the first and last question IQ from the last request.
 * @property {Question[]} deleteMarkQuestions - An array of questions that were marked to be deleted.
 */

/**
 * Gets the initial questions state.
 *
 * @returns {QuestionsState} The initial questions state.
 */
const initialState = () => ({
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
    lastQuestionDocument: null,
    deleteMarkQuestions: []
});

const state = initialState();

const mutations = {
    /**
     * Sets a page of questions according to the given data.
     *
     * @param {QuestionsState} state - The questions state.
     * @param {Object} data - The data containing the page number and it's data.
     * @param {string} data.page - The page number.
     * @param {Question[]} data.data - An array of questions.
     */
    setQuestionPage(state, data) {
        state.questions[data.page] = data.data;
    },
    /**
     * Sets the filtered questions.
     *
     * @param {QuestionsState} state - The questions state.
     * @param {Question[]} data - An array of filtered questions.
     */
    setFilteredQuestions(state, data) {
        state.filteredQuestions = data;
    },
    /**
     * Cleans the filtered questions array.
     *
     * @param {QuestionsState} state - The questions state.
     */
    resetFilteredQuestions(state) {
        state.filteredQuestions = [];
    },
    /**
     * Cleans the current questions page array.
     *
     * @param {QuestionsState} state - The questions state.
     */
    resetCurrentQuestionsPage(state) {
        state.currentQuestionsPage = [];
    },
    /**
     * Adds a question to the array of questions marked to be deleted.
     *
     * @param {QuestionsState} state - The questions state.
     * @param {Question} data - The question to be added.
     */
    addDeleteMarkQuestion(state, data) {
        state.deleteMarkQuestions.push(data);
    },
    /**
     * Updates a question that's in the array of questions marked to be deleted.
     *
     * @param {QuestionsState} state - The questions state.
     * @param {Question} data - The question to be updated.
     */
    updateDeleteMarkQuestion(state, data) {
        const questions = [...state.deleteMarkQuestions];
        questions.forEach((item, index) => {
            if (item.iq === data.iq) {
                questions[index] = data;
            }
        });
        state.deleteMarkQuestions = questions;
    },
    /**
     * Removes a question from the array of questions marked to be deleted.
     *
     * @param {QuestionsState} state - The questions state.
     * @param {Question} data - The IQ of the question to be removed.
     */
    removeDeleteMarkQuestion(state, data) {
        const questions = [...state.deleteMarkQuestions];
        questions.forEach((item, index) => {
            if (item.iq === data) {
                state.deleteMarkQuestions.splice(index, 1);
            }
        });
    },
    /**
     * Sets the array of questions marked to be deleted.
     *
     * @param {QuestionsState} state - The questions state.
     * @param {Question[]} data - An array of questions marked to be deleted.
     */
    setDeleteMarkQuestions(state, data) {
        state.deleteMarkQuestions = data;
    },
    /**
     * Sets a question as marked to be deleted.
     *
     * @param {QuestionsState} state - The questions state.
     * @param {Object} data - The data containing the question IQ and the deletion status.
     * @param {string} data.iq - The question IQ.
     * @param {DeleteStatus} data.toDelete - The question deletion status.
     */
    setDeleteMarkQuestion(state, data) {
        const questions = state.questions;
        for (let key in questions) {
            if (questions[key]) {
                questions[key].forEach((item, index) => {
                    if (item.iq === data.iq) {
                        state.questions[key][index] = {
                            ...item,
                            toDelete: data.toDelete
                        };
                    }
                });
            }
        }
    },
    /**
     * Sets a question as marked to be deleted into the filtered questions array.
     *
     * @param {QuestionsState} state - The questions state.
     * @param {Object} data - The data containing the question IQ and the deletion status.
     * @param {string} data.iq - The question IQ.
     * @param {DeleteStatus} data.toDelete - The question deletion status.
     */
    setDeleteMarkFilteredQuestion(state, data) {
        const questions = [...state.filteredQuestions];
        questions.forEach((item, index) => {
            if (item.iq === data.iq) {
                questions[index] = { ...item, toDelete: data.toDelete };
            }
        });
        state.filteredQuestions = questions;
    },
    /**
     * Sets the current questions page array.
     *
     * @param {QuestionsState} state - The questions state.
     * @param {Question[]} data - An array of questions.
     */
    setCurrentQuestionsPage(state, data) {
        state.currentQuestionsPage = data;
    },
    /**
     * Creates a question into the questions object, according to the given data.
     *
     * @param {QuestionsState} state - The questions state.
     * @param {Object} data - The data containing the question data and the page number.
     * @param {number} data.page - The page number.
     * @param {number} data.amount - The total amount of questions.
     * @param {Question} data.data - The question to be created.
     */
    createQuestion(state, data) {
        const page = data.page;
        const questions = state.questions["p" + page] || [];
        const oneBefore = state.questions["p" + (page - 1)] || [];
        const amount = data.amount;
        if (questions.length > 0 || oneBefore.length === 8 || amount === 0) {
            questions.push(data.data);
            state.questions["p" + page] = [...questions];
            if (amount === 0 || state.currentQuestionsPage.length < 8) {
                state.currentQuestionsPage.push(data.data);
            }
        }
    },
    /**
     * Updates a question into the question object, according to the question's IQ.
     *
     * @param {QuestionsState} state - The questions state.
     * @param {Question} data - The question to be updated.
     */
    updateQuestion(state, data) {
        const questions = state.questions;
        for (let key in questions) {
            if (questions[key]) {
                questions[key].forEach((item, index) => {
                    if (item.iq === data.iq) {
                        state.questions[key][index] = data;
                    }
                });
            }
        }
    },
    /**
     * Updates a question that's in the filtered questions array, according to the question's IQ.
     *
     * @param {QuestionsState} state - The questions state.
     * @param {Question} data - The question to be updated.
     */
    updateFilteredQuestion(state, data) {
        const questions = [...state.filteredQuestions];
        questions.forEach((item, index) => {
            if (item.iq === data.iq) {
                questions[index] = data;
            }
        });
        state.filteredQuestions = questions;
    },
    /**
     * Updates a question that's in the current questions page array, according to the question's IQ.
     *
     * @param {QuestionsState} state - The questions state.
     * @param {Question} data - The question to be updated.
     */
    updateCurrentQuestionsPage(state, data) {
        const questions = [...state.currentQuestionsPage];
        questions.forEach((item, index) => {
            if (item.iq === data.iq) {
                questions[index] = data;
            }
        });
        state.currentQuestionsPage = questions;
    },
    /**
     * Deletes a question from the question object, according to the given data.
     *
     * @param {QuestionsState} state - The questions state.
     * @param {string} data - The IQ of the question to be deleted.
     */
    deleteQuestion(state, data) {
        const questions = state.questions;
        for (let key in questions) {
            if (questions[key]) {
                questions[key].forEach((item, index) => {
                    if (item.iq === data) {
                        state.questions[key].splice(index, 1);
                    }
                });
            }
        }
    },
    /**
     * Deletes a question from the filtered questions array, according to the given data.
     *
     * @param {QuestionsState} state - The questions state.
     * @param {string} data - The IQ of the question to be deleted.
     */
    deleteFilteredQuestion(state, data) {
        const questions = [...state.filteredQuestions];
        questions.forEach((item, index) => {
            if (item.iq === data) {
                state.filteredQuestions.splice(index, 1);
            }
        });
    },
    /**
     * Sets the last question request IQs.
     *
     * @param {QuestionsState} state - The questions state.
     * @param {[string, string]} data An array of strings containing the first and last question IQs from the last request.
     */
    setLastQuestionDocument(state, data) {
        state.lastQuestionDocument = data;
    },
    /**
     * Resets the questions state to it's initial state.
     *
     * @param {QuestionsState} state - The questions state.
     */
    RESETQuestions(state) {
        const newState = initialState();
        Object.keys(newState).forEach(key => {
            state[key] = newState[key];
        });
    }
};

const actions = {
    /**
     * Loads a page of questions according to the payload data.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {number} payload.page - The page number.
     * @param {number} payload.itemsPerPage - The amount of items per page.
     * @param {"next"|"previous"} payload.type - The request type.
     */
    loadQuestionPage({ commit, state }, payload) {
        commit("setLoading", true);

        const { page, itemsPerPage, type } = payload;
        const data = [];

        const pages = Object.keys(state.questions);

        if (!pages.includes("p" + page)) {
            let request = null;
            const ref = db.collection("questions").orderBy("iq");

            if (type === "next") {
                request = ref
                    .startAfter(state.lastQuestionDocument[1])
                    .limit(itemsPerPage)
                    .get();
            } else {
                request = ref
                    .endBefore(state.lastQuestionDocument[0])
                    .limitToLast(itemsPerPage)
                    .get();
            }

            let first = null,
                last = null;

            request
                .then(snapshot => {
                    first = snapshot.docs[0].data().iq;
                    last = snapshot.docs[snapshot.docs.length - 1].data().iq;

                    snapshot.forEach(doc => {
                        data.push(doc.data());
                    });
                })
                .then(() => {
                    commit("setCurrentQuestionsPage", data);
                    commit("setQuestionPage", { page: "p" + page, data });
                    commit("setLastQuestionDocument", [first, last]);
                    commit("setLoading", false);
                })
                .catch(error => {
                    commit("setLoading", false);
                    const errorModel = showErrorMessage(
                        "load",
                        "Questões",
                        error.message
                    );
                    commit("setError", { message: errorModel });
                    createErrorLog("Question Page Load", error.message, {
                        payload,
                        data
                    });
                });
        } else {
            const pageContent = state.questions["p" + page];
            const first = pageContent[0].iq;
            const last = pageContent[pageContent.length - 1].iq;

            commit("setCurrentQuestionsPage", pageContent);
            commit("setLastQuestionDocument", [first, last]);
            commit("setLoading", false);
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
    loadFOLQuestionPage({ commit, state }, payload) {
        commit("setLoading", true);

        const { page, itemsPerPage, mode } = payload;
        const data = [];

        const pages = Object.keys(state.questions);

        const questionAmount = this.getters.getDataSize.questions.general;
        const amount = questionAmount % 8;

        if (!pages.includes("p" + page)) {
            let request = null;
            const ref = db.collection("questions").orderBy("iq");

            if (mode === "first") {
                request = ref.limit(itemsPerPage).get();
            } else {
                request = ref.limitToLast(amount || 8).get();
            }

            let first = null,
                last = null;

            request
                .then(snapshot => {
                    first = snapshot.docs[0].data().iq;
                    last = snapshot.docs[snapshot.docs.length - 1].data().iq;

                    snapshot.forEach(doc => {
                        data.push(doc.data());
                    });
                })
                .then(() => {
                    commit("setCurrentQuestionsPage", data);
                    commit("setQuestionPage", { page: "p" + page, data });
                    commit("setLastQuestionDocument", [first, last]);
                    commit("setLoading", false);
                })
                .catch(error => {
                    commit("setLoading", false);
                    const errorModel = showErrorMessage(
                        "load",
                        "Questões",
                        error.message
                    );
                    commit("setError", { message: errorModel });
                    createErrorLog("Question FOL Page Load", error.message, {
                        payload,
                        data
                    });
                });
        } else {
            const pageContent = state.questions["p" + page];

            if (pageContent && pageContent[0]) {
                const first = pageContent[0].iq;
                const last = pageContent[pageContent.length - 1].iq;
                commit("setCurrentQuestionsPage", pageContent);
                commit("setLastQuestionDocument", [first, last]);
            }
            commit("setLoading", false);
        }
    },
    /**
     * Searches for questions based on their IQ.
     *
     * @param {Store} store - The vuex store.
     * @param {string} payload - The string to be searched.
     */
    searchQuestions({ commit }, payload) {
        commit("setLoading", true);

        const data = [];

        db.collection("questions")
            .orderBy("iq")
            .where("iq", ">=", payload.toUpperCase())
            .where("iq", "<=", payload.toUpperCase() + "~")
            .get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    data.push(doc.data());
                });
            })
            .then(() => {
                commit("setFilteredQuestions", data);
                commit("setLoading", false);
            })
            .catch(error => {
                commit("setLoading", false);
                const errorModel = showErrorMessage(
                    "load",
                    "Questões",
                    "Searching error - " + error.message
                );
                commit("setError", { message: errorModel });
                createErrorLog("Question Searching", error.message, {
                    payload,
                    data
                });
            });
    },
    /**
     * Gets all tests that includes a question based on it's IQ.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {string} payload.iq - The question IQ.
     * @returns {Promise<Test[]>} An array of tests.
     */
    async checkQuestionInTests(store, payload) {
        const { iq } = payload;

        return new Promise((resolve, reject) => {
            try {
                const tests = [];

                db.collection("tests")
                    .where("questions", "array-contains", iq)
                    .get()
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
                    });
            } catch (error) {
                reject("Check Questions In Tests Error!");
            }
        });
    },
    /**
     * Loads all questions that are marked to be deleted.
     *
     * @param {Store} store - The vuex store.
     */
    checkDeleteMarkQuestions({ commit }) {
        const data = [];

        db.collection("questions")
            .where("toDelete.status", "==", true)
            .get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    data.push(doc.data());
                });
            })
            .then(() => {
                commit("setDeleteMarkQuestions", data);
            })
            .catch(error => {
                const errorModel = showErrorMessage(
                    "connection",
                    "",
                    error.message
                );
                commit("setError", { message: errorModel });
                createErrorLog("Question Mark Check", error.message, { data });
            });
    },
    /**
     * Marks a question to be deleted.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {string} payload.iq - The question IQ.
     * @param {boolean} payload.isSearching - Whether the application is using filtered questions or not.
     * @param {string} payload.userEmail - The current user e-mail.
     */
    deleteMarkQuestion({ commit }, payload) {
        commit("setLoading", true);

        const { iq, isSearching, userEmail } = payload;

        db.collection("questions")
            .where("iq", "==", iq)
            .get()
            .then(snapshot => {
                const doc = snapshot.docs[0];

                const toDelete = {
                    status: true,
                    userEmail
                };

                doc.ref.update({ toDelete });

                commit("setDeleteMarkQuestion", { iq, toDelete });

                if (isSearching) {
                    commit("setDeleteMarkFilteredQuestion", { iq, toDelete });
                }

                commit("updateCurrentQuestionsPage", {
                    ...doc.data(),
                    toDelete
                });
                commit("addDeleteMarkQuestion", { ...doc.data(), toDelete });

                db.collection("question-subjects")
                    .where("name", "==", doc.data().subject)
                    .get()
                    .then(snap => {
                        const document = snap.docs[0];
                        const index = document.data().questions.indexOf(iq);
                        const questions = document.data().questions;
                        if (index !== -1) questions.splice(index, 1);
                        document.ref.update({ questions });
                    })
                    .catch(error => {
                        console.error(error);
                    });

                commit("setLoading", false);
            })
            .catch(error => {
                commit("setLoading", false);
                const errorModel = showErrorMessage(
                    "connection",
                    "",
                    error.message
                );
                commit("setError", { message: errorModel });
                createErrorLog("Question Delete Mark", error.message, {
                    payload
                });
            });
    },
    /**
     * Restores a question from being marked to be deleted.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {string} payload.iq - The question IQ.
     * @param {boolean} payload.isSearching - Whether the application is using filtered questions or not.
     * @param {boolean} payload.isRequest - Whether the question is a request or not.
     */
    restoreMarkedQuestion({ commit }, payload) {
        commit("setLoading", true);

        const { iq, isSearching, isRequest } = payload;

        db.collection("questions")
            .where("iq", "==", iq)
            .get()
            .then(snapshot => {
                const doc = snapshot.docs[0];
                const data = doc.data();

                /**
                 * @type {Question}
                 */
                let question = {};

                if (isRequest) {
                    question = { ...payload.data };
                } else {
                    question = {
                        iq: data.iq,
                        created: data.created || null,
                        updated: data.updated || null,
                        subject: data.subject,
                        question: data.question,
                        knowledge: data.knowledge,
                        knowledgePWR: data.knowledgePWR,
                        knowledgeBWR: data.knowledgeBWR,
                        answers: data.answers,
                        image: data.image,
                        imageSize: data.imageSize || "1x",
                        edited: data.edited || []
                    };
                }

                doc.ref.set(question);
                commit("updateQuestion", question);

                if (isSearching) {
                    commit("updateFilteredQuestion", question);
                }

                commit("removeDeleteMarkQuestion", iq);
                commit("updateCurrentQuestionsPage", question);

                db.collection("question-subjects")
                    .where("name", "==", question.subject)
                    .get()
                    .then(snap => {
                        const document = snap.docs[0];
                        const questions = [...document.data().questions, iq];
                        questions.sort((q1, q2) => (q1 > q2 ? 1 : -1));
                        document.ref.update({ questions });
                    })
                    .catch(error => {
                        console.error(error);
                    });

                commit("setLoading", false);
                if (!isRequest)
                    commit("setSuccess", "Questão restaurada com sucesso!");
            })
            .catch(error => {
                commit("setLoading", false);
                const errorModel = showErrorMessage(
                    "connection",
                    "",
                    error.message
                );
                commit("setError", { message: errorModel });
                createErrorLog("Question Restore", error.message, { payload });
            });
    },
    /**
     * Restores all questions that are marked to be deleted.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {boolean} payload.isSearching - Whether the application is using filtered questions or not.
     */
    restoreAllMarkedQuestions({ commit, state }, payload) {
        commit("setLoading", true);

        const { isSearching } = payload;
        const questionsData = {};

        db.collection("questions")
            .where("toDelete.status", "==", true)
            .get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    const data = doc.data();

                    /**
                     * @type {Question}
                     */
                    const question = {
                        iq: data.iq,
                        created: data.created || null,
                        updated: data.updated || null,
                        subject: data.subject,
                        question: data.question,
                        knowledge: data.knowledge,
                        knowledgePWR: data.knowledgePWR,
                        knowledgeBWR: data.knowledgeBWR,
                        answers: data.answers,
                        image: data.image,
                        imageSize: data.imageSize || "1x",
                        edited: data.edited || []
                    };

                    if (questionsData[question.subject]) {
                        questionsData[question.subject] = [
                            ...questionsData[question.subject],
                            question.iq
                        ];
                    } else {
                        questionsData[question.subject] = [question.iq];
                    }

                    doc.ref.set(question);
                    const falseMarkedQuestions = state.deleteMarkQuestions.filter(
                        q => !q.toDelete.status
                    );
                    commit("setDeleteMarkQuestions", falseMarkedQuestions);
                    commit("updateQuestion", question);
                    commit("updateCurrentQuestionsPage", question);
                    if (isSearching) commit("updateFilteredQuestion", question);
                    commit("setSuccess", "Questões restauradas com sucesso!");
                });
            })
            .then(() => {
                for (let subject in questionsData) {
                    db.collection("question-subjects")
                        .where("name", "==", subject)
                        .get()
                        .then(snapshot => {
                            const doc = snapshot.docs[0];
                            const questions = [
                                ...doc.data().questions,
                                ...questionsData[subject]
                            ];
                            questions.sort((q1, q2) => (q1 > q2 ? 1 : -1));
                            doc.ref.update({ questions });
                        })
                        .catch(error => {
                            console.error(error);
                        });
                }
            })
            .then(() => commit("setLoading", false))
            .catch(error => {
                commit("setLoading", false);
                const errorModel = showErrorMessage(
                    "connection",
                    "",
                    error.message
                );
                commit("setError", { message: errorModel });
                createErrorLog("Question Restore All", error.message, {
                    payload,
                    questionData
                });
            });
    },
    /**
     * Changes a question's delete status to false (confirmed deletion).
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {string} payload.iq - The question IQ.
     * @param {boolean} payload.isSearching - Whether the application is using filtered questions or not.
     */
    changeDeleteStatusQuestions({ commit }, payload) {
        commit("setLoading", true);
        const { iq, isSearching } = payload;

        db.collection("questions")
            .where("iq", "==", iq)
            .get()
            .then(snapshot => {
                const doc = snapshot.docs[0];
                const toDelete = {
                    status: false
                };

                if (doc) {
                    doc.ref.update({ ...doc.data(), toDelete });

                    commit("updateCurrentQuestionsPage", {
                        ...doc.data(),
                        toDelete
                    });
                    commit("updateQuestion", { ...doc.data(), toDelete });
                    commit("updateDeleteMarkQuestion", {
                        ...doc.data(),
                        toDelete
                    });
                    if (isSearching)
                        commit("updateFilteredQuestion", {
                            ...doc.data(),
                            toDelete
                        });
                }

                commit("setLoading", false);
            })
            .catch(error => {
                const errorModel = showErrorMessage(
                    "exclusion",
                    "Questão",
                    error.message
                );
                commit("setError", { message: errorModel });
                createErrorLog("Question Confirm Delete", error.message, {
                    payload
                });
            });
    },
    /**
     * Deletes all questions that are marked to be deleted (toDelete.status = false).
     *
     * @param {Store} store - The vuex store.
     */
    deleteQuestions({ commit }) {
        /**
         * @type {Object.<string, number>}
         */
        const subjects = {
            "Teoria do Reator": 0,
            Termodinâmica: 0,
            "Instrumentação e Controle": 0,
            "Válvulas e Bombas": 0,
            Eletricidade: 0,
            "Mecânica dos Fluidos": 0,
            "Tratamento Qúimico Refrigerante": 0,
            "Análise Integrada": 0,
            "Instrumentação Nuclear": 0,
            "Física Nuclear": 0,
            "Transferência de Calor": 0,
            Materiais: 0
        };

        db.collection("questions")
            .where("toDelete.status", "==", false)
            .get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    doc.ref.delete();
                    subjects[doc.data().subject] += 1;
                    if (doc.data().image && doc.data().image.length > 0) {
                        const image = doc.data().image;
                        const childImage = image
                            .split("?alt=media")[0]
                            .split("/o/")[1];
                        const child = decodeURIComponent(childImage);
                        storage
                            .ref()
                            .child(child)
                            .delete();
                    }
                });
                db.collection("data-size")
                    .get()
                    .then(snap => {
                        const document = snap.docs[0];
                        const general = document.data().questions.general;

                        const questions = {
                            general: general - snapshot.docs.length,
                            subject: {
                                ...document.data().questions.subject
                            }
                        };

                        for (let key in questions.subject) {
                            questions.subject[key] -= subjects[key];
                        }

                        document.ref
                            .update({ questions })
                            .then(() => {
                                commit("addRemoveSize", {
                                    key: "questions",
                                    data: questions
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
                console.error("Error removing question: ", error);
                createErrorLog("Question DB Delete", error.message, {
                    subjects
                });
            });
    },
    /**
     * Uploads a question image.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {File} payload.image - The image to be uploaded.
     * @param {string} payload.iq - The question IQ.
     * @returns {Promise<string>} The image url.
     */
    async uploadImageQuestion({ commit }, payload) {
        return new Promise((resolve, reject) => {
            try {
                const storageRef = storage.ref();
                const file = payload.image;
                const questionIQ = payload.iq;
                const type = file.type.split("/")[1];
                const format = `questions/question-${questionIQ}.${type}`;

                storageRef
                    .child(format)
                    .put(file)
                    .then(snapshot => {
                        snapshot.ref.getDownloadURL().then(downloadURL => {
                            resolve(downloadURL.toString());
                        });
                    })
                    .catch(error => {
                        const errorModel = showErrorMessage(
                            "connection",
                            "",
                            "Image upload error - " + error.message
                        );
                        commit("setError", { message: errorModel });
                        createErrorLog("Question Image Upload", error.message, {
                            payload,
                            format
                        });
                    });
            } catch (error) {
                reject();
            }
        });
    },
    /**
     * Updates a question based on it's IQ.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {Question} payload.questionData - The question to be updated.
     * @param {Question} payload.oldData - The question to be kept in the history.
     * @param {string} payload.user - The current user id.
     * @param {isSearching} payload.isSearching - Whether the application is using the filtered questions or not.
     */
    editQuestion({ commit, dispatch }, payload) {
        commit("setLoading", true);

        const question = {
            ...payload.questionData,
            updated: getNowISOString()
        };

        const today = new Date();
        const edition = payload.oldData.edited;
        edition.push({
            id: payload.user,
            date: today,
            question:
                payload.oldData.iq + "-" + (payload.oldData.edited.length + 1)
        });

        let oldSubject = null;

        db.collection("questions")
            .where("iq", "==", question.iq)
            .get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    if (question.subject !== doc.data().subject) {
                        oldSubject = doc.data().subject;
                    }
                    doc.ref.update({ ...question, edited: edition });
                });
            })
            .then(() => {
                commit("updateQuestion", { ...question, edited: edition });
                commit("updateCurrentQuestionsPage", {
                    ...question,
                    edited: edition
                });
                if (payload.isSearching)
                    commit("updateFilteredQuestion", question);

                if (oldSubject) {
                    db.collection("data-size")
                        .get()
                        .then(snap => {
                            const document = snap.docs[0];
                            const general = document.data().questions.general;
                            const sub = question.subject;
                            const subSize = document.data().questions.subject[
                                sub
                            ];
                            const oldSubSize = document.data().questions
                                .subject[oldSubject];

                            const questions = {
                                general,
                                subject: {
                                    ...document.data().questions.subject,
                                    [sub]: subSize + 1,
                                    [oldSubject]: oldSubSize - 1
                                }
                            };

                            document.ref
                                .update({ questions })
                                .then(() => {
                                    commit("addRemoveSize", {
                                        key: "questions",
                                        data: questions
                                    });
                                })
                                .catch(error => {
                                    console.error(error);
                                });
                        })
                        .catch(error => {
                            console.error(error);
                        });

                    db.collection("question-subjects")
                        .where("name", "==", question.subject)
                        .get()
                        .then(snapshot => {
                            const doc = snapshot.docs[0];
                            const questions = [
                                ...doc.data().questions,
                                question.iq
                            ];
                            questions.sort((q1, q2) => (q1 > q2 ? 1 : -1));
                            doc.ref.update({ questions });
                        })
                        .catch(error => {
                            console.error(error);
                        });

                    db.collection("question-subjects")
                        .where("name", "==", oldSubject)
                        .get()
                        .then(snapshot => {
                            const doc = snapshot.docs[0];
                            const index = doc
                                .data()
                                .questions.indexOf(question.iq);
                            const questions = doc.data().questions;
                            if (index !== -1) questions.splice(index, 1);
                            doc.ref.update({ questions });
                        })
                        .catch(error => {
                            console.error(error);
                        });
                }

                commit("setLoading", false);
                commit("setSuccess", "Questão editada com sucesso!");
                dispatch("createdEditedQuestion", payload.oldData);
            })
            .catch(error => {
                commit("setLoading", false);
                const errorModel = showErrorMessage(
                    "edition",
                    "Questão",
                    error.message
                );
                commit("setError", { message: errorModel });
                createErrorLog("Question DB Upload", error.message, {
                    payload
                });
            });
    },
    /**
     * Creates a question with the non updated data version.
     *
     * @param {Store} store - The vuex store.
     * @param {Question} payload - The question to be kept.
     */
    createdEditedQuestion({ commit }, payload) {
        commit("setLoading", true);

        const editedQuestion = {
            ...payload,
            iq: payload.iq + "-" + payload.edited.length
        };
        db.collection("edited questions")
            .add(editedQuestion)
            .then(() => {
                commit("setLoading", false);
            })
            .catch(error => {
                console.error("Error writing document: ", error);
            });
    },
    /**
     * Checks if a question with the given IQ exists.
     *
     * @param {Store} store - The vuex store.
     * @param {string} payload - The question IQ.
     * @returns {Promise<boolean>} Whether the question exists or not.
     */
    async questionExists(store, payload) {
        return new Promise((resolve, reject) => {
            try {
                db.collection("questions")
                    .where("iq", "==", payload)
                    .get()
                    .then(snapshot => {
                        if (snapshot.docs.length > 0) resolve(true);
                        else {
                            db.collection("question-requests")
                                .where("iq", "==", payload)
                                .get()
                                .then(snap => {
                                    if (snap.docs.length > 0) resolve(true);
                                    else resolve(false);
                                });
                        }
                    })
                    .catch(error => {
                        const errorModel = showErrorMessage(
                            "connection",
                            "",
                            error.message
                        );
                        commit("setError", { message: errorModel });
                        createErrorLog("Question Exist Test", error.message, {
                            payload
                        });
                    });
            } catch (error) {
                reject();
            }
        });
    },
    /**
     * Creates a new question.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {QuestionCreation} payload.question - The question to be created.
     * @param {boolean} payload.isRequest - Whether the question is a request or not.
     */
    createQuestion({ commit }, payload) {
        commit("setLoading", true);

        const createdDate = getNowISOString();

        const question = {
            created: createdDate,
            updated: createdDate,
            ...payload.question,
            edited: []
        };

        const questionAmount = this.getters.getDataSize.questions.general;
        const pageAmount = Math.ceil(questionAmount / 8);
        const amount = questionAmount % 8;

        db.collection("questions")
            .add(question)
            .then(() => {
                commit("setLoading", false);
                commit("createQuestion", {
                    page: amount === 0 ? pageAmount + 1 : pageAmount,
                    data: question,
                    amount: questionAmount
                });
                if (!payload.isRequest)
                    commit("setSuccess", "Questão criada com sucesso!");

                db.collection("data-size")
                    .get()
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
                        };

                        document.ref
                            .update({ questions })
                            .then(() => {
                                commit("addRemoveSize", {
                                    key: "questions",
                                    data: questions
                                });
                            })
                            .catch(error => {
                                console.error(error);
                            });
                    })
                    .catch(error => {
                        console.error(error);
                    });

                db.collection("question-subjects")
                    .where("name", "==", question.subject)
                    .get()
                    .then(snap => {
                        const document = snap.docs[0];
                        const questions = [
                            ...document.data().questions,
                            question.iq
                        ];
                        questions.sort((q1, q2) => (q1 > q2 ? 1 : -1));
                        document.ref.update({ questions });
                    })
                    .catch(error => {
                        console.error(error);
                    });
            })
            .catch(error => {
                commit("setLoading", false);
                const errorModel = showErrorMessage(
                    "creation",
                    "Questão",
                    error.message
                );
                commit("setError", { message: errorModel });
                createErrorLog("Question DB Insert", error.message, {
                    payload
                });
            });
    },
    /**
     * Gets a question by it's IQ.
     *
     * @param {Store} store - The vuex store.
     * @param {string} payload - The question IQ.
     */
    async getQuestionByIQ(store, payload) {
        return new Promise((resolve, reject) => {
            try {
                db.collection("questions")
                    .where("iq", "==", payload)
                    .get()
                    .then(snapshot => {
                        if (snapshot.docs.length > 0)
                            resolve(snapshot.docs[0].data());
                        else resolve(null);
                    })
                    .catch(error => {
                        const errorModel = showErrorMessage(
                            "load",
                            "Questão",
                            error.message
                        );
                        commit("setError", { message: errorModel });
                        createErrorLog("Question IQ Load", error.message, {
                            payload
                        });
                    });
            } catch (error) {
                reject();
            }
        });
    },
    /**
     * Resets the questions state to it's initial state.
     *
     * @param {Store} store - The vuex store.
     */
    resetQuestions({ commit }) {
        commit("RESETQuestions");
    }
};

const getters = {
    /**
     * Gets all the subjects.
     *
     * @param {QuestionsState} state - The questions state.
     * @returns {Subject[]} An array of subjects.
     */
    getSubjects(state) {
        return state.subjects;
    },
    /**
     * Gets an object with all loaded pages and it's questions.
     *
     * @param {QuestionsState} state - The questions state.
     * @returns {Object.<string, Question[]>} The questions pages object.
     */
    getQuestions(state) {
        return state.questions;
    },
    /**
     * Gets an array of questions that were marked to be deleted.
     *
     * @param {QuestionsState} state - The questions state.
     * @returns {Question[]} An array of questions.
     */
    getDeleteMarkQuestions(state) {
        return state.deleteMarkQuestions;
    },
    /**
     * Gets an array of questions of the given page.
     *
     * @param {QuestionsState} state - The questions state.
     * @param {number} page - The page number.
     * @returns {(page: number) => Question[]} An array of questions.
     */
    getQuestionsByPage(state) {
        return page => state.questions["p" + page];
    },
    /**
     * Gets an array of the current page questions.
     *
     * @param {QuestionsState} state - The questions state.
     * @returns {Question[]} An array of questions.
     */
    getCurrentQuestionsPage(state) {
        return state.currentQuestionsPage;
    },
    /**
     * Gets an array of filtered questions.
     *
     * @param {QuestionsState} state - The questions state.
     * @returns {Question[]} An array of questions.
     */
    getFilteredQuestions(state) {
        return state.filteredQuestions;
    },
    /**
     * Gets an array of answers based on the question's IQ.
     *
     * @param {QuestionsState} state - The questions state.
     * @param {string} iq - The question IQ.
     * @returns {(iq: string) => Answer[]} An array of answers.
     */
    getAnswersById(state) {
        return iq => {
            const aux = [];

            for (let key in state.questions) {
                if (state.questions[key].iq === iq) {
                    aux = state.questions[key];
                }
            }

            return { ...aux.answers };
        };
    }
};

export default {
    state,
    mutations,
    actions,
    getters
};
