import { Store } from 'vuex'

import { QuestionController } from '../../controllers/question.controller'
import { RequestController } from '../../controllers/request.controller'
import { SubjectController } from '../../controllers/subject.controller'
import { TestController } from '../../controllers/test.controller'

import { QuestionEntity } from '../../entities/question.entity'
import { TestEntity } from '../../entities/test.entity'

import { db } from '../../main'
import { createErrorLog, showErrorMessage } from '../../utils/errors'

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
 * @typedef {Object} QuestionsState
 * @property {Record<string, QuestionEntity[]>} questions The pages with its questions list.
 * @property {QuestionEntity[]} filteredQuestions An array of questions filtered by name.
 * @property {QuestionEntity[]} currentQuestionsPage An array of questions of the current page.
 * @property {[string, string] | null} lastQuestionDocument An array with the first and last question name from the last request.
 * @property {QuestionEntity[]} deleteMarkQuestions An array of questions that were marked to be deleted.
 */

/**
 * Defines the question controller.
 */
const controller = new QuestionController()

/**
 * Defines the test controller.
 */
const testController = new TestController()

/**
 * Defines the subject controller.
 */
const subjectController = new SubjectController()

/**
 * Defines the request controller.
 */
const requestController = new RequestController()

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
  deleteMarkQuestions: [],
})

const state = initialState()

