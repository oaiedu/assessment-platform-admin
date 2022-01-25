import { Store } from "vuex";

import { db } from "../../main";
import { createErrorLog, showErrorMessage } from "../../utils/errors";
import { getWeekInterval } from "../../utils/date";

/**
 * @typedef {Object} DataSize
 * @property {Object} question-requests - The question requests amount object.
 * @property {number} question-requests.general - The question requests total amount.
 * @property {Object.<string, number>} question-requests.users - The question requests amount by user.
 * @property {Object} questions - The questions amount object.
 * @property {number} questions.general - The questions total amount.
 * @property {Object.<string, number>} questions.subject - The questions amount by subject.
 * @property {number} tests - The amount of tests.
 * @property {Object.<string, number>} testsByWeek - The tests amount by week (5 weeks).
 * @property {number} users - The amount of users.
 */

/**
 * @typedef {Object} DataSizeState
 * @property {DataSize|null} dataSize - The data size object.
 */

/**
 * @typedef {import('./tests.store.js').Test} Test
 */

/**
 * Gets the initial state for data size store.
 *
 * @returns {DataSizeState} The initial data size state object.
 */
const initialState = () => ({
  dataSize: null
});

const state = initialState();

const mutations = {
  /**
   * Sets the data size object.
   *
   * @param {DataSizeState} state - The data size state.
   * @param {DataSize} data - The data size object.
   */
  setDataSize(state, data) {
    state.dataSize = data;
  },
  /**
   * Sets a data to a determined key in data size.
   *
   * @param {DataSizeState} state - The data size state.
   * @param {Object} data - Object with the data size key and data to be set.
   * @param {string} data.key - The data size key.
   * @param {number|Object} data.data - The data to be setted.
   */
  addRemoveSize(state, data) {
    state.dataSize[data.key] = data.data;
  },
  /**
   * Resets tha data size state to it's initial state.
   *
   * @param {DataSizeState} state - The data size state.
   */
  RESETDataSize(state) {
    const newState = initialState();
    Object.keys(newState).forEach(key => {
      state[key] = newState[key];
    });
  }
};

