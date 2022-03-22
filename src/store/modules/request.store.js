import { Store } from "vuex";

import { analytics, db, storage } from "../../main";
import { createErrorLog, showErrorMessage } from "../../utils/errors";
import { getNowISOString } from "../../utils/date";

/**
 * @typedef {import('./questions.store.js').DeleteStatus} DeleteStatus
 * @typedef {import('./questions.store.js').Answer} Answer
 * @typedef {import('./questions.store.js').Subject} Subject
 * @typedef {"Rejeitado"|"Pendente"|"Aprovado"} RequestStatus
 */

/**
 * @typedef {Object} RequestCreation
 * @property {string} name The request name.
 * @property {string} userId The user that created the request.
 * @property {string} subject The request subject.
 * @property {string} question The request description.
 * @property {Level} level The request level.
 * @property {string} image The request image url.
 * @property {string} imageSize The size of the image.
 * @property {boolean} multipleAnswers Whether the request has multiple correct answers.
 * @property {Answer[]} answers The request answers.
 * @property {string} answerJustification The request answer general justification.
 * @property {string} answerJustificationSource The request answer justifications sources.
 * @property {RequestStatus} status The request status.
 */

/**
 * @typedef {Object} Request
 * @property {string} name The request name.
 * @property {string} userId The user that created the request.
 * @property {string} subject The request subject.
 * @property {string} question The request description.
 * @property {Level} level The request level.
 * @property {string} image The request image url.
 * @property {string} imageSize The size of the image.
 * @property {string|undefined} created The request creation date.
 * @property {string|undefined} updated The request edition date.
 * @property {boolean} multipleAnswers Whether the request has multiple correct answers.
 * @property {Answer[]} answers The request answers.
 * @property {string} answerJustification The request answer general justification.
 * @property {string} answerJustificationSource The request answer justifications sources.
 * @property {RequestStatus} status The request status.
 * @property {DeleteStatus|undefined} toDelete The request deletion status.
 */

/**
 * @typedef {Object} RequestState
 * @property {Object.<string, Request[]} requests - The pages with it's requests list.
 * @property {Request[]} filteredRequests - An array of requests filtered by name.
 * @property {Request[]} currentRequestsPage - An array of requests of the current page.
 * @property {[string, string]|null} lastRequestDocument - An array with the first and last test name from the last request.
 * @property {Request[]} deleteMarkRequests - An array of requests that were marked to be deleted.
 * @property {Request[]} lastPendentTests - An array of the most recent pending tests.
 * @property {Request[]} currentUserRequests - An array of the current user last pending requests.
 * @property {Request[]} otherUserRequests - An array of other users last pending requests.
 */

/**
 * Gets the initial state of the request state.
 *
 * @returns {RequestState} The initial state of the request state.
 */
const initialState = () => ({
  requests: {},
  filteredRequests: [],
  currentRequestsPage: [],
  lastRequestDocument: null,
  deleteMarkQuestions: [],
  lastPendentRequests: [],
  currentUserRequests: [],
  otherUserRequests: []
});

const state = initialState();