const mutations = {
  /**
   * Sets a page of questions according to the given data.
   *
   * @param {QuestionsState} state The questions state.
   * @param {Object} data The data containing the page number and it's data.
   * @param {string} data.page The page number.
   * @param {QuestionEntity[]} data.data An array of questions.
   */
  setQuestionPage(state, data) {
    state.questions[data.page] = data.data.map(q => q.clone())
  },
  /**
   * Sets the filtered questions.
   *
   * @param {QuestionsState} state The questions state.
   * @param {QuestionEntity[]} data An array of filtered questions.
   */
  setFilteredQuestions(state, data) {
    state.filteredQuestions = data.map(q => q.clone())
  },
  /**
   * Cleans the filtered questions array.
   *
   * @param {QuestionsState} state The questions state.
   */
  resetFilteredQuestions(state) {
    state.filteredQuestions = []
  },
  /**
   * Cleans the current questions page array.
   *
   * @param {QuestionsState} state The questions state.
   */
  resetCurrentQuestionsPage(state) {
    state.currentQuestionsPage = []
  },
  /**
   * Adds a question to the array of questions marked to be deleted.
   *
   * @param {QuestionsState} state The questions state.
   * @param {QuestionEntity} data The question to be added.
   */
  addDeleteMarkQuestion(state, data) {
    state.deleteMarkQuestions.push(data.clone())
  },
  /**
   * Updates a question that's in the array of questions marked to be deleted.
   *
   * @param {QuestionsState} state The questions state.
   * @param {QuestionEntity} data The question to be updated.
   */
  updateDeleteMarkQuestion(state, data) {
    const questions = state.deleteMarkQuestions.map(q => q.clone())

    questions.forEach((item, index) => {
      if (item.id === data.id) {
        questions[index] = data.clone()
      }
    })

    state.deleteMarkQuestions = questions
  },
  /**
   * Removes a question from the array of questions marked to be deleted.
   *
   * @param {QuestionsState} state The questions state.
   * @param {QuestionEntity} string The id of the question to be removed.
   */
  removeDeleteMarkQuestion(state, data) {
    const questions = [...state.deleteMarkQuestions]

    questions.forEach((item, index) => {
      if (item.id === data) {
        state.deleteMarkQuestions.splice(index, 1)
      }
    })
  },
  /**
   * Sets the array of questions marked to be deleted.
   *
   * @param {QuestionsState} state The questions state.
   * @param {QuestionEntity[]} data An array of questions marked to be deleted.
   */
  setDeleteMarkQuestions(state, data) {
    state.deleteMarkQuestions = data.map(q => q.clone())
  },
  /**
   * Sets a question as marked to be deleted.
   *
   * @param {QuestionsState} state The questions state.
   * @param {Object} data The data containing the question name and the deletion status.
   * @param {string} data.name The question name.
   * @param {DeleteStatus} data.toDelete The question deletion status.
   */
  setDeleteMarkQuestion(state, data) {
    const questions = { ...state.questions }

    for (let key in questions) {
      if (!questions[key]) {
        continue
      }

      questions[key].forEach((item, index) => {
        if (item.id === data.id) {
          questions[key][index].toDelete = data.toDelete
        }
      })
    }

    state.questions = questions
  },
  /**
   * Sets a question as marked to be deleted into the filtered questions array.
   *
   * @param {QuestionsState} state The questions state.
   * @param {Object} data The data containing the question name and the deletion status.
   * @param {string} data.name The question name.
   * @param {DeleteStatus} data.toDelete The question deletion status.
   */
  setDeleteMarkFilteredQuestion(state, data) {
    const questions = state.filteredQuestions.map(q => q.clone())

    questions.forEach((item, index) => {
      if (item.id === data.id) {
        questions[index].toDelete = data.toDelete
      }
    })

    state.filteredQuestions = questions
  },
  /**
   * Sets the current questions page array.
   *
   * @param {QuestionsState} state The questions state.
   * @param {QuestionEntity[]} data An array of questions.
   */
  setCurrentQuestionsPage(state, data) {
    state.currentQuestionsPage = data.map(q => q.clone())
  },
  /**
   * Updates a question into the question object, according to the question's name.
   *
   * @param {QuestionsState} state The questions state.
   * @param {QuestionEntity} data The question to be updated.
   */
  updateQuestion(state, data) {
    const questions = state.questions

    for (let key in questions) {
      if (questions[key]) {
        questions[key].forEach((item, index) => {
          if (item.name === data.name) {
            state.questions[key][index] = data.clone()
          }
        })
      }
    }
  },
  /**
   * Updates a question that's in the filtered questions array, according
   * to the question's name.
   *
   * @param {QuestionsState} state The questions state.
   * @param {QuestionEntity} data The question to be updated.
   */
  updateFilteredQuestion(state, data) {
    const questions = [...state.filteredQuestions]

    questions.forEach((item, index) => {
      if (item.name === data.name) {
        questions[index] = data.clone()
      }
    })

    state.filteredQuestions = questions
  },
  /**
   * Updates a question that's in the current questions page array, according to the question's name.
   *
   * @param {QuestionsState} state The questions state.
   * @param {QuestionEntity} data The question to be updated.
   */
  updateCurrentQuestionsPage(state, data) {
    const questions = [...state.currentQuestionsPage]

    questions.forEach((item, index) => {
      if (item.name === data.name) {
        questions[index] = data.clone()
      }
    })

    state.currentQuestionsPage = questions
  },
  /**
   * Deletes a question from the question object, according to the given data.
   *
   * @param {QuestionsState} state The questions state.
   * @param {string} data The name of the question to be deleted.
   */
  deleteQuestion(state, data) {
    const questions = state.questions

    for (let key in questions) {
      if (questions[key]) {
        questions[key].forEach((item, index) => {
          if (item.name === data) {
            state.questions[key].splice(index, 1)
          }
        })
      }
    }
  },
  /**
   * Deletes a question from the filtered questions array, according to the given data.
   *
   * @param {QuestionsState} state The questions state.
   * @param {string} data The name of the question to be deleted.
   */
  deleteFilteredQuestion(state, data) {
    const questions = [...state.filteredQuestions]

    questions.forEach((item, index) => {
      if (item.name === data) {
        state.filteredQuestions.splice(index, 1)
      }
    })
  },
  /**
   * Sets the last question request names.
   *
   * @param {QuestionsState} state - The questions state.
   * @param {[string, string]} data An array of strings containing the first and last question names from the last request.
   */
  setLastQuestionDocument(state, data) {
    state.lastQuestionDocument = data
  },
  /**
   * Resets the questions state to it's initial state.
   *
   * @param {QuestionsState} state - The questions state.
   */
  RESETQuestions(state) {
    const newState = initialState()
    Object.keys(newState).forEach(key => {
      state[key] = newState[key]
    })
  },
}

