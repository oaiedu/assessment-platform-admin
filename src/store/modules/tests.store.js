import { Store } from "vuex";
import uuid from "uuid-random";

import { analytics, db } from "../../main";
import { getNowISOString } from "../../utils/date";
import { createErrorLog, showErrorMessage } from "../../utils/errors";

/**
 * @typedef {import('./questions.store.js').Question} Question
 */

/**
 * @typedef {Object} Time
 * @property {number} hours Defines how many hours.
 * @property {number} minutes Defines how many minutes.
 * @property {number} seconds Defines how many seconds.
 */

/**
 * @typedef {Object} AttemptAnswers
 * @property {number} answer Defines what answer was selected (1 - 4).
 * @property {boolean} correct Defines whether the selected answer is correct.
 * @property {string} questionName Defines the question name that contains the answer.
 */

/**
 * @typedef {Object} AttemptSubject
 * @property {string} subject Defines the subject name.
 * @property {string[]} questions Defines an array with all questions names from this subject.
 */

/**
 * @typedef {Object} Attempt
 * @property {boolean} approved Defines whether the attempt was successful.
 * @property {AttemptAnswers[]} answers Defines an array that contains all the quiz answers.
 * @property {Date} date Defines when the attempt was finished.
 * @property {string} mode Defines the attempt mode. Ex.: 'practice'.
 * @property {string[]} questions Defines an array that contains all questions names from the quiz.
 * @property {AttemptSubject[]} subjects Defines an array of subjects that contains their name and questions.
 * @property {string} quizId Defines the quiz id.
 * @property {number} score Defines the percentage (%) of correct answers.
 * @property {Time} timeTaken Defines how many hours, minutes and seconds the attempt has taken.
 * @property {string} userId Defines the id of the user that finished the attempt.
 */

/**
 * @typedef {Object} Level
 * @property {number} index Defines the level index.
 * @property {'beginner' | 'intermediary' | 'advanced' | 'expert'} name Defines the level name.
 */

/**
 * @typedef {Object} DeleteStatus
 * @property {boolean} toDelete.status If true, the question can be restored. If false, it will be deleted.
 * @property {string|undefined} toDelete.userEmail Define the user that marked the question to be deleted.
 */

/**
 * @typedef {Object} TestCreation
 * @property {string} userId Defines the user that created the quiz.
 * @property {string} title Defines the quiz title.
 * @property {string} instructions Defines the quiz instructions.
 * @property {"selected"|"random"} type Defines the quiz type.
 * @property {Question[]} questions Defines the quiz questions.
 */

/**
 * @typedef {Object} Test
 * @property {string} id Defines the quiz id.
 * @property {string} created Defines the quiz creation date.
 * @property {string} updated Defines the quiz edition date.
 * @property {string} userId Defines the user that created the quiz.
 * @property {string} title Defines the quiz title.
 * @property {string} instructions Defines the quiz instructions.
 * @property {number} questionsAmount Defines how many questions the quiz have.
 * @property {number} approvalPercentage Defines how much of the quiz must be correct to approve the user.
 * @property {boolean} unlimitedTime Defines whether the quiz has unlimited time.
 * @property {Time} time Defines the quiz timer.
 * @property {Level} level Defines the quiz level.
 * @property {"selected"|"random"|"auto"} type Defines the quiz type.
 * @property {Question[]} questions Defines an array of questions.
 * @property {string[]} questionsNames Defines an array that contains all questions names added to the quiz.
 * @property {Object<string, number>} userAttempts Defines an object containing all user attempts (id and number of attempts).
 * @property {DeleteStatus|undefined} toDelete Defines the quiz deletion status.
 */