const mutations = {
  /**
   * Sets a page of requests according to the given data.
   *
   * @param {RequestState} state - The request state.
   * @param {Object} data - The data containing the page number and it's data.
   * @param {string} data.page - The page number.
   * @param {Request[]} data.data - An array of requests.
   */
  setRequestPage(state, data) {
    state.requests[data.page] = data.data;
  },
  /**
   * Sets the filtered requests.
   *
   * @param {RequestState} state - The request state.
   * @param {Request[]} data - An array of filtered requests.
   */
  setFilteredRequests(state, data) {
    state.filteredRequests = data;
  },
  /**
   * Cleans the filtered requests array.
   *
   * @param {RequestState} state - The request state.
   */
  resetFilteredRequests(state) {
    state.filteredRequests = [];
  },
  /**
   * Cleans the current requests page array.
   *
   * @param {RequestState} state - The request state.
   */
  resetCurrentRequestsPage(state) {
    state.currentRequestsPage = [];
  },
  /**
   * Sets the current requests page array.
   *
   * @param {RequestState} state - The request state.
   * @param {Request[]} data - An array of requests.
   */
  setCurrentRequestsPage(state, data) {
    state.currentRequestsPage = data;
  },
  /**
   * Sets the most recent pending requests.
   *
   * @param {RequestState} state - The request state.
   * @param {Request[]} data - An array of requests.
   */
  setLastPendentRequests(state, data) {
    state.lastPendentRequests = data;
  },
  /**
   * Sets the most recent pending requests from the current user.
   *
   * @param {RequestState} state - The request state.
   * @param {Request[]} data - An array of requests.
   */
  setCurrentUserRequests(state, data) {
    state.currentUserRequests = data;
  },
  /**
   * Sets the most recent pending requests from other users.
   *
   * @param {RequestState} state - The request state.
   * @param {Request[]} data - An array of requests.
   */
  setOtherUserRequests(state, data) {
    state.otherUserRequests = data;
  },
  /**
   * Adds a request to the array of requests marked to be deleted.
   *
   * @param {RequestState} state - The request state.
   * @param {Request} data - The request to be added.
   */
  addDeleteMarkRequest(state, data) {
    state.deleteMarkRequests.push(data);
  },
  /**
   * Updates a request that's into the array of requests marked to be deleted.
   *
   * @param {RequestState} state - The request state.
   * @param {Request} data - The request to be updated.
   */
  updateDeleteMarkRequest(state, data) {
    const requests = [...state.deleteMarkRequests];
    requests.forEach((item, index) => {
      if (item.name === data.name) {
        requests[index] = data;
      }
    });
    state.deleteMarkRequests = requests;
  },
  /**
   * Removes a request from the array of requests marked to be deleted.
   *
   * @param {RequestState} state - The request state.
   * @param {string} data - The name of the request to be removed.
   */
  removeDeleteMarkRequest(state, data) {
    const requests = [...state.deleteMarkRequests];
    requests.forEach((item, index) => {
      if (item.name === data) {
        state.deleteMarkRequests.splice(index, 1);
      }
    });
  },
  /**
   * Sets the array of requests marked to be deleted.
   *
   * @param {RequestState} state - The request state.
   * @param {Request[]} data - An array of requests.
   */
  setDeleteMarkRequests(state, data) {
    state.deleteMarkRequests = data;
  },
  /**
   * Sets a request as marked to be deleted.
   *
   * @param {RequestState} state - The request state.
   * @param {Object} data - The data containing the request name and it's deletion status.
   * @param {string} data.name - The request name.
   * @param {DeleteStatus} data.toDelete - The request deletion status.
   */
  setDeleteMarkRequest(state, data) {
    const requests = state.requests;
    for (let key in requests) {
      if (requests[key]) {
        requests[key].forEach((item, index) => {
          if (item.name === data.name) {
            state.requests[key][index] = {
              ...item,
              toDelete: data.toDelete
            };
          }
        });
      }
    }
  },
  /**
   * Sets a filtered request as marked to be deleted.
   *
   * @param {RequestState} state - The request state.
   * @param {Object} data - The data containing the request name and it's deletion status.
   * @param {string} data.name - The request name.
   * @param {DeleteStatus} data.toDelete - The request deletion status.
   */
  setDeleteMarkFilteredRequest(state, data) {
    const requests = [...state.filteredRequests];
    requests.forEach((item, index) => {
      if (item.name === data.name) {
        requests[index] = { ...item, toDelete: data.toDelete };
      }
    });
    state.filteredRequests = requests;
  },
  /**
   * Adds a request into the requests object, according to the given data.
   *
   * @param {RequestState} state - The request state.
   * @param {Object} data - The data containing the page number, requests amount and the data to be added.
   * @param {number} data.page - The page number.
   * @param {number} data.amount - The total amount of requests.
   * @param {Request} data.data - The request to be added.
   */
  addRequest(state, data) {
    const page = data.page;
    const requests = state.requests["p" + page] || [];
    const amount = data.amount;
    const oneBefore = state.requests["p" + (page - 1)] || [];
    if (requests.length > 0 || oneBefore.length === 8 || amount === 0) {
      requests.push(data.data);
      state.requests["p" + page] = [...requests];
      if (amount === 0 || state.currentRequestsPage.length < 8) {
        state.currentRequestsPage = [...state.currentRequestsPage, data.data];
      }
    }
  },
  /**
   * Updates a request.
   *
   * @param {RequestState} state - The request state.
   * @param {Request} data - The request to be updated.
   */
  updateRequest(state, data) {
    const requests = { ...state.requests };
    for (let key in requests) {
      if (requests[key]) {
        requests[key].forEach((item, index) => {
          if (item.name === data.name) {
            requests[key][index] = { ...data, user: item.user };
          }
        });
      }
    }
    state.requests = requests;
  },
  /**
   * Updates a request that's in the filtered requests array.
   *
   * @param {RequestState} state - The request state.
   * @param {Request} data - The request to be updated.
   */
  updateFilteredRequest(state, data) {
    const requests = [...state.filteredRequests];
    requests.forEach((item, index) => {
      if (item.name === data.name) {
        requests[index] = data;
      }
    });
    state.filteredRequests = requests;
  },
  /**
   * Updates a request that's in the current requests page array.
   *
   * @param {RequestState} state - The request state.
   * @param {Request} data - The request to be updated.
   */
  updateCurrentRequestsPage(state, data) {
    const requests = [...state.currentRequestsPage];
    requests.forEach((item, index) => {
      if (item.name === data.name) {
        requests[index] = data;
      }
    });
    state.currentRequestsPage = requests;
  },
  /**
   * Removes a request from the requests object.
   *
   * @param {RequestState} state - The request state.
   * @param {string} data - The name of the request to be removed.
   */
  removeRequest(state, data) {
    const requests = state.requests;
    for (let key in requests) {
      if (requests[key]) {
        requests[key].forEach((item, index) => {
          if (item.name === data) {
            state.requests[key].splice(index, 1);
          }
        });
      }
    }
  },
  /**
   * Removes a request from the filtered requests array.
   *
   * @param {RequestState} state - The request state.
   * @param {string} data The name of the request to be removed.
   */
  removeFilteredRequest(state, data) {
    const request = state.filteredRequests;
    request.forEach((item, index) => {
      if (item.name === data) {
        state.filteredRequests.splice(index, 1);
      }
    });
  },
  /**
   * Sets the last requests request ids.
   *
   * @param {RequestState} state - The request state.
   * @param {[string, string]} data An array of strings containing the first and last names from the last request.
   */
  setLastRequestDocument(state, data) {
    state.lastRequestDocument = data;
  },
  /**
   * Resets the request state to it's initial state.
   *
   * @param {RequestState} state - The request state.
   */
  RESETRequests(state) {
    const newState = initialState();
    Object.keys(newState).forEach(key => {
      state[key] = newState[key];
    });
  }
};

