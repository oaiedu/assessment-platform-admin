import { Store } from "vuex";

import { db, storage } from "../../main";
import { getNowISOString } from "../../utils/date";
import { createErrorLog, showErrorMessage } from "../../utils/errors";

/**
 * @typedef {import('./tests.store.js').Test} Test
 */

/**
 * @typedef {import('./tests.store.js').Level} Level
 */

/**
 * @typedef {Object} DeleteStatus
 * @property {boolean} toDelete.status If true, the question can be restored. If false, it will be deleted.
 * @property {string|undefined} toDelete.userEmail The user that marked the question to be deleted.
 */

/**
 * @typedef {Object} Answer
 * @property {"radio-1"|"radio-2"|"radio-3"|"radio-4"} ansId The answer id.
 * @property {string} text The answer text.
 * @property {string} description Defines the answer description, explaining why it's correct/incorrect.
 * @property {boolean} value Whether the answer is correct or not.
 */

/**
 * @typedef {Object} QuestionCreation
 * @property {string} name The question name.
 * @property {string} subject The question subject.
 * @property {string} question The question description.
 * @property {Level} level The question level.
 * @property {string} image The question image url.
 * @property {string} imageSize The size of the image.
 * @property {Answer[]} answers The question answers.
 */

/**
 * @typedef {Object} Question
 * @property {string} name The question name.
 * @property {string} subject The question subject.
 * @property {string} question The question description.
 * @property {Level} level The question level.
 * @property {string} image The question image url.
 * @property {string} imageSize The size of the image.
 * @property {string|undefined} created The question creation date.
 * @property {string|undefined} updated The question edition date.
 * @property {Answer[]} answers The question answers.
 * @property {DeleteStatus|undefined} toDelete The question deletion status.
 */

