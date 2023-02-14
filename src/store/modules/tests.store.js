import { Store } from 'vuex'

import { createErrorLog, showErrorMessage } from '../../utils/errors'
import { TestController } from '../../controllers/test.controller'
import { TestEntity } from '../../entities/test.entity'
import { QuestionEntity } from '../../entities/question.entity'

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
 * @typedef {Object} TestsState
 * @property {Record<string, TestEntity[]>} tests Defines the pages with it's quizzes list.
 * @property {TestEntity[]} filteredTests Defines an array of quizzes filtered by id.
 * @property {TestEntity[]} currentTestsPage Defines an array of quizzes of the current page.
 * @property {[string, string]|null} lastTestDocument Defines an array with the first and last quiz id from the last request.
 * @property {QuestionEntity[]} testQuestions Defines an array of questions from a specific quiz.
 * @property {TestEntity[]} deleteMarkTests Defines an array of quizzes that were marked to be deleted.
 * @property {TestEntity[]} lastTests Defines an array of the most recent quizzes.
 */

/**
 * Defines the test controller.
 */
const controller = new TestController()

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
  lastTests: [],
})

const state = initialState()

const mutations = {
  /**
   * Sets a page of tests according to the given data.
   *
   * @param {TestsState} state The tests state.
   * @param {Object} data The data containing the page number and it's data.
   * @param {string} data.page The page number.
   * @param {TestEntity[]} data.data An array of tests.
   */
  setTestPage(state, data) {
    const { page, data: tests } = data

    state.tests[page] = tests.map(t => t.clone())
  },
  /**
   * Sets the filtered tests.
   *
   * @param {TestsState} state The tests state.
   * @param {TestEntity[]} data An array of filtered tests.
   */
  setFilteredTests(state, data) {
    state.filteredTests = data.map(t => t.clone())
  },
  /**
   * Sets the most recent tests.
   *
   * @param {TestsState} state The tests state.
   * @param {TestEntity[]} data An array of tests.
   */
  setLastTests(state, data) {
    state.lastTests = data.map(t => t.clone())
  },
  /**
   * Cleans the filtered tests array.
   *
   * @param {TestsState} state The tests state.
   */
  resetFilteredTests(state) {
    state.filteredTests = []
  },
  /**
   * Cleans the current tests page array.
   *
   * @param {TestsState} state The tests state.
   */
  resetCurrentTestsPage(state) {
    state.currentTestsPage = []
  },
  /**
   * Sets the current tests page array.
   *
   * @param {TestsState} state The tests state.
   * @param {TestEntity[]} data An array of tests.
   */
  setCurrentTestsPage(state, data) {
    state.currentTestsPage = data.map(t => t.clone())
  },
  /**
   * Adds a test to the array of tests marked to be deleted.
   *
   * @param {TestsState} state The tests state.
   * @param {TestEntity} data The test to be added.
   */
  addDeleteMarkTest(state, data) {
    state.deleteMarkTests.push(data.clone())
  },
  /**
   * Updates a test that's in the array of tests marked to be deleted.
   *
   * @param {TestsState} state The tests state.
   * @param {TestEntity} data The test to be updated.
   */
  updateDeleteMarkTest(state, data) {
    const tests = [...state.deleteMarkTests]

    for (let index = 0; index <= tests.length; index++) {
      const item = tests[index]

      if (!item) {
        continue
      }

      if (item.id === data.id) {
        tests[index] = data.clone()
        break
      }
    }

    state.deleteMarkTests = tests
  },
  /**
   * Removes a test from the array of tests marked to be deleted.
   *
   * @param {TestsState} state The tests state.
   * @param {string} data The id of the test to be removed.
   */
  removeDeleteMarkTest(state, data) {
    const tests = [...state.deleteMarkTests]

    for (let index = 0; index <= tests.length; index++) {
      const item = tests[index]

      if (!item) {
        continue
      }

      if (item.id === data) {
        tests.splice(index, 1)
        break
      }
    }

    state.deleteMarkTests = tests
  },
  /**
   * Sets the array of tests marked to be deleted.
   *
   * @param {TestsState} state The tests state.
   * @param {TestEntity[]} data An array of tests marked to be deleted.
   */
  setDeleteMarkTests(state, data) {
    state.deleteMarkTests = data.map(t => t.clone())
  },
  /**
   * Sets a test as marked to be deleted.
   *
   * @param {TestsState} state The tests state.
   * @param {Object} data The data containing the test id and the deletion status.
   * @param {string} data.id The test id.
   * @param {DeleteStatus} data.toDelete The test deletion status.
   */
  setDeleteMarkTest(state, data) {
    const { id, toDelete } = data

    const tests = { ...state.tests }

    outer: for (let key in tests) {
      if (!tests[key]) {
        continue
      }

      for (let index = 0; index <= tests[key].length; index++) {
        const item = tests[key][index]

        if (!item) {
          continue
        }

        if (item.id === id) {
          tests[key][index].toDelete = toDelete

          break outer
        }
      }
    }

    state.tests = tests
  },
  /**
   * Sets a test as marked to be deleted into the filtered tests array.
   *
   * @param {TestsState} state The tests state.
   * @param {Object} data The data containing the test id and the deletion status.
   * @param {string} data.id The test id.
   * @param {DeleteStatus} data.toDelete The test deletion status.
   */
  setDeleteMarkFilteredTest(state, data) {
    const { id, toDelete } = data

    const tests = [...state.filteredTests]

    for (let index = 0; index <= tests.length; index++) {
      const item = tests[index]

      if (!item) {
        continue
      }

      if (item.id === id) {
        tests[index].toDelete = toDelete
        break
      }
    }

    state.filteredTests = tests
  },
  /**
   * Sets the test questions.
   *
   * @param {TestsState} state The tests state.
   * @param {QuestionEntity[]} data An array of questions.
   */
  setTestQuestions(state, data) {
    state.testQuestions = data.map(t => t.clone())
  },
  /**
   * Updates a test into the test object, according to the test's id.
   *
   * @param {TestsState} state The tests state.
   * @param {TestEntity} data The test to be updated.
   */
  updateTest(state, data) {
    const tests = { ...state.tests }

    outer: for (let key in tests) {
      if (!tests[key]) {
        continue
      }

      for (let index = 0; index <= tests[key].length; index++) {
        const item = tests[key][index]

        if (!item) {
          continue
        }

        if (item.id === data.id) {
          tests[key][index] = data.clone()
          break outer
        }
      }
    }

    state.tests = tests
  },
  /**
   * Updates a test that's in the filtered tests array, according to the test's id.
   *
   * @param {TestsState} state The tests state.
   * @param {TestEntity} data The test to be updated.
   */
  updateFilteredTest(state, data) {
    const tests = [...state.filteredTests]

    for (let index = 0; index <= tests.length; index++) {
      const item = tests[index]

      if (!item) {
        continue
      }

      if (item.id === data.id) {
        tests[index] = data.clone()
        break
      }
    }

    state.filteredTests = tests
  },
  /**
   * Updates a test that's in the current tests page array, according to the test's id.
   *
   * @param {TestsState} state The tests state.
   * @param {TestEntity} data The test to be updated.
   */
  updateCurrentTestsPage(state, data) {
    const tests = [...state.currentTestsPage]

    for (let index = 0; index <= tests.length; index++) {
      const item = tests[index]

      if (!item) {
        continue
      }

      if (item.id === data.id) {
        tests[index] = data.clone()
        break
      }
    }

    state.currentTestsPage = tests
  },
  /**
   * Deletes a test from the test object, according to the given data.
   *
   * @param {TestsState} state The tests state.
   * @param {string} data The id of the test to be deleted.
   */
  deleteTest(state, data) {
    const tests = state.tests

    outer: for (let key in tests) {
      if (!tests[key]) {
        continue
      }

      for (let index = 0; index <= tests[key].length; index++) {
        const item = tests[key][index]

        if (!item) {
          continue
        }

        if (item.id === data) {
          state.tests[key].splice(index, 1)
          break outer
        }
      }
    }
  },
  /**
   * Deletes a test from the filtered tests array, according to the given data.
   *
   * @param {TestsState} state The tests state.
   * @param {string} data The id of the test to be deleted.
   */
  deleteFilteredTest(state, data) {
    const tests = [...state.filteredTests]

    for (let index = 0; index <= tests.length; index++) {
      const item = tests[index]

      if (!item) {
        continue
      }

      if (item.id === data) {
        tests[index].splice(index, 1)
        break
      }
    }

    state.filteredTests = tests
  },
  /**
   * Sets the last test request ids.
   *
   * @param {TestsState} state The tests state.
   * @param {[string, string]?} data An array of strings containing the first and last test uuid from the last request.
   */
  setLastTestDocument(state, data) {
    state.lastTestDocument = data
  },
  /**
   * Resets the tests state to it's initial state.
   *
   * @param {TestsState} state The tests state.
   */
  RESETTests(state) {
    const newState = initialState()
    Object.keys(newState).forEach(key => {
      state[key] = newState[key]
    })
  },
}

