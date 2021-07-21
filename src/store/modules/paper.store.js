import { Store } from "vuex";

import { db, storage } from "../../main";
import { getNowISOString } from "../../utils/date";
import { createErrorLog, showErrorMessage } from "../../utils/errors";

/**
 * @typedef {Object} DeleteStatus
 * @property {boolean} toDelete.status - If true, the paper can be restored. If false, it will be deleted.
 * @property {string|undefined} toDelete.userEmail - The user that marked the paper to be deleted.
 */

/**
 * @typedef {Object} PaperCreation
 * @property {string} id - The paper id.
 * @property {string} name - The paper name.
 * @property {string} description - The paper description.
 * @property {string} image - The paper image.
 * @property {string} userId - The user that created the paper.
 * @property {null} editedBy - The last user that edited the paper.
 */

/**
 * @typedef {Object} Paper
 * @property {string} id - The paper id.
 * @property {string} name - The paper name.
 * @property {string} description - The paper description.
 * @property {string} image - The paper image.
 * @property {string} userId - The user that created the paper.
 * @property {string|null} editedBy - The last user that edited the paper.
 * @property {string} created - The paper creation date.
 * @property {string} updated - The paper edition date.
 * @property {DeleteStatus|undefined} toDelete - The paper deletion status.
 */

/**
 * @typedef {Object} PaperState
 * @property {Object.<string, Paper[]>} papers - The pages with it's paper list.
 * @property {Paper[]} filteredPapers - An array of papers filtered by name.
 * @property {Paper[]} currentPapersPage - A papers array of the current page.
 * @property {[string, string]|null} lastPaperDocument - An array with the first and last paper id from the last request.
 * @property {Paper[]} deleteMarkPapers - An array of papers that were marked to be deleted.
 * @property {Paper[]} lastPapers - An array of the most recent papers.
 */

/**
 * Gets the initial paper state.
 *
 * @returns {PaperState} - The initial state of paper store.
 */
const initialState = () => ({
    papers: {},
    filteredPapers: [],
    currentPapersPage: [],
    lastPaperDocument: null,
    deleteMarkPapers: [],
    lastPapers: []
});

const state = initialState();

