import { Store } from 'vuex'
import { DataSizeController } from '../../controllers/data-size.controller'
import { SubjectController } from '../../controllers/subject.controller'
import { SubjectEntity } from '../../entities/subject.entity'

import { createErrorLog, showErrorMessage } from '../../utils/errors'

/**
 * @typedef {Object} SubjectState
 * @property {SubjectEntity[]} subjects An array of subjects.
 */

/**
 * Defines the subject controller.
 */
const controller = new SubjectController()

/**
 * Defines the data size controller.
 */
const dsController = new DataSizeController()

/**
 * Gets the initial state for subject store.
 *
 * @returns {SubjectState} The initial subject state object.
 */
const initialState = () => ({
  subjects: [],
})

const state = initialState()

const mutations = {
  /**
   * Sets the subjects with the given data.
   *
   * @param {SubjectState} state - The subject state.
   * @param {SubjectEntity[]} data - The subjects to be set.
   */
  setSubjects(state, data) {
    state.subjects = data.map(subject => subject.clone())
  },

  /**
   * Adds a subject to the state.
   *
   * @param {SubjectState} state The subject state.
   * @param {SubjectEntity} data The subject to be added.
   */
  addSubject(state, data) {
    const subjects = [...state.subjects]
    subjects.push(data.clone())
    state.subjects = subjects
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
   * @param {number} data.questionLevel The question level index.
   * @param {boolean} data.remove Whether the question will be removed.
   */
  addRemoveQuestion(state, data) {
    const subjects = [...state.subjects]
    const subjectIndex = subjects.findIndex(s => s.id === data.subjectId)

    if (!subjects[subjectIndex]) {
      return
    }

    const index = subjects[subjectIndex].questions.findIndex(
      q => q.name === data.questionId,
    )

    if (data.remove && index !== -1) {
      subjects[subjectIndex].questions.splice(index, 1)
    } else if (index === -1) {
      subjects[subjectIndex].questions.push({
        name: data.questionId,
        level: data.questionLevel,
      })
    } else if (!data.remove && index !== -1) {
      subjects[subjectIndex].questions[index] = {
        name: data.questionId,
        level: data.questionLevel,
      }
    }

    subjects[subjectIndex].questions.sort((q1, q2) =>
      q1.name < q2.name ? -1 : 1,
    )

    state.subjects = subjects
  },

  /**
   * Removes a subject from the state by its id.
   *
   * @param {SubjectState} state The subject state.
   * @param {string} data The subject id.
   */
  removeSubject(state, data) {
    const subjects = [...state.subjects]
    const index = subjects.findIndex(s => s.id === data)

    if (index !== -1) {
      subjects.splice(index, 1)
      state.subjects = subjects
    }
  },

  /**
   * Resets the subject state to it's initial state.
   *
   * @param {SubjectState} state - The subject state.
   */
  RESETSubject(state) {
    const newState = initialState()
    Object.keys(newState).forEach(key => {
      state[key] = newState[key]
    })
  },
}

const actions = {
  /**
   * Loads all subjects from Firebase.
   *
   * @param {Store<SubjectState>} store The vuex store.
   */
  async loadSubjects({ commit }) {
    commit('setLoading', true)

    /**
     * @type {SubjectEntity[]}
     */
    let data = []

    try {
      data = await controller.getAll()

      commit('setSubjects', data)
    } catch (error) {
      const errorModel = showErrorMessage('load', 'Subject', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('Subject Load', error.message, {
        data,
      })
    } finally {
      commit('setLoading', false)
    }
  },

  /**
   * Creates a subject into the Firestore.
   *
   * @param {Store<SubjectState>} store The vuex store.
   * @param {string} payload The subject name.
   */
  async createSubject({ commit }, payload) {
    commit('setLoading', true)

    try {
      const subject = await controller.createOne({
        name: payload,
      })

      commit('addSubject', subject)
      commit('setSuccess', 'Subject successfully created!')
    } catch (error) {
      const errorModel = showErrorMessage('creation', 'Subject', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('Subject Creation', error.message, payload)
    } finally {
      commit('setLoading', false)
    }
  },

  /**
   * Deletes a subject from the Firestore.
   *
   * @param {Store<SubjectState>} store The vuex store.
   * @param {SubjectEntity} payload The subject data.
   */
  async deleteSubject({ commit }, payload) {
    commit('setLoading', true)

    const { id, name } = payload

    try {
      await controller.deleteOne(id)
      commit('removeSubject', id)

      const dataSize = await dsController.getOne()

      if (!dataSize) {
        return
      }

      delete dataSize.questions.subject[name]
      dsController.updateOne({ questions: dataSize.questions })

      commit('addRemoveSize', {
        key: 'questions',
        data: dataSize.questions,
      })

      commit('setSuccess', 'Subject successfully deleted!')
    } catch (error) {
      const errorModel = showErrorMessage('exclusion', 'Subject', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('Subject Exclusion', error.message, payload)
    } finally {
      commit('setLoading', false)
    }
  },

  /**
   * Gets all the questions names from a subject.
   *
   * @param {Store<TestsState>} store The vuex store.
   * @param {string} payload The subject name.
   * @returns An array of names.
   */
  async getSubjectQuestions({ commit }, payload) {
    try {
      const subject = await controller.getByName(payload)

      if (!subject) {
        return []
      }

      return subject.questions
    } catch (error) {
      const errorModel = showErrorMessage('load', 'IDs' + error.message)

      commit('setError', { message: errorModel })

      createErrorLog('Test Subject Names', error.message, payload)
    }
  },

  /**
   * Resets the subject state to it's initial state.
   *
   * @param {Store<SubjectState>} store - The vuex store.
   */
  resetSubject({ commit }) {
    commit('RESETSubject')
  },
}

const getters = {
  /**
   * Get all questions ids from a subject according to its name.
   *
   * @param {SubjectState} state The subject state.
   * @returns {(name: string) => string[]} An array with all questions ids.
   */
  getSubjectQuestions: state => name => {
    const subject = state.subjects.find(subject => subject.name === name)

    return subject ? subject.questions : []
  },
  /**
   * Gets the amount of questions from a specific subject and
   * according to the question level.
   *
   * @param {SubjectState} state The subject state.
   * @returns {(name: string, level: number) => string[]} The amount of questions.
   */
  getNumberOfQuestionBySubjectAndLevel: state => (name, level) => {
    const subject = state.subjects.find(subject => subject.name === name)

    return subject ? subject.questions.filter(q => q.level <= level).length : 0
  },
}

export default {
  state,
  mutations,
  actions,
  getters,
}