const actions = {
  /**
   * Reloads the questions page.
   *
   * @param {Store<QuestionsState>} store The vuex store.
   */
  async refetchQuestions({ dispatch, state }) {
    state.questions = {}

    await dispatch('checkDeleteMarkQuestions')

    await dispatch('loadQuestionPage', {
      page: 1,
      itemsPerPage: 8,
      mode: 'first',
    })
  },
  /**
   * Loads a page of questions according to the payload data.
   *
   * @param {Store<QuestionsState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {number} payload.page The page number.
   * @param {number} payload.itemsPerPage The amount of items per page.
   * @param {'forward'|'backward'|null} payload.direction The request direction.
   * @param {'first'|'last'|null} payload.mode The request mode.
   */
  async loadQuestionPage({ commit, dispatch, state }, payload) {
    commit('setLoading', true)

    const { page, itemsPerPage, direction, mode } = payload
    const pages = Object.keys(state.questions)

    const dir = direction ?? (mode === 'first' ? 'forward' : 'backward')

    let perPage = itemsPerPage

    if (mode === 'last') {
      perPage = this.getters.getDataSize.questions.general % itemsPerPage || 0
    }

    try {
      await dispatch('deleteQuestions')

      if (pages.includes(`p${page}`)) {
        const pageContent = state.questions['p' + page]

        if (pageContent && pageContent.length) {
          const startDoc = pageContent[0].name
          const endDoc = pageContent[pageContent.length - 1].name

          commit('setLastQuestionDocument', [startDoc, endDoc])
        }

        return void commit('setCurrentQuestionsPage', pageContent)
      }

      const { data, startDoc, endDoc } = await controller.list({
        direction: dir,
        itemsPerPage: perPage,
        lastDoc: mode ? null : state.lastQuestionDocument,
        orderBy: 'name',
      })

      commit('setCurrentQuestionsPage', data)
      commit('setQuestionPage', { page: `p${page}`, data })

      if (startDoc) {
        return void commit('setLastQuestionDocument', [startDoc, endDoc])
      }

      commit('setLastQuestionDocument', null)
    } catch (error) {
      createErrorLog('Question Page Load', error.message, {
        ...payload,
        pages,
      })

      const errorModel = showErrorMessage('load', 'Questions', error.message)

      commit('setError', { message: errorModel })
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Searches for questions based on their name.
   *
   * @param {Store<QuestionsState>} store The vuex store.
   * @param {string | { query: string, subject?: string }} payload The string to be searched.
   */
  async searchQuestions({ commit }, payload) {
    commit('setLoading', true)

    let query = ''
    let subject = null

    if (typeof payload === 'string') {
      query = payload || ''
    } else {
      query = payload.query || ''
      subject = payload.subject
    }

    try {
      const questions = await controller.search(query, subject)

      commit('setFilteredQuestions', questions)
    } catch (error) {
      createErrorLog('Question Searching', error.message, {
        query,
        subject,
      })

      const errorModel = showErrorMessage(
        'load',
        'Questions',
        'Searching error - ' + error.message,
      )

      commit('setError', { message: errorModel })
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Gets all tests that includes a question based on it's name.
   *
   * @param {Object} payload The action payload.
   * @param {string} payload.name The question name.
   * @returns {Promise<TestEntity[]>} An array of tests.
   */
  async checkQuestionInTests(_, payload) {
    try {
      return testController.getByQuestion(payload.name)
    } catch (error) {
      console.error(error)
    }
  },
  /**
   * Loads all questions that are marked to be deleted.
   *
   * @param {Store<QuestionsState>} store The vuex store.
   */
  async checkDeleteMarkQuestions({ commit }) {
    try {
      const questions = await controller.query({
        where: [{ field: 'toDelete.status', operator: '==', value: true }],
      })

      commit('setDeleteMarkQuestions', questions)
    } catch (error) {
      createErrorLog('Question Mark Check', error.message, null)

      const errorModel = showErrorMessage('connection', '', error.message)

      commit('setError', { message: errorModel })
    }
  },
  /**
   * Marks a question to be deleted.
   *
   * @param {Store<QuestionsState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {string} payload.id The question id.
   * @param {boolean} payload.isSearching Whether the application is using filtered questions.
   * @param {string} payload.userEmail The current user email.
   */
  async deleteMarkQuestion({ commit }, payload) {
    commit('setLoading', true)

    const { id, isSearching, userEmail } = payload

    try {
      const {
        question,
        subject,
        subjectQuestionRemoved,
      } = await controller.softDeleteOne(id, userEmail)

      const deleteMark = {
        name: question.name,
        toDelete: question.toDelete,
      }

      if (isSearching) {
        commit('setDeleteMarkFilteredQuestion', deleteMark)
      }

      commit('setDeleteMarkQuestion', deleteMark)
      commit('updateCurrentQuestionsPage', question)
      commit('addDeleteMarkQuestion', question)

      if (!subjectQuestionRemoved) {
        return
      }

      commit('addRemoveQuestion', {
        subjectId: subject.id,
        questionId: question.name,
        questionLevel: question.level.index,
        remove: true,
      })
    } catch (error) {
      createErrorLog('Question Delete Mark', error.message, payload)

      const errorModel = showErrorMessage('connection', '', error.message)

      commit('setError', { message: errorModel })
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Restores a question from being marked to be deleted.
   *
   * @param {Store<QuestionsState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {string} payload.id The question id.
   * @param {boolean} payload.isSearching Whether the application is using filtered questions.
   * @param {boolean} payload.isRequest Whether the question is a request.
   */
  async restoreMarkedQuestion({ commit, dispatch }, payload) {
    commit('setLoading', true)

    const { id, isSearching, isRequest } = payload

    try {
      const { question, subject } = await controller.restoreOne(id)

      if (isSearching) {
        commit('updateFilteredQuestion', question)
      }

      commit('updateQuestion', question)
      commit('updateCurrentQuestionsPage', question)
      commit('removeDeleteMarkQuestion', id)

      if (!subject) {
        return void commit('setSuccess', 'Question successfully restored!')
      }

      commit('addRemoveQuestion', {
        subjectId: subject.id,
        questionId: question.name,
        questionLevel: question.level.index,
      })

      await dispatch('addQuestionQuizzesBySubject', {
        subject: subject.name,
        question,
      })

      if (isRequest) {
        return
      }

      commit('setSuccess', 'Question successfully restored!')
    } catch (error) {
      createErrorLog('Question Restore', error.message, payload)

      const errorModel = showErrorMessage('connection', '', error.message)

      commit('setError', { message: errorModel })
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Restores all questions that are marked to be deleted.
   *
   * @param {Store<QuestionsState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {boolean} payload.isSearching Whether the application is using filtered questions or not.
   */
  async restoreAllMarkedQuestions({ commit, dispatch, state }, payload) {
    commit('setLoading', true)

    const { isSearching } = payload

    try {
      const { questionsBySubject } = await controller.restoreAll()

      for (const subjectId in questionsBySubject) {
        for (const question of questionsBySubject[subjectId]) {
          if (isSearching) {
            commit('updateFilteredQuestion', question)
          }

          commit('updateQuestion', question)
          commit('updateCurrentQuestionsPage', question)

          await dispatch('addQuestionQuizzesBySubject', {
            subject: question.subject,
            question,
          })

          commit('addRemoveQuestion', {
            subjectId,
            questionId: question.name,
            questionLevel: question.level,
          })
        }
      }

      const deletedQuestions = state.deleteMarkQuestions.filter(
        q => !q.toDelete.status,
      )

      commit('setDeleteMarkQuestions', deletedQuestions)
      commit('setSuccess', 'Questions successfully restored!')
    } catch (error) {
      createErrorLog('Question Restore All', error.message, payload)

      const errorModel = showErrorMessage('connection', '', error.message)

      commit('setError', { message: errorModel })
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Changes a question's delete status to false (confirmed deletion).
   *
   * @param {Store<QuestionsState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {string[]} payload.names The questions names.
   * @param {boolean} payload.isSearching Whether the application is using filtered questions or not.
   */
  async changeDeleteStatusQuestions({ commit }, payload) {
    commit('setLoading', true)

    const { names, isSearching } = payload

    try {
      const questions = await controller.updateQuery(
        {
          where: [
            {
              field: 'name',
              operator: 'in',
              value: names,
            },
          ],
        },
        {
          toDelete: {
            status: false,
          },
        },
      )

      questions.forEach(async question => {
        if (isSearching) {
          commit('updateFilteredQuestion', question)
        }

        commit('updateQuestion', question)
        commit('updateCurrentQuestionsPage', question)
        commit('updateDeleteMarkQuestion', question)

        const {
          questionRemoved,
          subject,
        } = await subjectController.deleteSubjectQuestion(question)

        if (!questionRemoved) {
          return
        }

        commit('addRemoveQuestion', {
          subjectId: subject.id,
          questionId: question.name,
          questionLevel: question.level.index,
          remove: true,
        })
      })
    } catch (error) {
      createErrorLog('Question Confirm Delete', error.message, payload)

      const errorModel = showErrorMessage(
        'exclusion',
        'Question',
        error.message,
      )

      commit('setError', { message: errorModel })
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Deletes all questions that are marked to be deleted (toDelete.status = false).
   *
   * @param {Store<QuestionsState>} store The vuex store.
   */
  async deleteQuestions({ commit }) {
    try {
      const { questionsSize } = await controller.deleteMarked()

      if (!questionsSize) {
        return
      }

      commit('addRemoveSize', {
        key: 'questions',
        data: questionsSize,
      })
    } catch (error) {
      console.error('Error removing question: ', error)

      createErrorLog('Question DB Delete', error.message, null)
    }
  },
  /**
   * Uploads a question image.
   *
   * @param {Store<QuestionsState>} store the vuex store.
   * @param {Object} payload the action payload.
   * @param {File} payload.image the image to be uploaded.
   * @param {string} payload.name the question name.
   * @returns the image url.
   */
  async uploadImageQuestion({ commit }, payload) {
    try {
      return controller.uploadImage(payload)
    } catch (error) {
      createErrorLog('Question Image Upload', error.message, payload)

      const errorModel = showErrorMessage(
        'connection',
        '',
        'Image upload error - ' + error.message,
      )

      commit('setError', { message: errorModel })
    }
  },
  /**
   * Updates a question based on it's name.
   *
   * @param {Store<QuestionsState>} store the vuex store.
   * @param {Object} payload the action payload.
   * @param {QuestionEntity} payload.questionData the question to be updated.
   * @param {QuestionEntity} payload.oldData the question to be kept in the history.
   * @param {string} payload.user the current user id.
   * @param {isSearching} payload.isSearching whether the application is using the filtered questions or not.
   */
  async editQuestion({ commit, dispatch }, payload) {
    commit('setLoading', true)

    const { questionData, oldData, user, isSearching } = payload

    try {
      const {
        question,
        dataSize,
        newSubject,
        oldSubject,
      } = await controller.updateOne(questionData, oldData)

      commit('updateQuestion', question)
      commit('updateCurrentQuestionsPage', question)

      if (isSearching) {
        commit('updateFilteredQuestion', question)
      }

      if (dataSize) {
        commit('addRemoveSize', {
          key: 'questions',
          data: dataSize.questions,
        })
      }

      if (newSubject) {
        commit('addRemoveQuestion', {
          subjectId: newSubject.id,
          questionId: question.name,
          questionLevel: question.level.index,
        })
      }

      if (oldSubject) {
        commit('addRemoveQuestion', {
          subjectId: oldSubject.id,
          questionId: question.name,
          questionLevel: question.level.index,
          remove: true,
        })
      }

      /**
       * @type {TestEntity[]}
       */
      const tests = await testController.getByQuestion(question.name)

      await dispatch('addQuestionQuizzesBySubject', {
        subject: questionData.subject,
        question: questionData,
      })

      for (const t of tests) {
        if (t.type !== 'auto') {
          const index = t.questions.findIndex(q => q.name === questionData.name)

          if (index === -1) {
            continue
          }

          t.questions[index] = questionData

          await dispatch('updateTest', { testData: t })

          continue
        }

        const subject = questionData.subject

        if (
          t.subjects &&
          t.subjects.includes(subject) &&
          questionData.level.index <= t.level.index
        ) {
          continue
        }

        const index = t.questionsNames.indexOf(questionData.name)

        if (index === -1) {
          continue
        }

        t.questionsNames.splice(index, 1)

        if (t.questionsNames.length < t.questionsAmount) {
          t.questionsAmount = t.questionsNames.length
        }

        await dispatch('updateTest', { testData: t })
      }

      commit('setSuccess', 'Question successfully edited!')
    } catch (error) {
      createErrorLog('Question DB Upload', error.message, {
        payload: JSON.stringify(payload),
      })

      const errorModel = showErrorMessage('edition', 'Question', error.message)

      commit('setError', { message: errorModel })
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Checks if a question with the given name exists.
   *
   * @param {Store<QuestionsState>} store The vuex store.
   * @param {string} payload The question name.
   * @returns {Promise<boolean>} Whether the question exists or not.
   */
  async questionExists(_, payload) {
    try {
      const question = await controller.getByName(payload)

      if (question) {
        return true
      }

      const request = await requestController.getByName(payload)

      return !!request
    } catch (error) {
      createErrorLog('Question Exist Test', error.message, payload)

      const errorModel = showErrorMessage('connection', '', error.message)

      commit('setError', { message: errorModel })

      return false
    }
  },
  /**
   * Creates a new question.
   *
   * @param {Store<QuestionsState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {Partial<QuestionEntity>} payload.question The question to be created.
   * @param {boolean} payload.isRequest Whether the question is a request.
   */
  async createQuestion({ commit, dispatch }, payload) {
    commit('setLoading', true)

    const { isRequest, question: data } = payload

    try {
      const { question, dataSize, subject } = await controller.createOne(data)

      commit('addRemoveSize', {
        key: 'questions',
        data: dataSize.questions,
      })

      if (subject) {
        commit('addRemoveQuestion', {
          subjectId: subject.id,
          questionId: question.name,
          questionLevel: question.level.index,
        })

        await dispatch('addQuestionQuizzesBySubject', {
          subject: subject.name,
          question,
        })
      }

      if (!isRequest) {
        commit('setSuccess', 'Question successfully created!')
      }
    } catch (error) {
      createErrorLog('Question DB Insert', error.message, {
        payload: JSON.stringify(payload),
      })

      const errorModel = showErrorMessage('creation', 'Question', error.message)

      commit('setError', { message: errorModel })
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Gets a question by it's name.
   *
   * @param {string} payload the question name.
   * @returns an object that represents the question data.
   */
  async getQuestionByName(_, payload) {
    try {
      return controller.getByName(payload)
    } catch (error) {
      createErrorLog('Question Name Load', error.message, payload)

      const errorModel = showErrorMessage('load', 'Question', error.message)

      commit('setError', { message: errorModel })

      return null
    }
  },
  /**
   * Resets the questions state to it's initial state.
   *
   * @param {Store<QuestionsState>} store The vuex store.
   */
  resetQuestions({ commit }) {
    commit('RESETQuestions')
  },
}

const getters = {
  /**
   * Gets an object with all loaded pages and it's questions.
   *
   * @param {QuestionsState} state The questions state.
   * @returns {Object.<string, QuestionEntity[]>} The questions pages object.
   */
  getQuestions(state) {
    return state.questions
  },
  /**
   * Gets an array of questions that were marked to be deleted.
   *
   * @param {QuestionsState} state The questions state.
   * @returns {QuestionEntity[]} An array of questions.
   */
  getDeleteMarkQuestions(state) {
    return state.deleteMarkQuestions
  },
  /**
   * Gets an array of questions of the given page.
   *
   * @param {QuestionsState} state The questions state.
   * @param {number} page The page number.
   * @returns {(page: number) => QuestionEntity[]} An array of questions.
   */
  getQuestionsByPage(state) {
    return page => state.questions['p' + page]
  },
  /**
   * Gets an array of the current page questions.
   *
   * @param {QuestionsState} state The questions state.
   * @returns {QuestionEntity[]} An array of questions.
   */
  getCurrentQuestionsPage(state) {
    return state.currentQuestionsPage
  },
  /**
   * Gets an array of filtered questions.
   *
   * @param {QuestionsState} state The questions state.
   * @returns {QuestionEntity[]} An array of questions.
   */
  getFilteredQuestions(state) {
    return state.filteredQuestions
  },
  /**
   * Gets an array of answers based on the question's name.
   *
   * @param {QuestionsState} state The questions state.
   * @param {string} name The question name.
   * @returns {(name: string) => Answer[]} An array of answers.
   */
  getAnswersById(state) {
    return name => {
      let question = null

      for (let key in state.questions) {
        if (state.questions[key].name === name) {
          question = state.questions[key]
        }
      }

      if (!question) {
        return null
      }

      return { ...question.answers }
    }
  },
}

export default {
  state,
  mutations,
  actions,
  getters,
}