const mutations = {
    /**
     * Sets a page of papers according to the given data.
     *
     * @param {PaperState} state - The paper state.
     * @param {Object} data - The data containing the page number and it's data.
     * @param {string} data.page - The page number.
     * @param {Paper[]} data.data - An array of papers.
     */
    setPaperPage(state, data) {
        state.papers[data.page] = data.data;
    },
    /**
     * Sets the filtered papers.
     *
     * @param {PaperState} state - The paper state.
     * @param {Paper[]} data - An array of filtered papers.
     */
    setFilteredPapers(state, data) {
        state.filteredPapers = data;
    },
    /**
     * Sets the most recent papers.
     *
     * @param {PaperState} state - The paper state.
     * @param {Paper[]} data - An array of papers.
     */
    setLastPapers(state, data) {
        state.lastPapers = data;
    },
    /**
     * Cleans the filtered papers array.
     *
     * @param {PaperState} state - The paper state.
     */
    resetFilteredPapers(state) {
        state.filteredPapers = [];
    },
    /**
     * Cleans the current papers page array.
     *
     * @param {PaperState} state - The paper state.
     */
    resetCurrentPapersPage(state) {
        state.currentPapersPage = [];
    },
    /**
     * Sets the current papers page.
     *
     * @param {PaperState} state - The paper state.
     * @param {Paper[]} data - An array of papers.
     */
    setCurrentPapersPage(state, data) {
        state.currentPapersPage = data;
    },
    /**
     * Adds a paper to the array of papers marked to be deleted.
     *
     * @param {PaperState} state - The paper state.
     * @param {Paper} data - The paper to be added.
     */
    addDeleteMarkPaper(state, data) {
        state.deleteMarkPapers.push(data);
    },
    /**
     * Updates a paper that's into the array of papers marked to be deleted.
     *
     * @param {PaperState} state - The paper state.
     * @param {Paper} data - The paper to be updated.
     */
    updateDeleteMarkPaper(state, data) {
        const papers = [...state.deleteMarkPapers];
        papers.forEach((item, index) => {
            if (item.id === data.id) {
                papers[index] = data;
            }
        });
        state.deleteMarkPapers = papers;
    },
    /**
     * Removes a paper from the array of papers marked to be deleted.
     *
     * @param {PaperState} state - The paper state.
     * @param {string} data - The id of the paper to be removed.
     */
    removeDeleteMarkPaper(state, data) {
        const papers = [...state.deleteMarkPapers];
        papers.forEach((item, index) => {
            if (item.id === data) {
                state.deleteMarkPapers.splice(index, 1);
            }
        });
    },
    /**
     * Sets the array of papers marked to be deleted.
     *
     * @param {PaperState} state - The paper state.
     * @param {Paper[]} data - An array of papers.
     */
    setDeleteMarkPapers(state, data) {
        state.deleteMarkPapers = data;
    },
    /**
     * Sets a paper as marked to be deleted.
     *
     * @param {PaperState} state - The paper state.
     * @param {Object} data - The data containing the paper id and it's deletion status.
     * @param {string} data.id - The paper id.
     * @param {DeleteStatus} data.toDelete - The paper deletion status.
     */
    setDeleteMarkPaper(state, data) {
        const papers = state.papers;
        for (let key in papers) {
            if (papers[key]) {
                papers[key].forEach((item, index) => {
                    if (item.id === data.id) {
                        state.papers[key][index] = {
                            ...item,
                            toDelete: data.toDelete
                        };
                    }
                });
            }
        }
    },
    /**
     * Sets a filtered paper as marked to be deleted.
     *
     * @param {PaperState} state - The paper state.
     * @param {Object} data - The data containing the paper id and it's deletion status.
     * @param {string} data.id - The paper id.
     * @param {DeleteStatus} data.toDelete - The paper deletion status.
     */
    setDeleteMarkFilteredPaper(state, data) {
        const papers = [...state.filteredPapers];
        papers.forEach((item, index) => {
            if (item.id === data.id) {
                papers[index] = { ...item, toDelete: data.toDelete };
            }
        });
        state.filteredPapers = papers;
    },
    /**
     * Creates a paper into the papers object, according to the given data.
     *
     * @param {PaperState} state - The paper state.
     * @param {Object} data - The data containing the page number, papers amount and the data to be added.
     * @param {number} data.page - The page number.
     * @param {number} data.amount - The total amount of papers.
     * @param {Paper} data.data - The paper to be added.
     */
    createPaper(state, data) {
        const page = data.page;
        const papers = state.papers["p" + page] || [];
        const amount = data.amount;
        const oneBefore = state.papers["p" + (page - 1)] || [];
        if (papers.length > 0 || oneBefore.length === 10 || amount === 0) {
            papers.push(data.data);
            state.papers["p" + page] = [...papers];
            if (amount === 0 || state.currentPapersPage.length < 10) {
                state.currentPapersPage.push(data.data);
            }
        }
    },
    /**
     * Updates a paper.
     *
     * @param {PaperState} state - The paper state.
     * @param {Paper} data - The paper to be updated.
     */
    updatePaper(state, data) {
        const papers = { ...state.papers };
        for (let key in papers) {
            if (papers[key]) {
                papers[key].forEach((item, index) => {
                    if (item.id === data.id) {
                        papers[key][index] = data;
                    }
                });
            }
        }
        state.papers = papers;
    },
    /**
     * Updates a paper that's in the filtered papers array.
     *
     * @param {PaperState} state - The paper state.
     * @param {Paper} data - The paper to be updated.
     */
    updateFilteredPaper(state, data) {
        const papers = [...state.filteredPapers];
        papers.forEach((item, index) => {
            if (item.id === data.id) {
                papers[index] = data;
            }
        });
        state.filteredPapers = papers;
    },
    /**
     * Updates a paper that's in the current page array.
     *
     * @param {PaperState} state - The paper state.
     * @param {Paper} data - The paper to be updated.
     */
    updateCurrentPapersPage(state, data) {
        const papers = [...state.currentPapersPage];
        papers.forEach((item, index) => {
            if (item.id === data.id) {
                papers[index] = data;
            }
        });
        state.currentPapersPage = papers;
    },
    /**
     * Removes a paper from the papers object.
     *
     * @param {PaperState} state - The paper state.
     * @param {string} data - The id of the paper to be removed.
     */
    removePaper(state, data) {
        const papers = state.papers;
        for (let key in papers) {
            if (papers[key]) {
                papers[key].forEach((item, index) => {
                    if (item.id === data) {
                        state.papers[key].splice(index, 1);
                    }
                });
            }
        }
    },
    /**
     * Removes a paper from the filtered papers array.
     *
     * @param {PaperState} state - The paper state.
     * @param {string} data The id of the paper to be removed.
     */
    removeFilteredPaper(state, data) {
        const papers = state.filteredPapers;
        papers.forEach((item, index) => {
            if (item.id === data) {
                state.filteredPapers.splice(index, 1);
            }
        });
    },
    /**
     * Sets the last papers request ids.
     *
     * @param {PaperState} state - The paper state.
     * @param {[string, string]} data An array of strings containing the first and last ids from the last request.
     */
    setLastPaperDocument(state, data) {
        state.lastPaperDocument = data;
    },
    /**
     * Resets the paper state to it's initial state.
     *
     * @param {PaperState} state - The paper state.
     */
    RESETPapers(state) {
        const newState = initialState();
        Object.keys(newState).forEach(key => {
            state[key] = newState[key];
        });
    }
};

