import { Store } from "vuex";
import { db } from "../../main";
import { createErrorLog, showErrorMessage } from "../../utils/errors";

/**
 * @typedef {Object} Subject
 * @property {string} id The subject id.
 * @property {string} name The subject name.
 * @property {string[]} questions All questions ids from the current subject.
 */

/**
 * @typedef {Object} SubjectState
 * @property {Subject[]} subjects An array of subjects.
 */

/**
 * Gets the initial state for subject store.
 *
 * @returns {SubjectState} The initial subject state object.
 */
const initialState = () => ({
  subjects: []
});

const state = initialState();

const mutations = {
  /**
   * Sets the subjects with the given data.
   *
   * @param {SubjectState} state - The subject state.
   * @param {Subject[]} data - The subjects to be set.
   */
  setSubjects(state, data) {
    state.subjects = data;
  },

  /**
   * Adds a subject to the state.
   *
   * @param {SubjectState} state The subject state.
   * @param {Subject} data The subject to be added.
   */
  addSubject(state, data) {
    const subjects = [...state.subjects];
    subjects.push(data);
    state.subjects = subjects;
  },

  /**
   * Adds/Removes a question from a subject.
   *
   * If the question already exists into the subject, it will
   * be removed, otherwise it will be added.
   *
   * @param {SubjectState} state The subject state.
   * @param {Object} data
   * @param {string} data.subjectId The subject id.
   * @param {string} data.questionId The question id.
   * @param {boolean} data.remove Whether the question will be removed.
   */
  addRemoveQuestion(state, data) {
    const subjects = [...state.subjects];
    const subjectIndex = subjects.findIndex(s => s.id === data.subjectId);

    if (!subjects[subjectIndex]) {
      return;
    }

    const index = subjects[subjectIndex].questions.findIndex(
      qid => qid === data.questionId
    );

    if (data.remove && index !== -1) {
      subjects[subjectIndex].questions.splice(index, 1);
    } else if (index === -1) {
      subjects[subjectIndex].questions.push(data.questionId);
    }

    subjects[subjectIndex].questions.sort((q1, q2) => (q1 < q2 ? -1 : 1));

    state.subjects = subjects;
  },

  /**
   * Removes a subject from the state by its id.
   *
   * @param {SubjectState} state The subject state.
   * @param {string} data The subject id.
   */
  removeSubject(state, data) {
    const subjects = [...state.subjects];
    const index = subjects.findIndex(s => s.id === data);

    if (index !== -1) {
      subjects.splice(index, 1);
      state.subjects = subjects;
    }
  },

  /**
   * Resets the subject state to it's initial state.
   *
   * @param {SubjectState} state - The subject state.
   */
  RESETSubject(state) {
    const newState = initialState();
    Object.keys(newState).forEach(key => {
      state[key] = newState[key];
    });
  }
};

const actions = {
  /**
   * Loads all subjects from Firebase.
   *
   * @param {Store} store The vuex store.
   */
  async loadSubjects({ commit }) {
    commit("setLoading", true);

    try {
      const data = [];
      const subjects = await db.collection("subjects").get();

      subjects.forEach(doc => {
        data.push({ ...doc.data(), id: doc.id });
      });

      commit("setSubjects", data);
    } catch (error) {
      const errorModel = showErrorMessage("load", "Assunto", error.message);
      commit("setError", { message: errorModel });
      createErrorLog("Subject Load", error.message, {
        data
      });
    } finally {
      commit("setLoading", false);
    }
  },

  /**
   * Creates a subject into the Firestore.
   *
   * @param {Store} store The vuex store.
   * @param {string} payload The subject name.
   */
  async createSubject({ commit }, payload) {
    commit("setLoading", true);

    try {
      const subject = {
        name: payload,
        questions: []
      };

      const doc = await db.collection("subjects").add(subject);
      commit("addSubject", { ...subject, id: doc.id });
      commit("setSuccess", "Assunto criado com sucesso!");
    } catch (error) {
      const errorModel = showErrorMessage("creation", "Assunto", error.message);
      commit("setError", { message: errorModel });
      createErrorLog("Subject Creation", error.message, {
        data
      });
    } finally {
      commit("setLoading", false);
    }
  },

  /**
   * Deletes a subject from the Firestore.
   *
   * @param {Store} store The vuex store.
   * @param {string} payload The subject id.
   */
  async deleteSubject({ commit }, payload) {
    commit("setLoading", true);

    try {
      await db
        .collection("subjects")
        .doc(payload)
        .delete();
      commit("removeSubject", payload);
      commit("setSuccess", "Assunto excluído com sucesso!");
    } catch (error) {
      const errorModel = showErrorMessage(
        "exclusion",
        "Assunto",
        error.message
      );
      commit("setError", { message: errorModel });
      createErrorLog("Subject Exclusion", error.message, {
        data
      });
    } finally {
      commit("setLoading", false);
    }
  },

  /**
   * Resets the subject state to it's initial state.
   *
   * @param {Store} store - The vuex store.
   */
  resetSubject({ commit }) {
    commit("RESETSubject");
  }
};

const getters = {
  /**
   * Get all questions ids from a subject according to its name.
   *
   * @param {SubjectState} state The subject state.
   * @returns {(name: string) => string[]} An array with all questions ids.
   */
  getSubjectQuestions: state => name => {
    const subject = state.subjects.find(subject => subject.name === name);
    return subject ? subject.questions : [];
  }
};

export default {
  state,
  mutations,
  actions,
  getters
};