const actions = {
  /**
   * Creates a new request.
   *
   * @param {Store} store - The vuex store.
   * @param {Object} payload - The action payload.
   * @param {RequestCreation} payload.request - The request to be created.
   * @param {import('./user.store.js').UserInfo} payload.user - The current user info.
   */
  async createQuestionRequest({ commit }, payload) {
    commit("setLoading", true);

    const { user } = payload;

    const createdDate = getNowISOString();

    const request = {
      ...payload.request,
      created: createdDate,
      updated: createdDate
    };

    const requestAmount = this.getters.getDataSize["question-requests"].users[
      user.id
    ];

    const pageAmount = Math.ceil(requestAmount / 8);
    const amount = requestAmount % 8;

    try {
      await db.collection("question-requests").add(request);

      analytics.logEvent("create_request", {
        subject: request.subject,
        level: request.level.index,
        user: request.userId
      });

      commit("addRequest", {
        page: amount === 0 ? pageAmount + 1 : pageAmount,
        data: { ...request, user: user },
        amount: requestAmount
      });

      commit("setLoading", false);

      const sizeSnap = await db.collection("data-size").get();

      const document = sizeSnap.docs[0];
      const general = document.data()["question-requests"].general;
      const subSize = document.data()["question-requests"].users[user.id] || 0;

      const questionRequests = {
        general: general + 1,
        users: {
          ...document.data()["question-requests"].users,
          [user.id]: subSize + 1
        }
      };

      await document.ref.update({ ["question-requests"]: questionRequests });

      commit("addRemoveSize", {
        key: "question-requests",
        data: questionRequests
      });

      commit("setSuccess", "Solicitação criada com sucesso!");
    } catch (error) {
      const errorModel = showErrorMessage(
        "creation",
        "Solicitação",
        error.message
      );

      commit("setError", { message: errorModel });
      createErrorLog("Request DB Insert", error.message, {
        payload,
        requestAmount
      });
    } finally {
      commit("setLoading", false);
    }
  },
  /**
   * Updates a request based on it's name.
   *
   * @param {Store} store - The vuex store.
   * @param {Object} payload - The action payload.
   * @param {Request} payload.request - The request to be updated.
   * @param {RequestStatus|undefined} payload.status - The request new status.
   * @param {"reqUpdate"|"sttUpdate"} payload.mode - If reqUpdate, update all the request data. Otherwise, update only it's status.
   * @param {import('./user.store.js').UserInfo} payload.user - The request to be updated.
   */
  async updateQuestionRequest({ commit }, payload) {
    commit("setLoading", true);
    const { mode, request, user, isSearching } = payload;

    const toUpdate = {
      ...request,
      updated: getNowISOString()
    };

    try {
      const snapshot = await db
        .collection("question-requests")
        .where("name", "==", request.name)
        .get();

      if (mode === "sttUpdate") {
        await snapshot.docs[0].ref.update({
          status: payload.status,
          updated: toUpdate.updated
        });

        toUpdate.status = payload.status;
      } else {
        await snapshot.docs[0].ref.update(toUpdate);
      }

      commit("updateRequest", { ...toUpdate, user });
      commit("updateCurrentRequestsPage", {
        ...toUpdate,
        user
      });

      if (isSearching) {
        commit("updateFilteredRequest", {
          ...toUpdate,
          user
        });
      }

      if (mode !== "sttUpdate") {
        commit("setSuccess", "Solicitação editada com sucesso!");
      }
    } catch (error) {
      const errorModel = showErrorMessage(
        "edition",
        "Solicitação",
        error.message
      );

      commit("setError", { message: errorModel });
      createErrorLog("Request DB Update", error.message, { payload });
    } finally {
      commit("setLoading", false);
    }
  },
  /**
   * Loads a page of requests according to the payload data.
   *
   * @param {Store} store - The vuex store.
   * @param {Object} payload - The action payload.
   * @param {number} payload.page - The page number.
   * @param {number} payload.itemsPerPage - The amount of items per page.
   * @param {"next"|"previous"} payload.type - The data request type.
   * @param {import('./user.store.js').UserInfo} payload.userInfo - The current user info.
   * @param {import('./user.store.js').UserClaims} payload.claims - The current user claims.
   */
  loadRequestPage({ commit, dispatch, state }, payload) {
    commit("setLoading", true);

    const { claims, page, itemsPerPage, type, userInfo } = payload;
    const data = [];
    const pages = Object.keys(state.requests);

    if (!pages.includes("p" + page)) {
      let request = null;
      let ref = null;

      if (claims && claims["admin"]) {
        ref = db.collection("question-requests").orderBy("name");
      } else {
        ref = db
          .collection("question-requests")
          .orderBy("name")
          .where("userId", "==", userInfo.id);
      }

      if (type === "next") {
        request = ref
          .startAfter(state.lastRequestDocument[1])
          .limit(itemsPerPage)
          .get();
      } else {
        request = ref
          .endBefore(state.lastRequestDocument[0])
          .limitToLast(itemsPerPage)
          .get();
      }

      let first = null,
        last = null;

      request
        .then(async snapshot => {
          if (snapshot.docs.length > 0) {
            first = snapshot.docs[0].data().name;
            last = snapshot.docs[snapshot.docs.length - 1].data().name;

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
          commit("setCurrentRequestsPage", data);
          commit("setRequestPage", { page: "p" + page, data });
          commit("setLastRequestDocument", [first, last]);
          commit("setLoading", false);
        })
        .catch(error => {
          commit("setLoading", false);
          const errorModel = showErrorMessage(
            "load",
            "Solicitações",
            error.message
          );
          commit("setError", { message: errorModel });
          createErrorLog("Request Page Load", error.message, {
            payload,
            data
          });
        });
    } else {
      const pageContent = state.request["p" + page];
      const first = pageContent[0].name;
      const last = pageContent[pageContent.length - 1].name;

      commit("setCurrentRequestsPage", pageContent);
      commit("setLastRequestDocument", [first, last]);
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
   * @param {"first"|"last"} payload.mode - The data request mode.
   * @param {import('./user.store.js').UserInfo} payload.userInfo - The current user info.
   * @param {import('./user.store.js').UserClaims} payload.claims - The current user claims.
   */
  loadFOLRequestPage({ commit, dispatch, state }, payload) {
    commit("setLoading", true);

    const { claims, page, itemsPerPage, mode, userInfo } = payload;
    const data = [];
    const pages = Object.keys(state.requests);

    const requestAmount = this.getters.getDataSize["question-requests"].users[
      userInfo.id
    ];
    const amount = requestAmount % 8;

    if (!pages.includes("p" + page)) {
      let request = null;
      let ref = null;

      if (claims && claims["admin"]) {
        ref = db.collection("question-requests").orderBy("name");
      } else {
        ref = db
          .collection("question-requests")
          .orderBy("name")
          .where("userId", "==", userInfo.id);
      }

      if (mode === "first") {
        request = ref.limit(itemsPerPage).get();
      } else {
        request = ref.limitToLast(amount || 8).get();
      }

      let first = null,
        last = null;

      request
        .then(async snapshot => {
          if (snapshot.docs.length > 0) {
            first =
              snapshot.docs.length > 0 ? snapshot.docs[0].data().name : "";
            last =
              snapshot.docs.length > 0
                ? snapshot.docs[snapshot.docs.length - 1].data().name
                : "";

            const promises = snapshot.docs.map(async doc => {
              const userData = await dispatch("getUserById", {
                id: doc.data().userId
              });
              data.push({ ...doc.data(), user: userData });
              return userData;
            });

            await Promise.all(promises);

            commit("setCurrentRequestsPage", data);
            commit("setRequestPage", { page: "p" + page, data });
            commit("setLastRequestDocument", [first, last]);
          }
          commit("setLoading", false);
        })
        .catch(error => {
          commit("setLoading", false);
          const errorModel = showErrorMessage(
            "load",
            "Solicitações",
            error.message
          );
          commit("setError", { message: errorModel });
          createErrorLog("Request FOL Page Load", error.message, {
            payload,
            data,
            requestAmount
          });
        });
    } else {
      const pageContent = state.requests["p" + page];

      if (pageContent && pageContent[0]) {
        const first = pageContent[0].name;
        const last = pageContent[pageContent.length - 1].name;
        commit("setCurrentRequestsPage", pageContent);
        commit("setLastRequestDocument", [first, last]);
      }

      commit("setLoading", false);
    }
  },
  /**
   * Searches for requests based on their name.
   *
   * @param {Store} store - The vuex store.
   * @param {Object} payload - The action payload.
   * @param {string} payload.key - The string to be searched.
   * @param {import('./user.store.js').UserInfo} payload.userInfo - The current user info.
   * @param {import('./user.store.js').UserClaims} payload.claims - The current user claims.
   */
  searchRequests({ commit, dispatch }, payload) {
    commit("setLoading", true);

    const { claims, key, userInfo } = payload;
    const data = [];

    let req = db
      .collection("question-requests")
      .orderBy("name")
      .where("name", ">=", key.toUpperCase())
      .where("name", "<=", key.toUpperCase() + "~");

    if (claims && !claims["admin"]) {
      req = req.where("userId", "==", userInfo.id);
    }

    req
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
        commit("setFilteredRequests", data);
        commit("setLoading", false);
      })
      .catch(error => {
        commit("setLoading", false);
        const errorModel = showErrorMessage(
          "load",
          "Solicitações",
          "Searching error - " + error.message
        );
        commit("setError", { message: errorModel });
        createErrorLog("Request Searching", error.message, {
          payload,
          data
        });
      });
  },
  /**
   * Loads all requests that are marked to be deleted.
   *
   * @param {Store} store - The vuex store.
   */
  checkDeleteMarkRequests({ commit, dispatch }) {
    const data = [];

    db.collection("question-requests")
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
        commit("setDeleteMarkRequests", data);
      })
      .catch(error => {
        const errorModel = showErrorMessage("connection", "", error.message);
        commit("setError", { message: errorModel });
        createErrorLog("Request Mark Check", error.message, { data });
      });
  },
  /**
   * Marks a request to be deleted.
   *
   * @param {Store} store - The vuex store.
   * @param {Object} payload - The action payload.
   * @param {string} payload.name - The request name.
   * @param {boolean} payload.isSearching - Whether the application is using filtered requests or not.
   * @param {string} payload.userId - The current user id.
   */
  deleteMarkRequest({ commit, dispatch }, payload) {
    commit("setLoading", true);

    const { name, isSearching, userId } = payload;

    db.collection("question-requests")
      .where("name", "==", name)
      .get()
      .then(async snapshot => {
        const doc = snapshot.docs[0];

        const toDelete = {
          status: true,
          userId
        };

        doc.ref.update({ toDelete });

        const user = await dispatch("getUserById", {
          id: doc.data().userId
        });

        commit("setDeleteMarkRequest", { name, toDelete, user });

        if (isSearching) {
          commit("setDeleteMarkFilteredRequest", {
            name,
            toDelete,
            user
          });
        }

        commit("updateCurrentRequestsPage", {
          ...doc.data(),
          toDelete,
          user
        });
        commit("addDeleteMarkRequest", {
          ...doc.data(),
          toDelete,
          user
        });
        commit("setLoading", false);
      })
      .catch(error => {
        commit("setLoading", false);
        const errorModel = showErrorMessage("connection", "", error.message);
        commit("setError", { message: errorModel });
        createErrorLog("Request Delete Mark", error.message, {
          payload
        });
      });
  },
  /**
   * Restores a request from being marked to be deleted.
   *
   * @param {Store} store - The vuex store.
   * @param {Object} payload - The action payload.
   * @param {string} payload.name - The request name.
   * @param {boolean} payload.isSearching - Whether the application is using filtered requests or not.
   */
  restoreMarkedRequest({ commit, dispatch }, payload) {
    commit("setLoading", true);

    const { name, isSearching } = payload;
    let docData = null;

    db.collection("question-requests")
      .where("name", "==", name)
      .get()
      .then(async snapshot => {
        const doc = snapshot.docs[0];
        const data = doc.data();
        docData = data;

        /**
         * @type {Request}
         */
        const request = {
          created: data.created,
          image: data.image,
          imageSize: data.imageSize,
          name: data.name,
          question: data.question,
          level: data.level,
          multipleAnswers: data.multipleAnswers,
          answers: data.answers,
          answerJustification: data.answerJustification,
          answerJustificationSource: data.answerJustificationSource,
          status: data.status,
          subject: data.subject,
          updated: data.updated,
          userId: data.userId
        };

        const user = await dispatch("getUserById", {
          id: doc.data().userId
        });

        doc.ref.set(request);
        commit("updateRequest", { ...request, user });

        if (isSearching) {
          commit("updateFilteredRequest", { ...request, user });
        }

        commit("removeDeleteMarkRequest", name);
        commit("updateCurrentRequestsPage", { ...request, user });
        commit("setLoading", false);
        commit("setSuccess", "Solicitação restaurada com sucesso!");
      })
      .catch(error => {
        commit("setLoading", false);
        const errorModel = showErrorMessage("connection", "", error.message);
        commit("setError", { message: errorModel });
        createErrorLog("Request Restore", error.message, {
          payload,
          docData
        });
      });
  },
  /**
   * Restores all requests that are marked to be deleted.
   *
   * @param {Store} store - The vuex store.
   * @param {Object} payload - The action payload.
   * @param {boolean} payload.isSearching - Whether the application is using filtered requests or not.
   * @param {import('./user.store.js').UserInfo} payload.user - The current user info.
   */
  restoreAllMarkedRequests({ commit, state }, payload) {
    commit("setLoading", true);

    const { isSearching, user } = payload;
    let docData = null;

    db.collection("question-requests")
      .where("toDelete.status", "==", true)
      .where("toDelete.userId", "==", user.id)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          const data = doc.data();
          docData = data;

          /**
           * @type {Request}
           */
          const request = {
            created: data.created,
            image: data.image,
            imageSize: data.imageSize,
            name: data.name,
            question: data.question,
            level: data.level,
            multipleAnswers: data.multipleAnswers,
            answers: data.answers,
            answerJustification: data.answerJustification,
            answerJustificationSource: data.answerJustificationSource,
            status: data.status,
            subject: data.subject,
            updated: data.updated,
            userId: data.userId
          };

          doc.ref.set(request);
          const falseMarkedRequests = state.deleteMarkRequests.filter(
            q => !q.toDelete.status
          );
          commit("setDeleteMarkRequests", falseMarkedRequests);
          commit("updateRequest", { ...request, user });
          commit("updateCurrentRequestsPage", { ...request, user });
          if (isSearching)
            commit("updateFilteredRequest", { ...request, user });
          commit("setSuccess", "Solicitações restauradas com sucesso!");
        });
      })
      .then(() => commit("setLoading", false))
      .catch(error => {
        commit("setLoading", false);
        const errorModel = showErrorMessage("connection", "", error.message);
        commit("setError", { message: errorModel });
        createErrorLog("Request Restore All", error.message, {
          payload,
          docData
        });
      });
  },
  /**
   * Changes a request's delete status to false (confirmed deletion).
   *
   * @param {Store} store - The vuex store.
   * @param {Object} payload - The action payload.
   * @param {string} payload.name - The request name.
   * @param {boolean} payload.isSearching - Whether the application is using filtered requests or not.
   */
  changeDeleteStatusRequests({ commit, dispatch }, payload) {
    commit("setLoading", true);
    const { name, isSearching } = payload;

    db.collection("question-requests")
      .where("name", "==", name)
      .get()
      .then(async snapshot => {
        const doc = snapshot.docs[0];
        const toDelete = {
          status: false
        };

        doc.ref.update({ ...doc.data(), toDelete: { status: false } });

        const user = await dispatch("getUserById", {
          id: doc.data().userId
        });

        commit("updateCurrentRequestsPage", {
          ...doc.data(),
          toDelete,
          user
        });
        commit("updateRequest", { ...doc.data(), toDelete, user });
        commit("updateDeleteMarkRequest", {
          ...doc.data(),
          toDelete,
          user
        });
        if (isSearching)
          commit("updateFilteredRequest", {
            ...doc.data(),
            toDelete,
            user
          });

        commit("setLoading", false);
        commit("setSuccess", "Solicitação excluída com sucesso!");
      })
      .catch(error => {
        const errorModel = showErrorMessage(
          "exclusion",
          "Solicitação",
          error.message
        );
        commit("setError", { message: errorModel });
        createErrorLog("Request Confirm Delete", error.message, {
          payload
        });
      });
  },
  /**
   * Deletes all requests that are marked to be deleted (toDelete.status = false).
   *
   * @param {Store} store - The vuex store.
   */
  deleteRequests({ commit }) {
    const data = [];

    db.collection("question-requests")
      .where("toDelete.status", "==", false)
      .get()
      .then(snapshot => {
        const users = {};
        snapshot.forEach(doc => {
          doc.ref.delete();
          data.push(doc.data());
          if (doc.data().image && doc.data().image.length > 0) {
            const image = doc.data().image;
            const childImage = image.split("?alt=media")[0].split("/o/")[1];
            const child = decodeURIComponent(childImage);
            storage
              .ref()
              .child(child)
              .delete();
          }
          if (users[doc.data().userId]) {
            users[doc.data().userId] += 1;
          } else {
            users[doc.data().userId] = 1;
          }
        });

        db.collection("data-size")
          .get()
          .then(snap => {
            const document = snap.docs[0];
            const general = document.data()["question-requests"].general;

            const questionRequests = {
              general: general - snapshot.docs.length,
              users: {
                ...document.data()["question-requests"].users
              }
            };

            for (let key in users) {
              questionRequests.users[key] -= users[key];
            }

            document.ref
              .update({ ["question-requests"]: questionRequests })
              .then(() => {
                commit("addRemoveSize", {
                  key: "question-requests",
                  data: questionRequests
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
        console.error("Error removing request: ", error);
        createErrorLog("Request DB Delete", error.message, { data });
      });
  },
  /**
   * Deletes all approved request from a user.
   *
   * @param {Store} store - The vuex store.
   * @param {Object} payload - The action payload.
   * @param {import('./user.store.js').UserInfo} payload.userInfo - The current user info.
   */
  deleteApprovedRequests({ commit }, payload) {
    const { userInfo } = payload;

    db.collection("question-requests")
      .where("userId", "==", userInfo.id)
      .where("status", "==", "Aprovado")
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          doc.ref.delete();
          commit("removeRequest", doc.data().name);
        });

        db.collection("data-size")
          .get()
          .then(snap => {
            const document = snap.docs[0];
            const general = document.data()["question-requests"].general;
            const userId = userInfo.id;
            const subSize = document.data()["question-requests"].users[userId];

            const questionRequests = {
              general: general - snapshot.docs.length,
              users: {
                ...document.data()["question-requests"].users,
                [userId]: subSize - snapshot.docs.length
              }
            };

            document.ref
              .update({ ["question-requests"]: questionRequests })
              .then(() => {
                commit("addRemoveSize", {
                  key: "question-requests",
                  data: questionRequests
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
        commit("setLoading", false);
        const errorModel = showErrorMessage(
          "connection",
          "",
          "Requests auto delete error - " + error.message
        );
        commit("setError", { message: errorModel });
        createErrorLog("Request Approved Delete", error.message, {
          payload
        });
      });
  },
  /**
   * Loads the most recent pending requests.
   *
   * @param {Store} store - The vuex store.
   * @param {Object} payload - The action payload.
   * @param {number} payload.limit - The limit of requests on the response.
   */
  loadLastPendentRequests({ commit, dispatch }, payload) {
    commit("setLoading", true);

    const data = [];

    db.collection("question-requests")
      .orderBy("updated", "desc")
      .where("status", "==", "Pendente")
      .limit(payload ? payload.limit : 5)
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
        commit("setLastPendentRequests", data);
        commit("setLoading", false);
      })
      .catch(error => {
        commit("setLoading", false);
        const errorModel = showErrorMessage(
          "load",
          "Solicitações Pendentes",
          error.message
        );
        commit("setError", { message: errorModel });
        createErrorLog("Pendent Requests Loading", error.message, {
          payload
        });
      });
  },
  /**
   * Loads the most recent pending requests.
   *
   * @param {Store} store - The vuex store.
   * @param {Object} payload - The action payload.
   * @param {number} payload.limit - The limit of requests on the response.
   * @param {string} payload.userId - The current user id.
   * @param {"current"|"other"} payload.mode - The data request mode.
   */
  loadUserRequests({ commit, dispatch }, payload) {
    commit("setLoading", true);

    const { userId, mode, limit } = payload;

    const data = [];

    const reference = db.collection("question-requests");

    let request = null;

    if (mode === "other") {
      request = reference
        .orderBy("userId")
        .orderBy("updated", "desc")
        .where("userId", "!=", userId);
    } else {
      request = reference
        .orderBy("updated", "desc")
        .where("userId", "==", userId);
    }

    request
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
        if (mode === "other") {
          commit("setOtherUserRequests", data);
        } else {
          commit("setCurrentUserRequests", data);
        }
        commit("setLoading", false);
      })
      .catch(error => {
        commit("setLoading", false);
        const errorModel = showErrorMessage(
          "load",
          mode === "other"
            ? "Solicitações Pendentes"
            : "Solicitações do Usuário",
          error.message
        );
        commit("setError", { message: errorModel });
        createErrorLog("Pendent User Requests Load", error.message, {
          payload
        });
      });
  },
  /**
   * Resets the request state to it's initial state.
   *
   * @param {Store} store - The vuex store.
   */
  resetRequests({ commit }) {
    commit("RESETRequests");
  }
};

const getters = {
  /**
   * Gets an array of requests that were marked to be deleted.
   *
   * @param {RequestState} state - The requests state.
   * @returns {Request[]} An array of requests.
   */
  getDeleteMarkRequests(state) {
    return state.deleteMarkRequests;
  },
  /**
   * Gets an array of requests of the given page.
   *
   * @param {RequestState} state - The request state.
   * @param {number} page - The page number.
   * @returns {(page: number) => Request[]} An array of requests.
   */
  getRequestsByPage(state) {
    return page => state.requests["p" + page];
  },
  /**
   * Gets an array of the current page requests.
   *
   * @param {RequestState} state - The request state.
   * @returns {Request[]} An array of requests.
   */
  getCurrentRequestsPage(state) {
    return state.currentRequestsPage;
  },
  /**
   * Gets an array of the filtered requests.
   *
   * @param {RequestState} state - The request state.
   * @returns {Request[]} An array of requests.
   */
  getFilteredRequests(state) {
    return state.filteredRequests;
  },
  /**
   * Gets the most recent pending requests.
   *
   * @param {RequestState} state - The request state.
   * @returns {Request[]} An array of requests.
   */
  getLastPendentRequests(state) {
    return state.lastPendentRequests;
  },
  /**
   * Gets the most recent pending requests from the current user.
   *
   * @param {RequestState} state - The request state.
   * @returns {Request[]} An array of requests.
   */
  getCurrentUserRequests(state) {
    return state.currentUserRequests;
  },
  /**
   * Gets the most recent pending requests from other users.
   *
   * @param {RequestState} state - The request state.
   * @returns {Request[]} An array of requests.
   */
  getOtherUserRequests(state) {
    return state.otherUserRequests;
  }
};

export default {
  state,
  mutations,
  actions,
  getters
};