const actions = {
    /**
     * Uploads a paper image.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {File} payload.images - The image to be uploaded.
     * @param {string} payload.id - The paper id.
     * @returns {string} The image url.
     */
    uploadImagePaper({ commit }, payload) {
        const request = new Promise((resolve, reject) => {
            try {
                const storageRef = storage.ref();
                const file = payload.images;
                const paperId = payload.id;
                const type = file.type.split("/")[1];
                const format = `documents/document-$${paperId}.${type}`;
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
                        createErrorLog("Docs Image Upload", error.message, {
                            payload,
                            format
                        });
                    });
            } catch (error) {
                reject("Paper Image Upload Error");
            }
        });
        return request;
    },
    /**
     * Loads a page of papers according to the payload data.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {number} payload.page - The page number.
     * @param {number} payload.itemsPerPage - The amount of items per page.
     * @param {"next"|"previous"} payload.type - The request type.
     */
    loadPaperPage({ commit, dispatch, state }, payload) {
        commit("setLoading", true);

        const { page, itemsPerPage, type } = payload;
        const data = [];

        const pages = Object.keys(state.papers);

        if (!pages.includes("p" + page)) {
            let request = null;
            const ref = db.collection("papers").orderBy("id");

            if (type === "next") {
                request = ref
                    .startAfter(state.lastPaperDocument[1])
                    .limit(itemsPerPage)
                    .get();
            } else {
                request = ref
                    .endBefore(state.lastPaperDocument[0])
                    .limitToLast(itemsPerPage)
                    .get();
            }

            let first = null,
                last = null;

            request
                .then(async snapshot => {
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
                })
                .then(() => {
                    commit("setCurrentPapersPage", data);
                    commit("setPaperPage", { page: "p" + page, data });
                    commit("setLastPaperDocument", [first, last]);
                    commit("setLoading", false);
                })
                .catch(error => {
                    commit("setLoading", false);
                    const errorModel = showErrorMessage(
                        "load",
                        "Documentos",
                        error.message
                    );
                    commit("setError", { message: errorModel });
                    createErrorLog("Document Page Load", error.message, {
                        payload,
                        data
                    });
                });
        } else {
            const pageContent = state.papers["p" + page];
            const first = pageContent[0].id;
            const last = pageContent[pageContent.length - 1].id;

            commit("setCurrentPapersPage", pageContent);
            commit("setLastPaperDocument", [first, last]);
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
    loadFOLPaperPage({ commit, dispatch, state }, payload) {
        commit("setLoading", true);

        const { page, itemsPerPage, mode } = payload;
        const data = [];

        const pages = Object.keys(state.papers);

        const paperAmount = this.getters.getDataSize.papers;
        const amount = paperAmount % 10;

        if (!pages.includes("p" + page)) {
            let request = null;
            const ref = db.collection("papers").orderBy("id");

            if (mode === "first") {
                request = ref.limit(itemsPerPage).get();
            } else {
                request = ref.limitToLast(amount || 10).get();
            }

            let first = null,
                last = null;

            request
                .then(async snapshot => {
                    if (snapshot.docs.length > 0) {
                        first = snapshot.docs[0].data().id;
                        last = snapshot.docs[snapshot.docs.length - 1].data()
                            .id;

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
                        commit("setCurrentPapersPage", data);
                        commit("setPaperPage", { page: "p" + page, data });
                        commit("setLastPaperDocument", [first, last]);
                    }
                    commit("setLoading", false);
                })
                .catch(error => {
                    commit("setLoading", false);
                    const errorModel = showErrorMessage(
                        "load",
                        "Documentos",
                        error.message
                    );
                    commit("setError", { message: errorModel });
                    createErrorLog("Document FOL Page Load", error.message, {
                        payload,
                        data
                    });
                });
        } else {
            const pageContent = state.papers["p" + page];

            if (pageContent && pageContent[0]) {
                const first = pageContent[0].id;
                const last = pageContent[pageContent.length - 1].id;
                commit("setCurrentPapersPage", pageContent);
                commit("setLastPaperDocument", [first, last]);
            }
            commit("setLoading", false);
        }
    },
    /**
     * Searches for papers based on their name.
     *
     * @param {Store} store - The vuex store.
     * @param {string} payload - The string to be searched.
     */
    searchPapers({ commit, dispatch }, payload) {
        commit("setLoading", true);

        const data = [];

        db.collection("papers")
            .orderBy("name")
            .where("name", ">=", payload)
            .where("name", "<=", payload + "~")
            .get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    data.push(doc.data());
                });
            })
            .then(async () => {
                await db
                    .collection("papers")
                    .orderBy("name")
                    .where("name", ">=", payload.toUpperCase())
                    .where("name", "<=", payload.toUpperCase() + "~")
                    .get()
                    .then(snapshot => {
                        const ids = data.map(t => t.id);
                        snapshot.forEach(doc => {
                            if (!ids.includes(doc.data().id)) {
                                data.push(doc.data());
                            }
                        });
                    });
            })
            .then(async () => {
                await db
                    .collection("papers")
                    .orderBy("name")
                    .where("name", ">=", payload.toLowerCase())
                    .where("name", "<=", payload.toLowerCase() + "~")
                    .get()
                    .then(snapshot => {
                        const ids = data.map(t => t.id);
                        snapshot.forEach(doc => {
                            if (!ids.includes(doc.data().id)) {
                                data.push(doc.data());
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

                commit("setFilteredPapers", data);
                commit("setLoading", false);
            })
            .catch(error => {
                commit("setLoading", false);
                const errorModel = showErrorMessage(
                    "load",
                    "Documentos",
                    "Searching error - " + error.message
                );
                commit("setError", { message: errorModel });
                createErrorLog("Document Searching", error.message, {
                    payload,
                    data
                });
            });
    },
    /**
     * Checks if a paper with the given name exists.
     *
     * @param {Store} store - The vuex store.
     * @param {string} payload - The paper name.
     * @returns {Promise<{id: string|null, exist: boolean}>} An object containing the paper id and whether it exists or not.
     */
    async paperExists(store, payload) {
        return new Promise((resolve, reject) => {
            try {
                db.collection("papers")
                    .where("name", "==", payload)
                    .get()
                    .then(snapshot => {
                        if (snapshot.docs.length > 0)
                            resolve({
                                id: snapshot.docs[0].data().id,
                                exist: true
                            });
                        else resolve({ id: null, exist: false });
                    })
                    .catch(error => {
                        const errorModel = showErrorMessage(
                            "connection",
                            "",
                            error.message
                        );
                        commit("setError", { message: errorModel });
                        createErrorLog("Document Exist Test", error.message, {
                            payload
                        });
                    });
            } catch (error) {
                reject();
            }
        });
    },
    /**
     * Loads all papers that are marked to be deleted.
     *
     * @param {Store} store - The vuex store.
     */
    checkDeleteMarkPapers({ commit, dispatch }) {
        const data = [];

        db.collection("papers")
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
                commit("setDeleteMarkPapers", data);
            })
            .catch(error => {
                const errorModel = showErrorMessage(
                    "connection",
                    "",
                    error.message
                );
                commit("setError", { message: errorModel });
                createErrorLog("Document Mark Check", error.message, { data });
            });
    },
    /**
     * Marks a paper to be deleted.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {string} payload.id - The paper id.
     * @param {boolean} payload.isSearching - Whether the application is using filtered papers or not.
     * @param {string} payload.userEmail - The current user e-mail.
     */
    deleteMarkPaper({ commit, dispatch }, payload) {
        commit("setLoading", true);

        const { id, isSearching, userEmail } = payload;

        db.collection("papers")
            .where("id", "==", id)
            .get()
            .then(async snapshot => {
                const doc = snapshot.docs[0];

                const toDelete = {
                    status: true,
                    userEmail
                };

                doc.ref.update({ toDelete });

                const user = await dispatch("getUserById", {
                    id: doc.data().userId
                });

                commit("setDeleteMarkPaper", { id, toDelete });

                if (isSearching) {
                    commit("setDeleteMarkFilteredPaper", { id, toDelete });
                }

                commit("updateCurrentPapersPage", {
                    ...doc.data(),
                    toDelete,
                    user
                });
                commit("addDeleteMarkPaper", { ...doc.data(), toDelete, user });
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
                createErrorLog("Document Delete Mark", error.message, {
                    payload
                });
            });
    },
    /**
     * Restores a paper from being marked to be deleted.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {string} payload.id - The paper id.
     * @param {boolean} payload.isSearching - Whether the application is using filtered papers or not.
     */
    restoreMarkedPaper({ commit, dispatch }, payload) {
        commit("setLoading", true);

        const { id, isSearching } = payload;

        db.collection("papers")
            .where("id", "==", id)
            .get()
            .then(async snapshot => {
                const doc = snapshot.docs[0];
                const data = doc.data();

                /**
                 * @type {Paper}
                 */
                const paper = {
                    id: data.id,
                    image: data.image,
                    description: data.description,
                    name: data.name,
                    created: data.created,
                    updated: data.updated,
                    editedBy: data.editedBy || null,
                    userId: data.userId
                };

                doc.ref.set(paper);

                const user = await dispatch("getUserById", {
                    id: paper.userId
                });
                paper["user"] = user;

                commit("updatePaper", paper);

                if (isSearching) {
                    commit("updateFilteredPaper", paper);
                }

                commit("removeDeleteMarkPaper", id);
                commit("updateCurrentPapersPage", paper);
                commit("setLoading", false);
                commit("setSuccess", "Documento restaurado com sucesso!");
            })
            .catch(error => {
                commit("setLoading", false);
                const errorModel = showErrorMessage(
                    "connection",
                    "",
                    error.message
                );
                commit("setError", { message: errorModel });
                createErrorLog("Document Restore", error.message, { payload });
            });
    },
    /**
     * Restores all papers that are marked to be deleted from the database or the current user, depending on the given data.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {boolean} payload.all - Whether will restore all database papers or only from the current user.
     * @param {boolean} payload.isSearching - Whether the application is using filtered papers or not.
     * @param {import('./user.store.js').UserInfo} payload.user - The current user info.
     */
    restoreAllMarkedPapers({ commit, dispatch, state }, payload) {
        commit("setLoading", true);

        const { all, isSearching, user } = payload;

        const ref = db
            .collection("papers")
            .where("toDelete.status", "==", true);
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
                    const data = doc.data();

                    /**
                     * @type {Paper}
                     */
                    const paper = {
                        id: data.id,
                        image: data.image,
                        description: data.description,
                        name: data.name,
                        created: data.created,
                        updated: data.updated,
                        editedBy: data.editedBy || null,
                        userId: data.userId
                    };

                    doc.ref.set(paper);

                    const user = await dispatch("getUserById", {
                        id: paper.userId
                    });
                    paper["user"] = user;

                    if (all) {
                        const falseMarkedPapers = state.deleteMarkPapers.filter(
                            t => !t.toDelete.status
                        );
                        commit("setDeleteMarkPapers", falseMarkedPapers);
                    } else {
                        const markedPapers = state.deleteMarkPapers.filter(
                            t => t.id !== paper.id
                        );
                        commit("setDeleteMarkPapers", markedPapers);
                    }
                    commit("updatePaper", paper);
                    commit("updateCurrentPapersPage", paper);
                    if (isSearching) commit("updateFilteredPaper", paper);
                    commit("setSuccess", "Documentos restaurados com sucesso!");
                });
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
                createErrorLog("Document Restore All", error.message, {
                    payload
                });
            });
    },
    /**
     * Changes a paper's delete status to false (confirmed deletion).
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {string} payload.id - The paper id.
     * @param {boolean} payload.isSearching - Whether the application is using filtered papers or not.
     */
    changeDeleteStatusPapers({ commit, dispatch }, payload) {
        commit("setLoading", true);
        const { id, isSearching } = payload;

        db.collection("papers")
            .where("id", "==", id)
            .get()
            .then(async snapshot => {
                const doc = snapshot.docs[0];
                const toDelete = {
                    status: false
                };

                doc.ref.update({ ...doc.data(), toDelete });

                const user = await dispatch("getUserById", {
                    id: doc.data().userId
                });

                commit("updateCurrentPapersPage", {
                    ...doc.data(),
                    toDelete,
                    user
                });
                commit("updatePaper", { ...doc.data(), toDelete, user });
                commit("updateDeleteMarkPaper", {
                    ...doc.data(),
                    toDelete,
                    user
                });
                if (isSearching)
                    commit("updateFilteredPaper", {
                        ...doc.data(),
                        toDelete,
                        user
                    });

                commit("setLoading", false);
                commit("setSuccess", "Documento excluído com sucesso!");
            })
            .catch(error => {
                const errorModel = showErrorMessage(
                    "exclusion",
                    "Documento",
                    error.message
                );
                commit("setError", { message: errorModel });
                createErrorLog("Document Confirm Delete", error.message, {
                    payload
                });
            });
    },
    /**
     * Remove the names of papers from paper-names collection.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {string[]} payload.papers - An array of paper ids.
     */
    removePaperNames(store, payload) {
        const { papers } = payload;
        console.log(papers);

        db.collection("paper-names")
            .get()
            .then(async snapshot => {
                const paperNames = snapshot.docs[0];
                const dPapers = paperNames.data().papers;
                const newPapers = [];

                const promises = dPapers.map(p => {
                    if (!papers.includes(p.id)) {
                        newPapers.push(p);
                    }
                    return p;
                });

                await Promise.all(promises);

                paperNames.ref.update({ papers: newPapers });
            })
            .catch(error => {
                console.error(error);
            });
    },
    /**
     * Deletes all papers that are marked to be deleted (toDelete.status = false).
     *
     * @param {Store} store - The vuex store.
     */
    deletePapers({ commit }) {
        const data = [];
        db.collection("papers")
            .where("toDelete.status", "==", false)
            .get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    doc.ref.delete();
                    data.push(doc.data());
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
                        const size = document.data().papers;

                        document.ref.update({
                            papers: size - snapshot.docs.length
                        });
                        commit("addRemoveSize", {
                            key: "papers",
                            data: size - snapshot.docs.length
                        });
                    })
                    .catch(error => {
                        console.error(error);
                    });
            })
            .catch(error => {
                console.error("Error removing document: ", error);
                createErrorLog("Document DB Delete", error.message, { data });
            });
    },
    /**
     * Creates a new paper.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {PaperCreation} payload.paperData - The paper to be created.
     * @param {import('./user.store.js').UserInfo} payload.userInfo - The current user info.
     */
    createPaper({ commit }, payload) {
        commit("setLoading", true);

        const createdDate = getNowISOString();

        const { paperData, userInfo } = payload;

        const paper = {
            ...paperData,
            created: createdDate,
            updated: createdDate
        };

        const paperAmount = this.getters.getDataSize.papers;
        const pageAmount = Math.ceil(paperAmount / 10);
        const amount = paperAmount % 10;

        db.collection("papers")
            .add(paper)
            .then(async () => {
                commit("createPaper", {
                    page: amount === 0 ? pageAmount + 1 : pageAmount,
                    data: { ...paper, user: { ...userInfo } },
                    amount: paperAmount
                });
                commit("setLoading", false);

                db.collection("data-size")
                    .get()
                    .then(snap => {
                        const document = snap.docs[0];
                        const size = document.data().papers;

                        document.ref
                            .update({ papers: size + 1 })
                            .then(() => {
                                commit("addRemoveSize", {
                                    key: "papers",
                                    data: size + 1
                                });
                                commit(
                                    "setSuccess",
                                    "Documento criado com sucesso!"
                                );
                            })
                            .catch(error => {
                                console.error(error);
                            });
                    })
                    .catch(error => {
                        console.error(error);
                    });
            })
            .then(() => {
                db.collection("paper-names")
                    .get()
                    .then(snapshot => {
                        const doc = snapshot.docs[0];
                        const dPapers = doc.data().papers;

                        dPapers.push({ id: paper.id, name: paper.name });
                        doc.ref.update({ papers: dPapers });
                    })
                    .catch(error => {
                        console.error(error);
                    });
            })
            .catch(error => {
                commit("setLoading", false);
                const errorModel = showErrorMessage(
                    "creation",
                    "Document",
                    error.message
                );
                commit("setError", { message: errorModel });
                createErrorLog("Document DB Insert", error.message, {
                    payload
                });
            });
    },
    /**
     * Updates a paper based on it's id.
     *
     * @param {Store} store - The vuex store.
     * @param {Object} payload - The action payload.
     * @param {Paper} payload.paperData - The paper to be updated.
     * @param {boolean} payload.isSearching - Whether the filtered papers is being used or not.
     */
    updatePaper({ commit, dispatch }, payload) {
        const { paperData, isSearching } = payload;

        const paper = {
            ...paperData,
            updated: getNowISOString()
        };

        db.collection("papers")
            .where("id", "==", paper.id)
            .get()
            .then(async snapshot => {
                const doc = snapshot.docs[0];
                doc.ref.update(paper);

                db.collection("paper-names")
                    .get()
                    .then(snapNames => {
                        const docNames = snapNames.docs[0];
                        const dPapers = docNames.data().papers;
                        let newPapers = [...dPapers];

                        dPapers.forEach((p, i) => {
                            if (p.id === paper.id) {
                                newPapers[i] = {
                                    id: paper.id,
                                    name: paper.name
                                };
                            }
                        });

                        docNames.ref.update({ papers: newPapers });
                    })
                    .catch(error => {
                        console.error(error);
                    });

                const user = await dispatch("getUserById", {
                    id: doc.data().userId
                });
                paper["user"] = user;

                commit("updatePaper", paper);
                commit("updateCurrentPapersPage", paper);
                if (isSearching) commit("updateFilteredPaper", paper);

                commit("setLoading", false);
                commit("setSuccess", "Documento editado com sucesso!");
            })
            .catch(error => {
                commit("setLoading", false);
                const errorModel = showErrorMessage(
                    "edition",
                    "Document",
                    error.message
                );
                commit("setError", { message: errorModel });
                createErrorLog("Document DB Update", error.message, {
                    payload
                });
            });
    },
    /**
     * Gets all paper names.
     *
     * @param {Store} store - The vuex store.
     */
    async getPaperNames(store) {
        return new Promise((resolve, reject) => {
            try {
                db.collection("paper-names")
                    .get()
                    .then(snapshot => {
                        const data = snapshot.docs[0].data();
                        resolve(data.papers);
                    })
                    .catch(error => {
                        console.error(error);
                    });
            } catch (error) {
                reject("getPaperNames error");
            }
        });
    },
    /**
     * Gets a paper by it's id.
     *
     * @param {Store} store - The vuex store.
     * @param {string} payload - The paper id.
     */
    async getPaperById({ commit, dispatch }, payload) {
        const id = payload;

        return new Promise((resolve, reject) => {
            try {
                db.collection("papers")
                    .where("id", "==", id)
                    .get()
                    .then(async snapshot => {
                        const doc = snapshot.docs[0];

                        /**
                         * @type {Paper}
                         */
                        const paper = doc.data();

                        const user = await dispatch("getUserById", {
                            id: paper.userId
                        });
                        paper["user"] = user;

                        resolve(paper);
                    })
                    .catch(error => {
                        const errorModel = showErrorMessage(
                            "load",
                            "Documento",
                            error.message
                        );
                        commit("setError", { message: errorModel });
                        createErrorLog("Document ID Load", error.message, {
                            data
                        });
                    });
            } catch (error) {
                reject("getPaperById error");
            }
        });
    },
    /**
     * Loads the most recent papers.
     *
     * @param {Store} store - The vuex store.
     */
    loadLastPapers({ commit, dispatch }) {
        commit("setLoading", true);

        const data = [];

        db.collection("papers")
            .orderBy("updated", "desc")
            .limit(6)
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
                commit("setLastPapers", data);
                commit("setLoading", false);
            })
            .catch(error => {
                commit("setLoading", false);
                const errorModel = showErrorMessage(
                    "load",
                    "Documentos",
                    error.message
                );
                commit("setError", { message: errorModel });
                createErrorLog("Last Documents Loading", error.message, {
                    data
                });
            });
    },
    /**
     * Resets the paper state to it's initial state.
     *
     * @param {Store} store - The vuex store.
     */
    resetPapers({ commit }) {
        commit("RESETPapers");
    }
};