/**
 * @typedef {Object} TestsState
 * @property {Object.<string, Test[]>} tests Defines the pages with it's quizzes list.
 * @property {Test[]} filteredTests Defines an array of quizzes filtered by id.
 * @property {Test[]} currentTestsPage Defines an array of quizzes of the current page.
 * @property {[string, string]|null} lastTestDocument Defines an array with the first and last quiz id from the last request.
 * @property {Question[]} testQuestions Defines an array of questions from a specific quiz.
 * @property {Test[]} deleteMarkTests Defines an array of quizzes that were marked to be deleted.
 * @property {Test[]} lastTests Defines an array of the most recent quizzes.
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
      if (item.id === data.id) {
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
      if (item.id === data) {
        state.deleteMarkTests.splice(index, 1);
      }
    });
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
    for (let key in tests) {
      if (tests[key]) {
        tests[key].forEach((item, index) => {
          if (item.id === data.id) {
            state.tests[key][index] = {
              ...item,
              toDelete: data.toDelete
            };
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
      if (item.id === data.id) {
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
    const tests = [...(state.tests["p" + page] || [])];
    const amount = data.amount;
    const oneBefore = state.tests["p" + (page - 1)] || [];
    if (tests.length > 0 || oneBefore.length === 10 || amount === 0) {
      tests.push(data.data);
      state.tests["p" + page] = [...tests];
      if (amount === 0 || state.currentTestsPage.length < 10) {
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
    const tests = { ...state.tests };
    for (let key in tests) {
      if (tests[key]) {
        state.tests[key].forEach((item, index) => {
          if (item.id === data.id) {
            tests[key][index] = data;
          }
        });
      }
    }

    state.tests = tests;
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
      if (item.id === data.id) {
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
      if (item.id === data.id) {
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
    for (let key in tests) {
      if (tests[key]) {
        tests[key].forEach((item, index) => {
          if (item.id === data) {
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
   * @param {string} data - The id of the test to be deleted.
   */
  deleteFilteredTest(state, data) {
    const tests = state.filteredTests;
    tests.forEach((item, index) => {
      if (item.id === data) {
        state.filteredTests.splice(index, 1);
      }
    });
  },
  /**
   * Sets the last test request ids.
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
};

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
    commit("setLoading", true);

    const { page, itemsPerPage, type } = payload;
    const data = [];

    const pages = Object.keys(state.tests);

    if (!pages.includes("p" + page)) {
      let request = null;
      const ref = db.collection("tests").orderBy("id");

      if (type === "next") {
        request = ref
          .startAfter(state.lastTestDocument[1])
          .limit(itemsPerPage)
          .get();
      } else {
        request = ref
          .endBefore(state.lastTestDocument[0])
          .limitToLast(itemsPerPage)
          .get();
      }

      let first = null,
        last = null;

      request
        .then(async snapshot => {
          if (!snapshot.empty) {
            first = snapshot.docs[0].data().id;
            last = snapshot.docs[snapshot.docs.length - 1].data().id;

            const promises = snapshot.docs.map(async doc => {
              const userData = await dispatch("getUserById", {
                id: doc.data().userId
              });
              data.push({ ...doc.data(), user: userData });
              return userData;
            });

            await Promise.all(promises);
          }
        })
        .then(() => {
          commit("setCurrentTestsPage", data);
          commit("setTestPage", { page: "p" + page, data });
          commit("setLastTestDocument", [first, last]);
          commit("setLoading", false);
        })
        .catch(error => {
          commit("setLoading", false);
          const errorModel = showErrorMessage("load", "Quizzes", error.message);
          commit("setError", { message: errorModel });
          createErrorLog("Test Page Load", error.message, {
            payload,
            data
          });
        });
    } else {
      const pageContent = state.tests["p" + page];
      const first = pageContent[0].id;
      const last = pageContent[pageContent.length - 1].id;

      commit("setCurrentTestsPage", pageContent);
      commit("setLastTestDocument", [first, last]);
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
  loadFOLTestPage({ commit, dispatch, state }, payload) {
    commit("setLoading", true);

    const { page, itemsPerPage, mode } = payload;
    const data = [];

    const pages = Object.keys(state.tests);

    const testAmount = this.getters.getDataSize.tests;
    const amount = testAmount % 10;

    if (!pages.includes("p" + page)) {
      let request = null;
      const ref = db.collection("tests").orderBy("id");

      if (mode === "first") {
        request = ref.limit(itemsPerPage).get();
      } else {
        request = ref.limitToLast(amount || 10).get();
      }

      let first = null,
        last = null;

      request
        .then(async snapshot => {
          if (!snapshot.empty) {
            first = snapshot.docs[0].data().id;
            last = snapshot.docs[snapshot.docs.length - 1].data().id;

            const promises = snapshot.docs.map(async doc => {
              const userData = await dispatch("getUserById", {
                id: doc.data().userId
              });
              data.push({ ...doc.data(), user: userData });
              return userData;
            });

            await Promise.all(promises);
          }
        })
        .then(() => {
          if (data.length > 0) {
            commit("setCurrentTestsPage", data);
            commit("setTestPage", { page: "p" + page, data });
            commit("setLastTestDocument", [first, last]);
          }
          commit("setLoading", false);
        })
        .catch(error => {
          commit("setLoading", false);
          const errorModel = showErrorMessage("load", "Quizzes", error.message);
          commit("setError", { message: errorModel });
          createErrorLog("Test FOL Page Load", error.message, {
            payload,
            data
          });
        });
    } else {
      const pageContent = state.tests["p" + page];

      if (pageContent && pageContent[0]) {
        const first = pageContent[0].id;
        const last = pageContent[pageContent.length - 1].id;
        commit("setCurrentTestsPage", pageContent);
        commit("setLastTestDocument", [first, last]);
      }
      commit("setLoading", false);
    }
  },
  /**
   * Checks if a test with the given title exists.
   *
   * @param {Store} store - The vuex store.
   * @param {string} payload - The test title.
   * @returns {Promise<number>} The number of tests that match the given title.
   */
  async testExists({commit}, payload) {
    return new Promise((resolve, reject) => {
      try {
        db.collection("tests")
          .where("title", "==", payload)
          .get()
          .then(snapshot => {
            if (snapshot.docs.length > 0) resolve(snapshot.docs.length);
            else resolve(0);
          })
          .catch(error => {
            const errorModel = showErrorMessage(
              "connection",
              "",
              error.message
            );
            commit("setError", { message: errorModel });
            createErrorLog("Test Exists Check", error.message, {
              payload
            });
          });
      } catch (error) {
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
    commit("setLoading", true);

    const data = [];

    db.collection("tests")
      .orderBy("title")
      .where("title", ">=", payload)
      .where("title", "<=", payload + "~")
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          data.push(doc.data());
        });
      })
      .then(async () => {
        await db
          .collection("tests")
          .orderBy("title")
          .where("title", ">=", payload.toUpperCase())
          .where("title", "<=", payload.toUpperCase() + "~")
          .get()
          .then(snap => {
            const ids = data.map(t => t.id);
            snap.forEach(document => {
              if (!ids.includes(document.data().id)) {
                data.push(document.data());
              }
            });
          });
      })
      .then(async () => {
        await db
          .collection("tests")
          .orderBy("title")
          .where("title", ">=", payload.toLowerCase())
          .where("title", "<=", payload.toLowerCase() + "~")
          .get()
          .then(snap => {
            const ids = data.map(t => t.id);
            snap.forEach(document => {
              if (!ids.includes(document.data().id)) {
                data.push(document.data());
              }
            });
          });
      })
      .then(async () => {
        const promises = data.map(async (doc, index) => {
          const userData = await dispatch("getUserById", {
            id: doc.userId
          });
          data[index] = { ...doc, user: userData };
          return userData;
        });

        await Promise.all(promises);

        commit("setFilteredTests", data);
        commit("setLoading", false);
      })
      .catch(error => {
        commit("setLoading", false);
        const errorModel = showErrorMessage(
          "load",
          "Quizzes",
          "Searching error - " + error.message
        );
        commit("setError", { message: errorModel });
        createErrorLog("Test Search", error.message, { payload, data });
      });
  },
  /**
   * Loads the questions from a given test.
   *
   * @param {Store} store - The vuex store.
   * @param {Test} payload - The test payload.
   */
  loadTestQuestions({ commit }, payload) {
    commit("setTestQuestions", [...payload.questions]);
  },
  /**
   * Loads all tests that are marked to be deleted.
   *
   * @param {Store} store - The vuex store.
   */
  checkDeleteMarkTests({ commit, dispatch }) {
    const data = [];

    db.collection("tests")
      .where("toDelete.status", "==", true)
      .get()
      .then(async snapshot => {
        const promises = snapshot.docs.map(async doc => {
          const userData = await dispatch("getUserById", {
            id: doc.data().userId
          });
          data.push({ ...doc.data(), user: userData });
          return userData;
        });

        await Promise.all(promises);
      })
      .then(() => {
        commit("setDeleteMarkTests", data);
      })
      .catch(error => {
        const errorModel = showErrorMessage("connection", "", error.message);
        commit("setError", { message: errorModel });
        createErrorLog("Test Mark Check", error.message, { data });
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
    commit("setLoading", true);

    const { id, isSearching, userEmail } = payload;

    db.collection("tests")
      .where("id", "==", id)
      .get()
      .then(async snapshot => {
        if(snapshot.empty){
          commit("setLoading", false);
          return;
        }
        const doc = snapshot.docs[0];

        const toDelete = {
          status: true,
          userEmail
        };

        doc.ref.update({ toDelete });

        const user = await dispatch("getUserById", {
          id: doc.data().userId
        });

        commit("setDeleteMarkTest", { id, toDelete });

        if (isSearching) {
          commit("setDeleteMarkFilteredTest", { id, toDelete });
        }

        commit("updateCurrentTestsPage", {
          ...doc.data(),
          toDelete,
          user
        });
        commit("addDeleteMarkTest", { ...doc.data(), toDelete, user });
        commit("setLoading", false);
      })
      .catch(error => {
        commit("setLoading", false);
        const errorModel = showErrorMessage("connection", "", error.message);
        commit("setError", { message: errorModel });
        createErrorLog("Test Delete Mark", error.message, { payload });
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
  restoreMarkedTest({ commit, dispatch }, payload) {
    commit("setLoading", true);

    const { id, isSearching } = payload;
    let docData = null;

    db.collection("tests")
      .where("id", "==", id)
      .get()
      .then(async snapshot => {
        if (snapshot.empty) {
          commit("setLoading", false);
          return;
        }
        const doc = snapshot.docs[0];

        /**
         * @type {Test}
         */
        const data = doc.data();
        docData = data;

        /**
         * @type {Test}
         */
        const test = {
          id: data.id,
          title: data.title,
          created: data.created,
          updated: data.updated,
          questions: data.questions,
          questionsNames: data.questionsNames,
          questionsAmount: data.questionsAmount,
          approvalPercentage: data.approvalPercentage,
          time: data.time,
          unlimitedTime: data.unlimitedTime,
          level: data.level,
          type: data.type,
          userId: data.userId,
          userAttempts: data.userAttempts,
          instructions: data.instructions
        };

        await doc.ref.set(test);

        const user = await dispatch("getUserById", { id: test.userId });
        test["user"] = user;

        commit("updateTest", test);

        if (isSearching) {
          commit("updateFilteredTest", test);
        }

        commit("removeDeleteMarkTest", id);
        commit("updateCurrentTestsPage", test);
        commit("setLoading", false);
        commit("setSuccess", "Quiz successfully restored!");
      })
      .catch(error => {
        commit("setLoading", false);
        const errorModel = showErrorMessage("connection", "", error.message);
        commit("setError", { message: errorModel });
        createErrorLog("Test Restore", error.message, {
          payload,
          docData
        });
      });
  },
  /**
   * Restores all tests that are marked to be deleted from the database or the current user, depending on the given data.
   *
   * @param {Store} store - The vuex store.
   * @param {Object} payload - The action payload.
   * @param {boolean} payload.all - Whether will restore all database tests or only from the current user.
   * @param {boolean} payload.isSearching - Whether the application is using filtered tests or not.
   * @param {import('./user.store.js').UserInfo} payload.user - The current user info.
   */
  restoreAllMarkedTests({ commit, dispatch, state }, payload) {
    commit("setLoading", true);

    const { all, isSearching, user } = payload;
    let docData = null;

    const ref = db.collection("tests").where("toDelete.status", "==", true);
    let request = null;

    if (all) {
      request = ref;
    } else {
      request = ref.where("toDelete.userEmail", "==", user.email);
    }

    request
      .get()
      .then(snapshot => {
        snapshot.forEach(async doc => {
          /**
           * @type {Test}
           */
          const data = doc.data();
          docData = data;

          /**
           * @type {Test}
           */
          const test = {
            id: data.id,
            title: data.title,
            created: data.created,
            updated: data.updated,
            questions: data.questions,
            questionsNames: data.questionsNames,
            questionsAmount: data.questionsAmount,
            approvalPercentage: data.approvalPercentage,
            time: data.time,
            unlimitedTime: data.unlimitedTime,
            level: data.level,
            type: data.type,
            userId: data.userId,
            userAttempts: data.userAttempts,
            instructions: data.instructions
          };

          await doc.ref.set(test);

          const userData = await dispatch("getUserById", {
            id: test.userId
          });
          test["user"] = userData;

          if (all) {
            const falseMarkedTests = state.deleteMarkTests.filter(
              t => !t.toDelete.status
            );
            commit("setDeleteMarkTests", falseMarkedTests);
          } else {
            const markedTests = state.deleteMarkTests.filter(
              t => t.id !== test.id
            );
            commit("setDeleteMarkTests", markedTests);
          }

          commit("updateTest", test);
          commit("updateCurrentTestsPage", test);
          if (isSearching) commit("updateFilteredTest", test);
          commit("setSuccess", "Quizzes successfully restored!");
        });
      })
      .then(() => commit("setLoading", false))
      .catch(error => {
        commit("setLoading", false);
        const errorModel = showErrorMessage("connection", "", error.message);
        commit("setError", { message: errorModel });
        createErrorLog("Test Restore All", error.message, {
          payload,
          docData
        });
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
    commit("setLoading", true);
    const { id, isSearching } = payload;

    db.collection("tests")
      .where("id", "==", id)
      .get()
      .then(async snapshot => {
        if (snapshot.empty) {
          commit("setLoading", false);
          return;
        }
        const doc = snapshot.docs[0];
        const toDelete = {
          status: false
        };

        doc.ref.update({ ...doc.data(), toDelete: { status: false } });

        const user = await dispatch("getUserById", {
          id: doc.data().userId
        });

        commit("updateCurrentTestsPage", {
          ...doc.data(),
          toDelete,
          user
        });
        commit("updateTest", { ...doc.data(), toDelete, user });
        commit("updateDeleteMarkTest", {
          ...doc.data(),
          toDelete,
          user
        });
        if (isSearching)
          commit("updateFilteredTest", {
            ...doc.data(),
            toDelete,
            user
          });

        commit("setLoading", false);
        commit("setSuccess", "Quizzes successfully deleted!");
      })
      .catch(error => {
        const errorModel = showErrorMessage(
          "exclusion",
          "Quizzes",
          error.message
        );
        commit("setError", { message: errorModel });
        createErrorLog("Test Confirm Delete", error.message, {
          payload
        });
      });
  },
  /**
   * Deletes all tests that are marked to be deleted (toDelete.status = false).
   *
   * @param {Store} store - The vuex store.
   */
  deleteTests({ commit, dispatch }) {
    const data = [];

    db.collection("tests")
      .where("toDelete.status", "==", false)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          doc.ref.delete();
          data.push(doc.data());
        });

        db.collection("data-size")
          .get()
          .then(snap => {
            if (snap.empty) return;
            const document = snap.docs[0];
            const size = document.data().tests ?? 0;

            document.ref.update({
              tests: size - snapshot.docs.length
            });
            commit("addRemoveSize", {
              key: "tests",
              data: size - snapshot.docs.length
            });
          })
          .catch(error => {
            console.error(error);
          });
      })
      .then(() => {
        if (data.length > 0) dispatch("removeTestsByWeek", { tests: data });
      })
      .catch(error => {
        console.error("Error removing test: ", error);
        createErrorLog("Test DB Delete", error.message, { data });
      });
  },
  /**
   * Creates a new test.
   *
   * @param {Store} store - The vuex store.
   * @param {Object} payload - The action payload.
   * @param {TestCreation} payload.testData - The test to be created.
   * @param {import('./user.store.js').UserInfo} payload.userInfo - The current user info.
   */
  async createTest({ commit, dispatch }, payload) {
    commit("setLoading", true);

    const createdDate = getNowISOString();
    const { testData, userInfo } = payload;

    /**
     * @type {Test}
     */
    const test = {
      id: uuid(),
      ...testData,
      created: createdDate,
      updated: createdDate
    };

    const testAmount = this.getters.getDataSize.tests;
    const pageAmount = Math.ceil(testAmount / 10);
    const amount = testAmount % 10;

    try {
      await db.collection("tests").add(test);

      analytics.logEvent("create_quiz", {
        type: test.type,
        questions: test.questionsAmount,
        level: test.level.index
      });

      commit("createTest", {
        page: amount === 0 ? pageAmount + 1 : pageAmount,
        data: { ...test, user: { ...userInfo } },
        amount: testAmount
      });

      const sizeSnap = await db.collection("data-size").get();
      if (sizeSnap.empty) {
        commit("setLoading", false);
        return;
      }
      const document = sizeSnap.docs[0];
      const size = document.data().tests;

      await document.ref.update({ tests: size + 1 });

      commit("addRemoveSize", {
        key: "tests",
        data: size + 1
      });

      dispatch("addTestsByWeek");

      commit("setSuccess", "Quiz successfully created!");
    } catch (error) {
      const errorModel = showErrorMessage("creation", "Quiz", error.message);

      commit("setError", { message: errorModel });
      createErrorLog("Test DB Insert", error.message, { test });
    } finally {
      commit("setLoading", false);
    }
  },
  /**
   * Updates a test based on it's id.
   *
   * @param {Store} store the vuex store.
   * @param {Object} payload the action payload.
   * @param {Test} payload.testData the test to be updated.
   * @param {boolean} payload.noMessage whether the success message will appear.
   * @param {boolean} payload.isSearching whether the filtered tests is being used.
   */
  async updateTest({ commit, dispatch }, payload) {
    const { testData, isSearching } = payload;

    const test = { ...testData, updated: getNowISOString() };

    delete test.user;

    try {
      const snapshot = await db
        .collection("tests")
        .where("id", "==", test.id)
        .get();
      
      if(snapshot.empty){
        commit("setLoading", false);
        return;
      }

      await snapshot.docs[0].ref.update(test);

      const user = await dispatch("getUserById", {
        id: test.userId
      });
      test["user"] = user;

      commit("updateTest", test);
      commit("updateCurrentTestsPage", test);

      if (isSearching) {
        commit("updateFilteredTest", test);
      }

      if (!payload.noMessage) {
        commit("setSuccess", "Quiz successfully edited!");
      }
    } catch (error) {
      const errorModel = showErrorMessage("edition", "Quiz", error.message);

      commit("setError", { message: errorModel });
      createErrorLog("Test DB Update", error.message, { payload });
    } finally {
      commit("setLoading", false);
    }
  },
  /**
   * Gets all the questions names from a subject.
   *
   * @param {Store} store The vuex store.
   * @param {string} payload The subject name.
   * @returns {Promise<string[]>} An array of names.
   */
  async getSubjectQuestions({ commit }, payload) {
    const subject = payload;

    return new Promise((resolve, reject) => {
      try {
        db.collection("subjects")
          .where("name", "==", subject)
          .get()
          .then(snapshot => {
            if(snapshot.empty){
              resolve([]);
              return;
            }
            const questions = snapshot.docs[0].data().questions;
            resolve(questions);
          })
          .catch(error => {
            const errorModel = showErrorMessage("load", "IDs" + error.message);
            commit("setError", { message: errorModel });
            createErrorLog("Test Subject Names", error.message, {
              payload
            });
          });
      } catch (error) {
        reject("getSubjectQuestions");
      }
    });
  },
  /**
   * Loads the most recent tests.
   *
   * @param {Store} store - The vuex store.
   */
  loadLastTests({ commit, dispatch }, payload) {
    commit("setLoading", true);

    const { limit } = payload;

    const data = [];

    db.collection("tests")
      .orderBy("updated", "desc")
      .limit(limit || 5)
      .get()
      .then(async snapshot => {
        const promises = snapshot.docs.map(async doc => {
          const userData = await dispatch("getUserById", {
            id: doc.data().userId
          });
          data.push({ ...doc.data(), user: userData });
          return userData;
        });

        await Promise.all(promises);
      })
      .then(() => {
        commit("setLastTests", data);
        commit("setLoading", false);
      })
      .catch(error => {
        commit("setLoading", false);
        const errorModel = showErrorMessage("load", "Quizzes", error.message);
        commit("setError", { message: errorModel });
        createErrorLog("Last Tests Loading", error.message, {
          payload
        });
      });
  },
  /**
   * Adds a question name to all automatic quizzes according
   * to the given subject in case it does not contains the
   * given question name.
   *
   * @param {Store<TestsState>} store the vuex store.
   * @param {Object} payload the action payload.
   * @param {string} payload.subject the subject to be searched.
   * @param {Question} payload.question the question data to be checked.
   * @returns {Test[]} an array that contains all quizzes found.
   */
  async addQuestionQuizzesBySubject({ commit }, payload) {
    commit("setLoading", true);

    try {
      const snapshot = await db
        .collection("tests")
        .where("type", "==", "auto")
        .where("subjects", "array-contains", payload.subject)
        .get();

      const promises = snapshot.docs.map(async doc => {
        /**
         * @type {Test}
         */
        const data = doc.data();

        if (
          data.questionsNames.includes(payload.question.name) ||
          payload.question.level.index > data.level.index
        ) {
          return;
        }

        data.questionsNames.push(payload.question.name);

        return await doc.ref.update({ questionsNames: data.questionsNames });
      });

      await Promise.all(promises);
    } catch (error) {
      const errorModel = showErrorMessage("edition", "Quiz", error.message);

      commit("setError", { message: errorModel });
      createErrorLog("Add Question Auto Quiz by Subject", error.message, {
        payload
      });
    } finally {
      commit("setLoading", false);
    }
  },
  /**
   * Gets a quiz by its ID from the state or Firebase.
   *
   * @param {Store<TestsState>} store the vuex store.
   * @param {string} payload the quiz id.
   * @returns {Test} an object that represents the quiz data.
   */
  async getTestById({ commit, getters }, payload) {
    commit("setLoading", true);

    const stateTest = getters.findTestById(payload);

    if (stateTest) {
      return stateTest;
    }

    try {
      const snapshot = await db
        .collection("tests")
        .where("id", "==", payload)
        .get();

      if (snapshot.empty) {
        return null;
      }
      return snapshot.docs[0].data();
    } catch (e) {
      const errorModel = showErrorMessage("load", "Quiz", error.message);

      commit("setError", { message: errorModel });
      createErrorLog("Load Test By ID", error.message, {
        stateTest
      });
    } finally {
      commit("setLoading", false);
    }
  },
  /**
   * Resets the tests state to it's initial state.
   *
   * @param {Store} store - The vuex store.
   */
  resetTests({ commit }) {
    commit("RESETTests");
  }
};

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
    return [...state.lastTests].sort((t1, t2) =>
      t1.updated > t2.updated ? -1 : 1
    );
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
    return state.tests["p" + page];
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
        if (question.subject === subject) counter++;
      });
      return counter;
    };
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
        for (let key in state.tests) {
          test = state.tests[key].find(t => t.id == id);
        }
      }

      return test;
    };
  }
};

export default {
  state,
  mutations,
  actions,
  getters
};