const actions = {
  /**
   * Reloads the tests page.
   *
   * @param {Store<TestsState>} store The vuex store.
   */
  async refetchTests({ dispatch, state }) {
    state.tests = {}

    await dispatch('checkDeleteMarkTests')

    await dispatch('loadTestPage', {
      page: 1,
      itemsPerPage: 8,
      mode: 'first',
    })
  },
  /**
   * Loads a page of tests according to the payload data.
   *
   * @param {Store<TestsState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {number} payload.page The page number.
   * @param {number} payload.itemsPerPage The amount of items per page.
   * @param {'forward'|'backward'|null} payload.direction The request direction.
   * @param {'first'|'last'|null} payload.mode The request mode.
   */
  async loadTestPage({ commit, dispatch, state }, payload) {
    commit('setLoading', true)

    const { page, itemsPerPage, direction, mode } = payload
    const pages = Object.keys(state.tests)

    const dir = direction ?? (mode === 'first' ? 'forward' : 'backward')

    let perPage = itemsPerPage

    if (mode === 'last') {
      perPage = this.getters.getDataSize.tests % itemsPerPage || 0
    }

    try {
      await dispatch('deleteTests')

      if (pages.includes(`p${page}`)) {
        const pageContent = state.tests[`p${page}`]

        if (pageContent && pageContent.length) {
          const startDoc = pageContent[0].uuid
          const endDoc = pageContent[pageContent.length - 1].uuid

          commit('setLastTestDocument', [startDoc, endDoc])
        }

        return void commit('setCurrentTestsPage', pageContent)
      }

      const { data, startDoc, endDoc } = await controller.list({
        direction: dir,
        itemsPerPage: perPage,
        lastDoc: mode ? null : state.lastTestDocument,
        orderBy: 'uuid',
      })

      commit('setCurrentTestsPage', data)
      commit('setTestPage', { page: `p${page}`, data })

      if (startDoc) {
        return void commit('setLastTestDocument', [startDoc, endDoc])
      }

      commit('setLastTestDocument', null)
    } catch (error) {
      const errorModel = showErrorMessage('load', 'Quizzes', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('Test Page Load', error.message, payload)
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Checks if a test with the given title exists.
   *
   * @param {Store<TestsState>} store The vuex store.
   * @param {string} payload The test title.
   * @returns The number of tests that match the given title.
   */
  async testExists(_, payload) {
    try {
      const tests = await controller.query({
        where: [
          {
            field: 'title',
            operator: '==',
            value: payload,
          },
        ],
      })

      return tests.length
    } catch (error) {
      const errorModel = showErrorMessage('connection', '', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('Test Exists Check', error.message, payload)
    }
  },
  /**
   * Searches for tests based on their title.
   *
   * @param {Store<TestsState>} store The vuex store.
   * @param {string} payload The string to be searched.
   */
  async searchTests({ commit }, payload) {
    commit('setLoading', true)

    try {
      const tests = await controller.search(payload)

      commit('setFilteredTests', tests)
    } catch (error) {
      const errorModel = showErrorMessage(
        'load',
        'Quizzes',
        'Searching error - ' + error.message,
      )

      commit('setError', { message: errorModel })

      createErrorLog('Test Search', error.message, payload)
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Loads the questions from a given test.
   *
   * @param {Store<TestsState>} store The vuex store.
   * @param {TestEntity} payload The test payload.
   */
  loadTestQuestions({ commit }, payload) {
    commit('setTestQuestions', [...payload.questions])
  },
  /**
   * Loads all tests that are marked to be deleted.
   *
   * @param {Store<TestsState>} store The vuex store.
   */
  async checkDeleteMarkTests({ commit }) {
    try {
      const tests = await controller.query({
        where: [{ field: 'toDelete.status', operator: '==', value: true }],
      })

      commit('setDeleteMarkTests', tests)
    } catch (error) {
      const errorModel = showErrorMessage('connection', '', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('Test Mark Check', error.message)
    }
  },
  /**
   * Marks a test to be deleted.
   *
   * @param {Store<TestsState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {string} payload.id The test id.
   * @param {boolean} payload.isSearching Whether the application is using filtered tests or not.
   * @param {string} payload.userEmail The current user e-mail.
   */
  async deleteMarkTest({ commit }, payload) {
    commit('setLoading', true)

    const { id, isSearching, userEmail } = payload

    try {
      const test = await controller.softDeleteOne(id, userEmail)

      const deleteMark = {
        id: test.id,
        toDelete: test.toDelete,
      }

      if (isSearching) {
        commit('setDeleteMarkFilteredTest', deleteMark)
      }

      commit('setDeleteMarkTest', deleteMark)
      commit('updateCurrentTestsPage', test)
      commit('addDeleteMarkTest', test)
    } catch (error) {
      const errorModel = showErrorMessage('connection', '', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('Test Delete Mark', error.message, payload)
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Restores a test from being marked to be deleted.
   *
   * @param {Store<TestsState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {string} payload.id The test id.
   * @param {boolean} payload.isSearching Whether the application is using filtered tests or not.
   */
  async restoreMarkedTest({ commit, dispatch }, payload) {
    commit('setLoading', true)

    const { id, isSearching } = payload

    try {
      const test = await controller.restoreOne(id)

      if (isSearching) {
        commit('updateFilteredTest', test)
      }

      commit('updateTest', test)
      commit('updateCurrentTestsPage', test)
      commit('removeDeleteMarkTest', id)

      commit('setSuccess', 'Quiz successfully restored!')
    } catch (error) {
      const errorModel = showErrorMessage('connection', '', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('Test Restore', error.message, payload)
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Restores all tests that are marked to be deleted from the database or the current user, depending on the given data.
   *
   * @param {Store<TestsState>} store - The vuex store.
   * @param {Object} payload - The action payload.
   * @param {boolean} payload.all - Whether will restore all database tests or only from the current user.
   * @param {boolean} payload.isSearching - Whether the application is using filtered tests or not.
   * @param {import('./user.store.js').UserInfo} payload.user - The current user info.
   */
  async restoreAllMarkedTests({ commit, dispatch, state }, payload) {
    commit('setLoading', true)

    const { all, isSearching, user } = payload

    try {
      const tests = await controller.restoreAll(all ? null : user.email)

      tests.forEach(test => {
        if (isSearching) {
          commit('updateFilteredTest', test)
        }

        commit('updateTest', test)
        commit('updateCurrentTestsPage', test)

        const markedTests = state.deleteMarkTests.filter(t =>
          all ? !t.toDelete.status : t.uuid !== test.uuid,
        )

        commit('setDeleteMarkTests', markedTests)
      })

      commit('setSuccess', 'Quizzes successfully restored!')
    } catch (error) {
      const errorModel = showErrorMessage('connection', '', error.message)
      commit('setError', { message: errorModel })
      createErrorLog('Test Restore All', error.message, payload)
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Changes a test's delete status to false (confirmed deletion).
   *
   * @param {Store<TestsState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {string} payload.id The test id.
   * @param {boolean} payload.isSearching Whether the application is using filtered tests or not.
   */
  async changeDeleteStatusTests({ commit }, payload) {
    commit('setLoading', true)

    const { id, isSearching } = payload

    try {
      const test = await controller.updateOne({
        id,
        toDelete: {
          status: false,
        },
      })

      if (isSearching) {
        commit('updateFilteredTest', test)
      }

      commit('updateTest', test)
      commit('updateCurrentTestsPage', test)
      commit('updateDeleteMarkTest', test)

      commit('setSuccess', 'Quizzes successfully deleted!')
    } catch (error) {
      const errorModel = showErrorMessage('exclusion', 'Quizzes', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('Test Confirm Delete', error.message, {
        payload,
      })
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Deletes all tests that are marked to be deleted (toDelete.status = false).
   *
   * @param {Store<TestsState>} store The vuex store.
   */
  async deleteTests({ commit, dispatch }) {
    try {
      const { tests, testsAmount } = await controller.deleteMarked()

      if (!testsAmount) {
        return
      }

      commit('addRemoveSize', {
        key: 'tests',
        data: testsAmount,
      })

      dispatch('removeTestsByWeek', { tests })
    } catch (error) {
      console.error('Error removing test: ', error)

      createErrorLog('Test DB Delete', error.message)
    }
  },
  /**
   * Creates a new test.
   *
   * @param {Store<TestsState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {Partial<TestEntity>} payload.testData The test to be created.
   */
  async createTest({ commit, dispatch }, payload) {
    commit('setLoading', true)

    try {
      const { dataSize } = await controller.createOne(payload.testData)

      commit('addRemoveSize', {
        key: 'tests',
        data: dataSize.tests,
      })

      dispatch('addTestsByWeek')

      commit('setSuccess', 'Quiz successfully created!')
    } catch (error) {
      const errorModel = showErrorMessage('creation', 'Quiz', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('Test DB Insert', error.message, payload)
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Updates a test based on it's id.
   *
   * @param {Store<TestsState>} store the vuex store.
   * @param {Object} payload the action payload.
   * @param {Partial<TestEntity>} payload.testData the test to be updated.
   * @param {boolean} payload.noMessage whether the success message will appear.
   * @param {boolean} payload.isSearching whether the filtered tests is being used.
   */
  async updateTest({ commit }, payload) {
    commit('setLoading', true)

    const { testData, isSearching } = payload

    try {
      const test = await controller.updateOne(testData)

      if (isSearching) {
        commit('updateFilteredTest', test)
      }

      commit('updateTest', test)
      commit('updateCurrentTestsPage', test)

      if (payload.noMessage) {
        return
      }

      commit('setSuccess', 'Quiz successfully edited!')
    } catch (error) {
      const errorModel = showErrorMessage('edition', 'Quiz', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('Test DB Update', error.message, payload)
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Loads the most recent tests.
   *
   * @param {Store<TestsState>} store - The vuex store.
   */
  async loadLastTests({ commit, dispatch }, payload) {
    commit('setLoading', true)

    try {
      const tests = await controller.getLast(payload.limit)

      commit('setLastTests', tests)
    } catch (error) {
      const errorModel = showErrorMessage('load', 'Quizzes', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('Last Tests Loading', error.message, payload)
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Adds a question name to all automatic quizzes according
   * to the given subject in case it does not contains the
   * given question name.
   *
   * @param {Store<TestsState>} store the vuex store.
   * @param {Object} payload the action payload.
   * @param {string} payload.subject the subject to be searched.
   * @param {Partial<QuestionEntity>} payload.question the question data to be checked.
   */
  async addQuestionQuizzesBySubject({ commit }, payload) {
    commit('setLoading', true)

    const { question, subject } = payload

    try {
      const tests = await controller.query({
        where: [
          {
            field: 'type',
            operator: '==',
            value: 'auto',
          },
          {
            field: 'subjects',
            operator: 'array-contains',
            value: subject,
          },
        ],
      })

      for (const test of tests) {
        if (
          test.questionsNames.includes(question.name) ||
          question.level.index > test.level.index
        ) {
          continue
        }

        test.questionsNames.push(question.name)

        await controller.updateOne({
          id: test.id,
          questionsNames: test.questionsNames,
        })
      }
    } catch (error) {
      const errorModel = showErrorMessage('edition', 'Quiz', error.message)

      commit('setError', { message: errorModel })

      createErrorLog(
        'Add Question Auto Quiz by Subject',
        error.message,
        payload,
      )
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Gets a quiz by its ID from the state or Firebase.
   *
   * @param {Store<TestsState>} store the vuex store.
   * @param {string} payload the quiz id.
   * @returns an object that represents the quiz data.
   */
  async getTestById({ commit, getters }, payload) {
    commit('setLoading', true)

    /**
     * @type {TestEntity}
     */
    const stateTest = getters.findTestById(payload)

    if (stateTest) {
      return stateTest
    }

    try {
      return controller.getOne(payload)

      // const snapshot = await db
      //   .collection('tests')
      //   .where('id', '==', payload)
      //   .get()

      // return snapshot.docs[0].data()
    } catch (e) {
      const errorModel = showErrorMessage('load', 'Quiz', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('Load Test By ID', error.message, {
        stateTest,
        id: payload,
      })
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Resets the tests state to it's initial state.
   *
   * @param {Store<TestsState>} store The vuex store.
   */
  resetTests({ commit }) {
    commit('RESETTests')
  },
}

const getters = {
  /**
   * Gets an object with all loaded pages and it's tests.
   *
   * @param {TestsState} state The tests state.
   * @returns {Record<string, TestEntity[]>} The tests pages object.
   */
  getTests(state) {
    return state.tests
  },
  /**
   * Gets the most recent tests.
   *
   * @param {TestsState} state The tests state.
   * @returns {TestEntity[]} An array of tests.
   */
  getLastTests(state) {
    return [...state.lastTests].sort((t1, t2) =>
      t1.updated > t2.updated ? -1 : 1,
    )
  },
  /**
   * Gets an array of tests that are marked to be deleted.
   *
   * @param {TestsState} state The tests state.
   * @returns {TestEntity[]} An array of tests that are marked to be deleted.
   */
  getDeleteMarkTests(state) {
    return state.deleteMarkTests
  },
  /**
   * Gets an array of tests of the given page.
   *
   * @param {TestsState} state The tests state.
   * @param {number} page The page number.
   * @returns {TestEntity[]} An array of tests.
   */
  getTestsByPage: state => page => {
    return state.tests['p' + page]
  },
  /**
   * Gets an array of the current page tests.
   *
   * @param {TestsState} state The tests state.
   * @returns {TestEntity[]} An array of tests.
   */
  getCurrentTestsPage(state) {
    return state.currentTestsPage
  },
  /**
   * Gets an array of filtered tests.
   *
   * @param {TestsState} state The tests state.
   * @returns {TestEntity[]} An array of tests.
   */
  getFilteredTests(state) {
    return state.filteredTests
  },
  /**
   * Gets an array of questions from a specific test.
   *
   * @param {TestsState} state The tests state.
   * @returns {QuestionEntity[]} An array of questions.
   */
  getTestQuestions(state) {
    return state.testQuestions
  },
  /**
   * Gets the number of questions of the given subject.
   *
   * @param {TestsState} state The tests state.
   * @param {string} subject The subject name.
   * @param {QuestionEntity[]} questions An array of questions.
   * @returns {(subject: string, questions: QuestionEntity[]) => number} The number of questions of the subject.
   */
  getNumberOfQuestionBySubjectOnTest(state) {
    return (subject, questions) => {
      let counter = 0
      questions.forEach(question => {
        if (question.subject === subject) counter++
      })
      return counter
    }
  },
  /**
   * Gets a test from the test state based on it's id.
   *
   * @param {TestsState} state The tests state.
   * @param {string} id The test id.
   * @returns {(id: string) => TestEntity|null} The test or null if not found.
   */
  findTestById(state) {
    return id => {
      let test = null

      test = state.lastTests.find(t => t.id == id)

      if (!test) {
        for (let key in state.tests) {
          test = state.tests[key].find(t => t.id == id)
        }
      }

      return test
    }
  },
}

export default {
  state,
  mutations,
  actions,
  getters,
}