const getters = {
    /**
     * Gets an object with all loaded pages and it's papers.
     *
     * @param {PaperState} state - The paper state.
     * @returns {Object.<string, Paper[]>} The papers pages object.
     */
    getPapers(state) {
        return state.papers;
    },
    /**
     * Gets an array of papers that are marked to be deleted.
     *
     * @param {PaperState} state - The paper state.
     * @returns {Paper[]} An array of papers that are marked to be deleted.
     */
    getDeleteMarkPapers(state) {
        return state.deleteMarkPapers;
    },
    /**
     * Gets an array of papers of the given page.
     *
     * @param {PaperState} state - The paper state.
     * @param {number} page - The page number.
     * @returns {(page: number) => Paper[]} An array of papers.
     */
    getPapersByPage(state) {
        return page => state.papers["p" + page];
    },
    /**
     * Gets an array of the current page papers.
     *
     * @param {PaperState} state - The paper state.
     * @returns {Paper[]} An array of papers.
     */
    getCurrentPapersPage(state) {
        return state.currentPapersPage;
    },
    /**
     * Gets an array of filtered papers.
     *
     * @param {PaperState} state - The paper state.
     * @returns {Paper[]} An array of papers.
     */
    getFilteredPapers(state) {
        return state.filteredPapers;
    },
    /**
     * Gets the most recent papers.
     *
     * @param {PaperState} state - The paper state.
     * @returns {Paper[]} An array of papers.
     */
    getLastPapers(state) {
        return state.lastPapers;
    },
    /**
     * Gets a paper from the paper state based on it's id.
     *
     * @param {PaperState} state - The paper state.
     * @param {string} id - The paper id.
     * @returns {(id: string) => Paper|null} The paper or null if not found.
     */
    findPaperById(state) {
        return id => {
            let paper = null;

            paper = state.lastPapers.find(t => t.id == id);

            if (!paper) {
                for (let key in state.papers) {
                    paper = state.papers[key].find(t => t.id == id);
                }
            }

            return paper;
        };
    }
};

export default {
    state,
    mutations,
    actions,
    getters
};