/**
 * @typedef {Object} QuestionsState
 * @property {Object.<string, Question[]>} questions The pages with it's questions list.
 * @property {Question[]} filteredQuestions An array of questions filtered by name.
 * @property {Question[]} currentQuestionsPage An array of questions of the current page.
 * @property {string[]} subjects An array of subjects.
 * @property {[string, string]|null} lastQuestionDocument An array with the first and last question name from the last request.
 * @property {Question[]} deleteMarkQuestions An array of questions that were marked to be deleted.
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
      if (item.name === data.name) {
        questions[index] = data;
      }
    });
    state.deleteMarkQuestions = questions;
  },
  /**
   * Removes a question from the array of questions marked to be deleted.
   *
   * @param {QuestionsState} state - The questions state.
   * @param {Question} data - The name of the question to be removed.
   */
  removeDeleteMarkQuestion(state, data) {
    const questions = [...state.deleteMarkQuestions];
    questions.forEach((item, index) => {
      if (item.name === data) {
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
   * @param {Object} data - The data containing the question name and the deletion status.
   * @param {string} data.name - The question name.
   * @param {DeleteStatus} data.toDelete - The question deletion status.
   */
  setDeleteMarkQuestion(state, data) {
    const questions = state.questions;
    for (let key in questions) {
      if (questions[key]) {
        questions[key].forEach((item, index) => {
          if (item.name === data.name) {
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
   * @param {Object} data - The data containing the question name and the deletion status.
   * @param {string} data.name - The question name.
   * @param {DeleteStatus} data.toDelete - The question deletion status.
   */
  setDeleteMarkFilteredQuestion(state, data) {
    const questions = [...state.filteredQuestions];
    questions.forEach((item, index) => {
      if (item.name === data.name) {
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
    const questions = [...(state.questions["p" + page] || [])];
    const oneBefore = state.questions["p" + (page - 1)] || [];
    const amount = data.amount;
    if (questions.length > 0 || oneBefore.length === 8 || amount === 0) {
      questions.push(data.data);
      state.questions["p" + page] = questions;
      if (amount === 0 || state.currentQuestionsPage.length < 8) {
        state.currentQuestionsPage.push(data.data);
      }
    }
  },
  /**
   * Updates a question into the question object, according to the question's name.
   *
   * @param {QuestionsState} state - The questions state.
   * @param {Question} data - The question to be updated.
   */
  updateQuestion(state, data) {
    const questions = state.questions;
    for (let key in questions) {
      if (questions[key]) {
        questions[key].forEach((item, index) => {
          if (item.name === data.name) {
            state.questions[key][index] = data;
          }
        });
      }
    }
  },
  /**
   * Updates a question that's in the filtered questions array, according to the question's name.
   *
   * @param {QuestionsState} state - The questions state.
   * @param {Question} data - The question to be updated.
   */
  updateFilteredQuestion(state, data) {
    const questions = [...state.filteredQuestions];
    questions.forEach((item, index) => {
      if (item.name === data.name) {
        questions[index] = data;
      }
    });
    state.filteredQuestions = questions;
  },
  /**
   * Updates a question that's in the current questions page array, according to the question's name.
   *
   * @param {QuestionsState} state - The questions state.
   * @param {Question} data - The question to be updated.
   */
  updateCurrentQuestionsPage(state, data) {
    const questions = [...state.currentQuestionsPage];
    questions.forEach((item, index) => {
      if (item.name === data.name) {
        questions[index] = data;
      }
    });
    state.currentQuestionsPage = questions;
  },
  /**
   * Deletes a question from the question object, according to the given data.
   *
   * @param {QuestionsState} state - The questions state.
   * @param {string} data - The name of the question to be deleted.
   */
  deleteQuestion(state, data) {
    const questions = state.questions;
    for (let key in questions) {
      if (questions[key]) {
        questions[key].forEach((item, index) => {
          if (item.name === data) {
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
   * @param {string} data - The name of the question to be deleted.
   */
  deleteFilteredQuestion(state, data) {
    const questions = [...state.filteredQuestions];
    questions.forEach((item, index) => {
      if (item.name === data) {
        state.filteredQuestions.splice(index, 1);
      }
    });
  },
  /**
   * Sets the last question request names.
   *
   * @param {QuestionsState} state - The questions state.
   * @param {[string, string]} data An array of strings containing the first and last question names from the last request.
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
      const ref = db.collection("questions").orderBy("name");

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
          if (snapshot.docs.length > 0) {
            first = snapshot.docs[0].data().name;
            last = snapshot.docs[snapshot.docs.length - 1].data().name;
          }

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
      if (pageContent && pageContent.length > 0) {
        const first = pageContent[0].name;
        const last = pageContent[pageContent.length - 1].name;
        commit("setLastQuestionDocument", [first, last]);
      }

      commit("setCurrentQuestionsPage", pageContent);
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
      const ref = db.collection("questions").orderBy("name");

      if (mode === "first") {
        request = ref.limit(itemsPerPage).get();
      } else {
        request = ref.limitToLast(amount || 8).get();
      }

      let first = null,
        last = null;

      request
        .then(snapshot => {
          if (snapshot.docs.length > 0) {
            first = snapshot.docs[0].data().name;
            last = snapshot.docs[snapshot.docs.length - 1].data().name;
          }

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
        const first = pageContent[0].name;
        const last = pageContent[pageContent.length - 1].name;
        commit("setCurrentQuestionsPage", pageContent);
        commit("setLastQuestionDocument", [first, last]);
      }
      commit("setLoading", false);
    }
  },
  /**
   * Searches for questions based on their name.
   *
   * @param {Store} store - The vuex store.
   * @param {string} payload - The string to be searched.
   */
  searchQuestions({ commit }, payload) {
    commit("setLoading", true);

    const data = [];

    db.collection("questions")
      .orderBy("name")
      .where("name", ">=", payload.toUpperCase())
      .where("name", "<=", payload.toUpperCase() + "~")
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
   * Gets all tests that includes a question based on it's name.
   *
   * @param {Object} payload - The action payload.
   * @param {string} payload.name - The question name.
   * @returns {Promise<Test[]>} An array of tests.
   */
  async checkQuestionInTests(_, payload) {
    const { name } = payload;

    try {
      const tests = [];

      const snapshot = await db
        .collection("tests")
        .where("questionsNames", "array-contains", name)
        .get();

      snapshot.forEach(doc => {
        tests.push(doc.data());
      });

      return tests;
    } catch (error) {
      console.error(error);
    }
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
        const errorModel = showErrorMessage("connection", "", error.message);
        commit("setError", { message: errorModel });
        createErrorLog("Question Mark Check", error.message, { data });
      });
  },
  /**
   * Marks a question to be deleted.
   *
   * @param {Store} store - The vuex store.
   * @param {Object} payload - The action payload.
   * @param {string} payload.name - The question name.
   * @param {boolean} payload.isSearching - Whether the application is using filtered questions or not.
   * @param {string} payload.userEmail - The current user e-mail.
   */
  deleteMarkQuestion({ commit }, payload) {
    commit("setLoading", true);

    const { name, isSearching, userEmail } = payload;

    db.collection("questions")
      .where("name", "==", name)
      .get()
      .then(snapshot => {
        const doc = snapshot.docs[0];

        const toDelete = {
          status: true,
          userEmail
        };

        doc.ref.update({ toDelete });

        commit("setDeleteMarkQuestion", { name, toDelete });

        if (isSearching) {
          commit("setDeleteMarkFilteredQuestion", { name, toDelete });
        }

        commit("updateCurrentQuestionsPage", {
          ...doc.data(),
          toDelete
        });
        commit("addDeleteMarkQuestion", { ...doc.data(), toDelete });

        db.collection("subjects")
          .where("name", "==", doc.data().subject)
          .get()
          .then(snap => {
            const document = snap.docs[0];
            const questions = document.data().questions;
            const index = questions.indexOf(name);

            if (index !== -1) questions.splice(index, 1);
            document.ref.update({ questions });

            commit("addRemoveQuestion", {
              subjectId: document.id,
              questionId: name,
              remove: true
            });
          })
          .catch(error => {
            console.error(error);
          });

        commit("setLoading", false);
      })
      .catch(error => {
        commit("setLoading", false);
        const errorModel = showErrorMessage("connection", "", error.message);
        commit("setError", { message: errorModel });
        createErrorLog("Question Delete Mark", error.message, {
          payload
        });
      });
  },
  /**
   * Restores a question from being marked to be deleted.
   *
   * @param {Store} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {string} payload.name The question name.
   * @param {boolean} payload.isSearching Whether the application is using filtered questions or not.
   * @param {boolean} payload.isRequest Whether the question is a request or not.
   */
  async restoreMarkedQuestion({ commit, dispatch }, payload) {
    commit("setLoading", true);

    const { name, isSearching, isRequest } = payload;

    try {
      const snapshot = await db
        .collection("questions")
        .where("name", "==", name)
        .get();

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
          name: data.name,
          created: data.created,
          updated: data.updated,
          subject: data.subject,
          question: data.question,
          level: data.level,
          answers: data.answers,
          image: data.image,
          imageSize: data.imageSize
        };
      }

      await doc.ref.set(question);

      commit("updateQuestion", question);

      if (isSearching) {
        commit("updateFilteredQuestion", question);
      }

      commit("removeDeleteMarkQuestion", name);
      commit("updateCurrentQuestionsPage", question);

      const subSnap = await db
        .collection("subjects")
        .where("name", "==", question.subject)
        .get();

      const document = subSnap.docs[0];

      if (!document.data().questions.includes(question.name)) {
        const questions = [...document.data().questions, name];
        questions.sort((q1, q2) => (q1 > q2 ? 1 : -1));

        await document.ref.update({ questions });

        commit("addRemoveQuestion", {
          subjectId: document.id,
          questionId: name
        });
      }

      await dispatch("addQuestionQuizzesBySubject", {
        subject: question.subject,
        question
      });

      if (!isRequest) {
        commit("setSuccess", "Questão restaurada com sucesso!");
      }
    } catch (error) {
      const errorModel = showErrorMessage("connection", "", error.message);

      commit("setError", { message: errorModel });
      createErrorLog("Question Restore", error.message, { payload });
    } finally {
      commit("setLoading", false);
    }
  },
  /**
   * Restores all questions that are marked to be deleted.
   *
   * @param {Store} store - The vuex store.
   * @param {Object} payload - The action payload.
   * @param {boolean} payload.isSearching - Whether the application is using filtered questions or not.
   */
  async restoreAllMarkedQuestions({ commit, dispatch, state }, payload) {
    commit("setLoading", true);

    const { isSearching } = payload;
    const questionsData = {};

    try {
      const snapshot = await db
        .collection("questions")
        .where("toDelete.status", "==", true)
        .get();

      const promises = snapshot.docs.map(async doc => {
        const data = doc.data();

        /**
         * @type {Question}
         */
        const question = {
          name: data.name,
          created: data.created,
          updated: data.updated,
          subject: data.subject,
          level: data.level,
          question: data.question,
          answers: data.answers,
          image: data.image,
          imageSize: data.imageSize
        };

        if (questionsData[question.subject]) {
          questionsData[question.subject] = [
            ...questionsData[question.subject],
            question.name
          ];
        } else {
          questionsData[question.subject] = [question.name];
        }

        await doc.ref.set(question);

        const falseMarkedQuestions = state.deleteMarkQuestions.filter(
          q => !q.toDelete.status
        );

        commit("setDeleteMarkQuestions", falseMarkedQuestions);
        commit("updateQuestion", question);
        commit("updateCurrentQuestionsPage", question);

        if (isSearching) {
          commit("updateFilteredQuestion", question);
        }

        return await dispatch("addQuestionQuizzesBySubject", {
          subject: question.subject,
          question
        });
      });

      await Promise.all(promises);

      for (let subject in questionsData) {
        const subSnap = await db
          .collection("subjects")
          .where("name", "==", subject)
          .get();

        const doc = subSnap.docs[0];
        const questions = [...doc.data().questions];

        questionsData[subject].forEach(q => {
          if (!questions.includes(q)) {
            questions.push(q);
          }

          commit("addRemoveQuestion", {
            subjectId: doc.id,
            questionId: q
          });
        });

        questions.sort((q1, q2) => (q1 > q2 ? 1 : -1));
        await doc.ref.update({ questions });
      }

      commit("setSuccess", "Questões restauradas com sucesso!");
    } catch (error) {
      const errorModel = showErrorMessage("connection", "", error.message);

      commit("setError", { message: errorModel });
      createErrorLog("Question Restore All", error.message, {
        payload,
        questionsData
      });
    } finally {
      commit("setLoading", false);
    }
  },
  /**
   * Changes a question's delete status to false (confirmed deletion).
   *
   * @param {Store} store - The vuex store.
   * @param {Object} payload - The action payload.
   * @param {string} payload.name - The question name.
   * @param {boolean} payload.isSearching - Whether the application is using filtered questions or not.
   */
  changeDeleteStatusQuestions({ commit }, payload) {
    commit("setLoading", true);
    const { name, isSearching } = payload;

    db.collection("questions")
      .where("name", "==", name)
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
   * @param {Store} store The vuex store.
   */
  deleteQuestions({ commit, rootState }) {
    /**
     * @type {Object.<string, number>}
     */
    const subjects = {};

    for (const key in rootState.Subject.subjects) {
      /**
       * @type {import('./subject.store').Subject}
       */
      const sub = rootState.Subject.subjects[key];
      subjects[sub.name] = 0;
    }

    db.collection("questions")
      .where("toDelete.status", "==", false)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          doc.ref.delete();
          subjects[doc.data().subject] += 1;

          if (doc.data().image && doc.data().image.length > 0) {
            const image = doc.data().image;
            const childImage = image.split("?alt=media")[0].split("/o/")[1];
            const child = decodeURIComponent(childImage);
            storage
              .ref()
              .child(child)
              .delete();
          }

          db.collection("subjects")
            .where("name", "==", doc.data().subject)
            .get()
            .then(snap => {
              const document = snap.docs[0];
              const questions = document.data().questions;
              const index = questions.findIndex(
                q => q.name === doc.data().name
              );

              if (index !== -1) questions.splice(index, 1);

              document.ref.update({ questions });

              commit("addRemoveQuestion", {
                subjectId: document.id,
                questionId: doc.data().name,
                questionLevel: doc.data().level.index,
                remove: true
              });
            })
            .catch(error => {
              console.error(error);
            });
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
              if (questions && subjects[key])
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
   * @param {Store} store the vuex store.
   * @param {Object} payload the action payload.
   * @param {File} payload.image the image to be uploaded.
   * @param {string} payload.name the question name.
   * @returns {Promise<string>} the image url.
   */
  async uploadImageQuestion({ commit }, payload) {
    try {
      const storageRef = storage.ref();

      const file = payload.image;
      const questionName = payload.name;
      const type = file.type.split("/")[1];
      const format = `questions/question-${questionName}.${type}`;

      const snapshot = await storageRef.child(format).put(file);
      const downloadURL = await snapshot.ref.getDownloadURL();

      return downloadURL.toString();
    } catch (error) {
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
    }
  },
  /**
   * Updates a question based on it's name.
   *
   * @param {Store} store - The vuex store.
   * @param {Object} payload - The action payload.
   * @param {Question} payload.questionData - The question to be updated.
   * @param {Question} payload.oldData - The question to be kept in the history.
   * @param {string} payload.user - The current user id.
   * @param {isSearching} payload.isSearching - Whether the application is using the filtered questions or not.
   */
  async editQuestion({ commit, dispatch }, payload) {
    commit("setLoading", true);

    const question = {
      ...payload.questionData,
      updated: getNowISOString()
    };

    let oldSubject = null;

    try {
      const snapshot = await db
        .collection("questions")
        .where("name", "==", question.name)
        .get();

      const promises = snapshot.docs.map(async doc => {
        if (question.subject !== doc.data().subject) {
          oldSubject = doc.data().subject;
        }
        return await doc.ref.update(question);
      });

      await Promise.all(promises);

      commit("updateQuestion", question);
      commit("updateCurrentQuestionsPage", question);

      if (payload.isSearching) {
        commit("updateFilteredQuestion", question);
      }

      if (oldSubject) {
        const sizeSnap = await db.collection("data-size").get();

        const document = sizeSnap.docs[0];
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
        };

        await document.ref.update({ questions });

        commit("addRemoveSize", {
          key: "questions",
          data: questions
        });

        const newSubSnap = await db
          .collection("subjects")
          .where("name", "==", question.subject)
          .get();

        const newSubDoc = newSubSnap.docs[0];
        const nSubQuestions = [
          ...newSubDoc.data().questions,
          { level: question.level.index, name: question.name }
        ];

        nSubQuestions.sort((q1, q2) => (q1.name > q2.name ? 1 : -1));

        await newSubDoc.ref.update({ questions: nSubQuestions });

        commit("addRemoveQuestion", {
          subjectId: newSubDoc.id,
          questionId: question.name,
          questionLevel: question.level.index
        });

        const oldSubSnap = await db
          .collection("subjects")
          .where("name", "==", oldSubject)
          .get();

        const oldSubDoc = oldSubSnap.docs[0];
        const oldSubQuestions = oldSubDoc.data().questions || [];
        const index = oldSubQuestions.findIndex(q => q.name === question.name);

        if (index !== -1) {
          oldSubQuestions.splice(index, 1);
        }

        await oldSubDoc.ref.update({ questions: oldSubQuestions });

        commit("addRemoveQuestion", {
          subjectId: oldSubDoc.id,
          questionId: question.name,
          questionLevel: question.level.index,
          remove: true
        });
      }

      /**
       * @type {Test[]}
       */
      const tests = await dispatch("checkQuestionInTests", {
        name: question.name
      });

      await dispatch("addQuestionQuizzesBySubject", {
        subject: question.subject,
        question
      });

      const testPromises = tests.map(async t => {
        if (t.type === "auto") {
          const subject = question.subject;

          if (
            t.subjects &&
            t.subjects.includes(subject) &&
            question.level.index <= t.level.index
          ) {
            return;
          }

          const index = t.questionsNames.indexOf(question.name);

          if (index === -1) {
            return;
          }

          t.questionsNames.splice(index, 1);

          if (t.questionsNames.length < t.questionsAmount) {
            t.questionsAmount = t.questionsNames.length;
          }
        } else {
          const index = t.questions.findIndex(q => q.name === question.name);

          if (index === -1) {
            return;
          }

          t.questions[index] = question;
        }

        await dispatch("updateTest", { testData: t });

        return t;
      });

      await Promise.all(testPromises);

      commit("setSuccess", "Questão editada com sucesso!");
    } catch (error) {
      const errorModel = showErrorMessage("edition", "Questão", error.message);

      commit("setError", { message: errorModel });
      createErrorLog("Question DB Upload", error.message, {
        payload
      });
    } finally {
      commit("setLoading", false);
    }
  },
  /**
   * Checks if a question with the given name exists.
   *
   * @param {Store} store - The vuex store.
   * @param {string} payload - The question name.
   * @returns {Promise<boolean>} Whether the question exists or not.
   */
  async questionExists(_, payload) {
    return new Promise((resolve, reject) => {
      try {
        db.collection("questions")
          .where("name", "==", payload)
          .get()
          .then(snapshot => {
            if (snapshot.docs.length > 0) resolve(true);
            else {
              db.collection("question-requests")
                .where("name", "==", payload)
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
   * @param {Store} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {QuestionCreation} payload.question The question to be created.
   * @param {boolean} payload.isRequest Whether the question is a request or not.
   */
  async createQuestion({ commit, dispatch }, payload) {
    commit("setLoading", true);

    const createdDate = getNowISOString();

    const question = {
      created: createdDate,
      updated: createdDate,
      ...payload.question
    };

    let questionAmount = this.getters.getDataSize.questions.general;
    questionAmount = questionAmount <= 0 ? 0 : questionAmount;

    const pageAmount = Math.ceil(questionAmount / 8);
    const amount = questionAmount % 8;

    try {
      await db.collection("questions").add(question);

      commit("createQuestion", {
        page: amount === 0 ? pageAmount + 1 : pageAmount,
        data: question,
        amount: questionAmount
      });

      const sizeSnap = await db.collection("data-size").get();

      const document = sizeSnap.docs[0];
      const general = document.data().questions.general;
      const sub = question.subject;
      const subSize = document.data().questions.subject[sub] || 0;

      const questions = {
        general: general + 1,
        subject: {
          ...document.data().questions.subject,
          [sub]: subSize + 1
        }
      };

      await document.ref.update({ questions });

      commit("addRemoveSize", {
        key: "questions",
        data: questions
      });

      const subSnap = await db
        .collection("subjects")
        .where("name", "==", question.subject)
        .get();

      const doc = subSnap.docs[0];

      if (!doc.data().questions.includes(question.name)) {
        const questions = [
          ...doc.data().questions,
          { name: question.name, level: question.level.index }
        ];
        questions.sort((q1, q2) => (q1 > q2 ? 1 : -1));

        await doc.ref.update({ questions });

        commit("addRemoveQuestion", {
          subjectId: doc.id,
          questionId: question.name,
          questionLevel: question.level.index
        });
      }

      await dispatch("addQuestionQuizzesBySubject", {
        subject: question.subject,
        question
      });

      if (!payload.isRequest) {
        commit("setSuccess", "Questão criada com sucesso!");
      }
    } catch (error) {
      const errorModel = showErrorMessage("creation", "Questão", error.message);

      commit("setError", { message: errorModel });
      createErrorLog("Question DB Insert", error.message, {
        payload
      });
    } finally {
      commit("setLoading", false);
    }
  },
  /**
   * Gets a question by it's name.
   *
   * @param {string} payload the question name.
   * @returns {Question} an object that represents the question data.
   */
  async getQuestionByName(_, payload) {
    try {
      const snapshot = await db
        .collection("questions")
        .where("name", "==", payload)
        .get();

      return snapshot.docs.length ? snapshot.docs[0].data() : null;
    } catch (error) {
      const errorModel = showErrorMessage("load", "Questão", error.message);

      commit("setError", { message: errorModel });
      createErrorLog("Question Name Load", error.message, {
        payload
      });
    }
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
   * Gets an array of answers based on the question's name.
   *
   * @param {QuestionsState} state - The questions state.
   * @param {string} name - The question name.
   * @returns {(name: string) => Answer[]} An array of answers.
   */
  getAnswersById(state) {
    return name => {
      const aux = [];

      for (let key in state.questions) {
        if (state.questions[key].name === name) {
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