const actions = {
  /**
   * Loads the data size from Firebase.
   *
   * @param {Store} store - The vuex store.
   */
  loadDataSize({ commit }) {
    commit("setLoading", true);

    const data = {};

    db.collection("data-size")
      .get()
      .then(snapshot => {
        const doc = snapshot.docs[0];

        for (let key in doc.data()) {
          data[key] = doc.data()[key];
        }
      })
      .then(() => {
        commit("setDataSize", data);
        commit("setLoading", false);
      })
      .catch(error => {
        commit("setLoading", false);
        const errorModel = showErrorMessage("load", "Data Size", error.message);
        commit("setError", { message: errorModel });
        createErrorLog("Data Size Load", error.message, { data });
      });
  },
  /**
   * Adds one to data size tests by week key into the current week.
   *
   * @param {Store} store - The vuex store.
   */
  addTestsByWeek({ commit, state }) {
    const thisWeek = getWeekInterval(new Date())[0];

    let data = { ...state.dataSize.testsByWeek };

    const lastWeeks = Object.keys(data);

    if (lastWeeks.includes(thisWeek)) {
      data[thisWeek] += 1;
    } else {
      const numberOfWeeks = 5;
      const today = new Date();

      let newData = {};

      for (let i = numberOfWeeks - 1; i > 0; i--) {
        const week = new Date(today);
        week.setDate(week.getDate() - i * 7);
        const currentWeek = getWeekInterval(week)[0];

        if (lastWeeks.includes(currentWeek)) {
          newData[currentWeek] = data[currentWeek];
        } else {
          newData[currentWeek] = 0;
        }
      }

      data = { ...newData, [thisWeek]: 1 };
    }

    db.collection("data-size")
      .get()
      .then(snapshot => {
        const doc = snapshot.docs[0];
        if (doc) {
          doc.ref.update({ testsByWeek: data });
        }
      })
      .then(() => {
        commit("addRemoveSize", { key: "testsByWeek", data });
      })
      .catch(error => {
        const errorModel = showErrorMessage(
          "edition",
          "Data Size",
          error.message
        );
        commit("setError", { message: errorModel });
        createErrorLog("Data Size Update", error.message, { data });
      });
  },
  /**
   * Removes of data size tests by week key according to the tests into the given payload.
   *
   * @param {Store} store - The vuex store.
   * @param {Object} payload - The payload of the action.
   * @param {Test[]} payload.tests - The tests that will be removed.
   */
  async removeTestsByWeek({ commit, state }, payload) {
    const { tests } = payload;

    let data = { ...state.dataSize.testsByWeek };

    const lastWeeks = Object.keys(data);

    const promises = tests.map(test => {
      const date = test.created;
      const year = date.substr(0, 4);
      const month = date.substr(5, 2);
      const day = date.substr(8, 2);

      const removeWeek = getWeekInterval(new Date(`${year}/${month}/${day}`))[
        [0]
      ];

      if (lastWeeks.includes(removeWeek)) {
        data[removeWeek] -= data[removeWeek] - 1 < 0 ? 0 : 1;
      }

      return removeWeek;
    });

    await Promise.all(promises);

    db.collection("data-size")
      .get()
      .then(snapshot => {
        const doc = snapshot.docs[0];
        if (doc) {
          doc.ref.update({ testsByWeek: data });
        }
      })
      .then(() => {
        commit("addRemoveSize", { key: "testsByWeek", data });
      })
      .catch(error => {
        const errorModel = showErrorMessage(
          "edition",
          "Data Size",
          error.message
        );
        commit("setError", { message: errorModel });
        createErrorLog("Data Size Update", error.message, { data });
      });
  },
  /**
   * Resets the data size state.
   *
   * @param {Store} store - The vuex store.
   */
  resetDataSize({ commit }) {
    commit("RESETDataSize");
  }
};

const getters = {
  /**
   * Gets the data size from state.
   *
   * @param {DataSizeState} state - The data size state.
   * @returns {DataSize} The data size object.
   */
  getDataSize(state) {
    return state.dataSize;
  },
  /**
   * Gets the number of questions of a specific subject.
   *
   * @constructor
   * @param {DataSizeState} state - The data size state.
   * @param {string} subjectName - The subject name.
   * @returns {(subjectName: string) => number} The number of questions of the given subject.
   */
  getNumberOfQuestionBySubject(state) {
    return subjectName => state.dataSize.questions.subject[subjectName] || 0;
  },
  /**
   * Gets a sorted object of data size tests by week key.
   *
   * @param {DataSizeState} state - The data size state.
   * @returns {Object.<string, number>} The sorted data size tests by week key.
   */
  getTestsByWeek(state) {
    return Object.fromEntries(
      Object.entries(state.dataSize.testsByWeek).sort((a, b) =>
        a[0] < b[0] ? -1 : 1
      )
    );
  },
  /**
   * Gets the interval of all weeks in data size tests by week key.
   *
   * @param {DataSizeState} state - The data size state.
   * @returns {string[]} The interval of all weeks in data size tests by week key.
   */
  getTestsByWeekInterval(state) {
    const intervals = [];
    Object.entries(state.dataSize.testsByWeek)
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .forEach(week => {
        const interval = getWeekInterval(
          new Date(
            `${week[0].substr(5, 2)}/${week[0].substr(8, 2)}/${week[0].substr(
              0,
              4
            )}`
          )
        );
        intervals.push(
          `${interval[0].substr(8, 2)}/${interval[0].substr(
            5,
            2
          )} - ${interval[1].substr(8, 2)}/${interval[1].substr(5, 2)}`
        );
      });
    return intervals;
  }
};

export default {
  state,
  mutations,
  actions,
  getters
};
