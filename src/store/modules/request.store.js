import { Store } from 'vuex'

import { createErrorLog, showErrorMessage } from '../../utils/errors'
import { RequestEntity } from '../../entities/request.entity'
import { UserEntity } from '../../entities/user.entity'
import { RequestController } from '../../controllers/request.controller'

/**
 * @typedef {import('../../controllers/base.controller').OrderBy} OrderBy
 */

/**
 * @typedef {import('./questions.store.js').DeleteStatus} DeleteStatus
 * @typedef {import('./questions.store.js').Answer} Answer
 * @typedef {import('./questions.store.js').Subject} Subject
 * @typedef {"0-pendant"|"1-rejected"|"2-approved"} RequestStatus
 */

/**
 * @typedef {Object} RequestState
 * @property {Record<string, RequestEntity[]} requests - The pages with it's requests list.
 * @property {RequestEntity[]} filteredRequests - An array of requests filtered by name.
 * @property {RequestEntity[]} currentRequestsPage - An array of requests of the current page.
 * @property {[string, string]?} lastRequestDocument - An array with the first and last test name from the last request.
 * @property {RequestEntity[]} deleteMarkRequests - An array of requests that were marked to be deleted.
 * @property {RequestEntity[]} lastPendentRequests - An array of the most recent pending tests.
 * @property {RequestEntity[]} currentUserRequests - An array of the current user last pending requests.
 * @property {RequestEntity[]} otherUserRequests - An array of other users last pending requests.
 */

/**
 * Defines the request controller.
 */
const controller = new RequestController()

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
  otherUserRequests: [],
})

const state = initialState()

const mutations = {
  /**
   * Sets a page of requests according to the given data.
   *
   * @param {RequestState} state The request state.
   * @param {Object} data The data containing the page number and it's data.
   * @param {string} data.page The page number.
   * @param {RequestEntity[]} data.data An array of requests.
   */
  setRequestPage(state, data) {
    const { page, data: requests } = data
    state.requests[page] = requests.map(r => r.clone())
  },
  /**
   * Sets the filtered requests.
   *
   * @param {RequestState} state The request state.
   * @param {RequestEntity[]} data An array of filtered requests.
   */
  setFilteredRequests(state, data) {
    state.filteredRequests = data.map(r => r.clone())
  },
  /**
   * Cleans the filtered requests array.
   *
   * @param {RequestState} state The request state.
   */
  resetFilteredRequests(state) {
    state.filteredRequests = []
  },
  /**
   * Cleans the current requests page array.
   *
   * @param {RequestState} state The request state.
   */
  resetCurrentRequestsPage(state) {
    state.currentRequestsPage = []
  },
  /**
   * Sets the current requests page array.
   *
   * @param {RequestState} state The request state.
   * @param {RequestEntity[]} data An array of requests.
   */
  setCurrentRequestsPage(state, data) {
    state.currentRequestsPage = data.map(r => r.clone())
  },
  /**
   * Sets the most recent pending requests.
   *
   * @param {RequestState} state The request state.
   * @param {RequestEntity[]} data An array of requests.
   */
  setLastPendentRequests(state, data) {
    state.lastPendentRequests = data.map(r => r.clone())
  },
  /**
   * Sets the most recent pending requests from the current user.
   *
   * @param {RequestState} state The request state.
   * @param {RequestEntity[]} data An array of requests.
   */
  setCurrentUserRequests(state, data) {
    state.currentUserRequests = data.map(r => r.clone())
  },
  /**
   * Sets the most recent pending requests from other users.
   *
   * @param {RequestState} state The request state.
   * @param {RequestEntity[]} data An array of requests.
   */
  setOtherUserRequests(state, data) {
    state.otherUserRequests = data.map(r => r.clone())
  },
  /**
   * Adds a request to the array of requests marked to be deleted.
   *
   * @param {RequestState} state The request state.
   * @param {RequestEntity} data The request to be added.
   */
  addDeleteMarkRequest(state, data) {
    state.deleteMarkRequests.push(data.clone())
  },
  /**
   * Updates a request that's into the array of requests marked to be deleted.
   *
   * @param {RequestState} state The request state.
   * @param {RequestEntity} data The request to be updated.
   */
  updateDeleteMarkRequest(state, data) {
    const requests = [...state.deleteMarkRequests]

    requests.every((item, index) => {
      if (item.name === data.name) {
        requests[index] = data.clone()
        return
      }

      return true
    })

    state.deleteMarkRequests = requests
  },
  /**
   * Removes a request from the array of requests marked to be deleted.
   *
   * @param {RequestState} state The request state.
   * @param {string} data The name of the request to be removed.
   */
  removeDeleteMarkRequest(state, data) {
    const requests = [...state.deleteMarkRequests]

    requests.every((item, index) => {
      if (item.name === data) {
        requests.splice(index, 1)
        return
      }

      return true
    })

    state.deleteMarkRequests = requests
  },
  /**
   * Sets the array of requests marked to be deleted.
   *
   * @param {RequestState} state The request state.
   * @param {RequestEntity[]} data An array of requests.
   */
  setDeleteMarkRequests(state, data) {
    state.deleteMarkRequests = data.map(r => r.clone())
  },
  /**
   * Sets a request as marked to be deleted.
   *
   * @param {RequestState} state The request state.
   * @param {Object} data The data containing the request name and it's deletion status.
   * @param {string} data.name The request name.
   * @param {DeleteStatus} data.toDelete The request deletion status.
   */
  setDeleteMarkRequest(state, data) {
    const requests = { ...state.requests }

    for (const key in requests) {
      if (!requests[key]) {
        continue
      }

      requests[key].every((item, index) => {
        if (item.name === data.name) {
          requests[key][index] = new RequestEntity({
            ...item,
            toDelete: data.toDelete,
          })

          return
        }

        return true
      })
    }

    state.requests = requests
  },
  /**
   * Sets a filtered request as marked to be deleted.
   *
   * @param {RequestState} state The request state.
   * @param {Object} data The data containing the request name and it's deletion status.
   * @param {string} data.name The request name.
   * @param {DeleteStatus} data.toDelete The request deletion status.
   */
  setDeleteMarkFilteredRequest(state, data) {
    const requests = [...state.filteredRequests]

    requests.every((item, index) => {
      if (item.name === data.name) {
        requests[index] = new RequestEntity({
          ...item,
          toDelete: data.toDelete,
        })

        return
      }

      return true
    })

    state.filteredRequests = requests
  },
  /**
   * Updates a request.
   *
   * @param {RequestState} state The request state.
   * @param {RequestEntity} data The request to be updated.
   */
  updateRequest(state, data) {
    const requests = { ...state.requests }

    for (const key in requests) {
      if (!requests[key]) {
        continue
      }

      requests[key].every((item, index) => {
        if (item.name === data.name) {
          requests[key][index] = new RequestEntity({
            ...data.clone(),
            user: item.user,
          })

          return
        }

        return true
      })
    }

    state.requests = requests
  },
  /**
   * Updates a request that's in the filtered requests array.
   *
   * @param {RequestState} state The request state.
   * @param {RequestEntity} data The request to be updated.
   */
  updateFilteredRequest(state, data) {
    const requests = [...state.filteredRequests]

    requests.every((item, index) => {
      if (item.name === data.name) {
        requests[index] = data.clone()

        return
      }

      return true
    })

    state.filteredRequests = requests
  },
  /**
   * Updates a request that's in the current requests page array.
   *
   * @param {RequestState} state The request state.
   * @param {RequestEntity} data The request to be updated.
   */
  updateCurrentRequestsPage(state, data) {
    const requests = [...state.currentRequestsPage]

    requests.every((item, index) => {
      if (item.name === data.name) {
        requests[index] = data.clone()

        return
      }

      return true
    })

    state.currentRequestsPage = requests
  },
  /**
   * Removes a request from the requests object.
   *
   * @param {RequestState} state The request state.
   * @param {string} data The id of the request to be removed.
   */
  removeRequest(state, data) {
    const requests = { ...state.requests }

    for (const key in requests) {
      if (!requests[key]) {
        continue
      }

      requests[key].every((item, index) => {
        if (item.id === data) {
          requests[key].splice(index, 1)

          return
        }

        return true
      })
    }

    state.requests = requests
  },
  /**
   * Removes a request from the filtered requests array.
   *
   * @param {RequestState} state The request state.
   * @param {string} data The name of the request to be removed.
   */
  removeFilteredRequest(state, data) {
    const requests = [...state.filteredRequests]

    requests.every((item, index) => {
      if (item.name === data) {
        requests.splice(index, 1)

        return
      }

      return true
    })

    state.filteredRequests = requests
  },
  /**
   * Sets the last requests request ids.
   *
   * @param {RequestState} state The request state.
   * @param {[string, string]?} data An array of strings containing the first and last names from the last request.
   */
  setLastRequestDocument(state, data) {
    state.lastRequestDocument = data
  },
  /**
   * Resets the request state to it's initial state.
   *
   * @param {RequestState} state The request state.
   */
  RESETRequests(state) {
    const newState = initialState()
    Object.keys(newState).forEach(key => {
      state[key] = newState[key]
    })
  },
}

const actions = {
  /**
   * Creates a new request.
   *
   * @param {Store<RequestState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {Partial<RequestEntity>} payload.request The request to be created.
   */
  async createQuestionRequest({ commit }, payload) {
    commit('setLoading', true)

    const { request } = payload

    try {
      const { dataSize } = await controller.createOne(request)

      commit('addRemoveSize', {
        key: 'question-requests',
        data: dataSize['question-requests'],
      })

      commit('setSuccess', 'Request successfully created!')
    } catch (error) {
      const errorModel = showErrorMessage('creation', 'Request', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('Request DB Insert', error.message, payload)
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Updates a request based on it's name.
   *
   * @param {Store<RequestState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {Partial<RequestEntity>} payload.request The request to be updated.
   * @param {RequestStatus?} payload.status The request new status.
   * @param {"reqUpdate"|"sttUpdate"} payload.mode If reqUpdate, update all the request data. Otherwise, update only it's status.
   */
  async updateQuestionRequest({ commit }, payload) {
    commit('setLoading', true)
    const { mode, request: requestData, isSearching, status } = payload

    try {
      const request = await controller.updateOne({
        ...requestData,
        status: mode === 'sttUpdate' ? status : requestData.status ?? null,
      })

      if (isSearching) {
        commit('updateFilteredRequest', request)
      }

      commit('updateRequest', request)
      commit('updateCurrentRequestsPage', request)

      if (mode === 'sttUpdate') {
        return
      }

      commit('setSuccess', 'Request successfully edited!')
    } catch (error) {
      const errorModel = showErrorMessage('edition', 'Request', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('Request DB Update', error.message, { payload })
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Reloads the requests page.
   *
   * @param {Store<RequestState>} store The vuex store.
   */
  async refetchRequests({ dispatch, state }) {
    state.requests = {}

    await dispatch('checkDeleteMarkRequests')

    await dispatch('loadRequestPage', {
      page: 1,
      itemsPerPage: 8,
      mode: 'first',
    })
  },
  /**
   * Gets a requests according to the given id.
   *
   * @param {Store<RequestState>} _ The vuex store.
   * @param {string} payload The request id.
   */
  async getRequestById(_, payload) {
    try {
      return controller.getOne(payload)
    } catch (error) {
      const errorModel = showErrorMessage('load', 'Request', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('Load Request By ID', error.message, {
        id: payload,
      })
    }
  },
  /**
   * Loads a page of requests according to the payload data.
   *
   * @param {Store<RequestState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {number} payload.page The page number.
   * @param {number} payload.itemsPerPage The amount of items per page.
   * @param {"next"|"previous"|null} payload.direction The data request direction.
   * @param {"first"|"last"|null} payload.mode The data request mode.
   * @param {Partial<UserEntity>} payload.userInfo The current user info.
   * @param {import('./user.store.js').UserClaims} payload.claims The current user claims.
   */
  async loadRequestPage({ commit, dispatch, state }, payload) {
    commit('setLoading', true)

    const { claims, page, itemsPerPage, direction, mode, userInfo } = payload
    const pages = Object.keys(state.requests)

    const dir = direction ?? (mode === 'first' ? 'forward' : 'backward')

    let perPage = itemsPerPage

    if (mode === 'last') {
      perPage =
        this.getters.getDataSize['question-requests'].general % itemsPerPage ||
        0
    }

    try {
      dispatch('deleteRequests')

      if (pages.includes(`p${page}`)) {
        const pageContent = state.requests['p' + page]

        if (pageContent && pageContent.length) {
          const startDoc = pageContent[0].name
          const endDoc = pageContent[pageContent.length - 1].name

          commit('setLastRequestDocument', [startDoc, endDoc])
        }

        return void commit('setCurrentRequestsPage', pageContent)
      }

      const userId = claims && claims['admin'] ? null : userInfo.id

      const { data, startDoc, endDoc } = await controller.list(
        {
          direction: dir,
          itemsPerPage: perPage,
          lastDoc: mode ? null : state.lastRequestDocument,
          orderBy: 'name',
        },
        userId,
      )

      commit('setCurrentRequestsPage', data)
      commit('setRequestPage', { page: 'p' + page, data })

      if (startDoc) {
        commit('setLastRequestDocument', [startDoc, endDoc])
      }

      commit('setLastRequestDocument', null)
    } catch (error) {
      const errorModel = showErrorMessage('load', 'Requests', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('Request Page Load', error.message, payload)
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Searches for requests based on their name.
   *
   * @param {Store<RequestState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {string} payload.key The string to be searched.
   * @param {string?} payload.status The status to be searched.
   * @param {Partial<UserEntity>} payload.userInfo The current user info.
   * @param {import('./user.store.js').UserClaims} payload.claims The current user claims.
   */
  async searchRequests({ commit }, payload) {
    commit('setLoading', true)

    const { claims, key, status, userInfo } = payload

    try {
      const requests = await controller.search(
        key,
        claims && claims['admin'] ? null : userInfo.id,
        status,
      )

      commit('setFilteredRequests', requests)
    } catch (error) {
      const errorModel = showErrorMessage(
        'load',
        'Requests',
        'Searching error - ' + error.message,
      )

      commit('setError', { message: errorModel })

      createErrorLog('Request Searching', error.message, payload)
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Loads all requests that are marked to be deleted.
   *
   * @param {Store<RequestState>} store The vuex store.
   */
  async checkDeleteMarkRequests({ commit }) {
    try {
      const requests = await controller.query({
        where: [{ field: 'toDelete.status', operator: '==', value: true }],
      })

      commit('setDeleteMarkRequests', requests)
    } catch (error) {
      const errorModel = showErrorMessage('connection', '', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('Request Mark Check', error.message)
    }
  },
  /**
   * Marks a request to be deleted.
   *
   * @param {Store<RequestState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {string} payload.name The request name.
   * @param {boolean} payload.isSearching Whether the application is using filtered requests or not.
   * @param {string} payload.userEmail The current user email.
   */
  async deleteMarkRequest({ commit }, payload) {
    commit('setLoading', true)

    const { id, isSearching, userEmail } = payload

    try {
      const request = await controller.softDeleteOne(id, userEmail)

      const deleteMark = {
        name: request.name,
        toDelete: request.toDelete,
        user: request.user,
      }

      if (isSearching) {
        commit('setDeleteMarkFilteredRequest', deleteMark)
      }

      commit('setDeleteMarkRequest', deleteMark)

      commit('updateCurrentRequestsPage', request)
      commit('addDeleteMarkRequest', request)
    } catch (error) {
      commit('setLoading', false)
      const errorModel = showErrorMessage('connection', '', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('Request Delete Mark', error.message, payload)
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Restores a request from being marked to be deleted.
   *
   * @param {Store<RequestState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {string} payload.id The request id.
   * @param {boolean} payload.isSearching Whether the application is using filtered requests or not.
   */
  async restoreMarkedRequest({ commit, dispatch }, payload) {
    commit('setLoading', true)

    const { id, isSearching } = payload

    try {
      const request = await controller.restoreOne(id)

      if (isSearching) {
        commit('updateFilteredRequest', request)
      }

      commit('updateRequest', request)

      commit('removeDeleteMarkRequest', request.name)
      commit('updateCurrentRequestsPage', request)

      commit('setSuccess', 'Request successfully restored!')
    } catch (error) {
      const errorModel = showErrorMessage('connection', '', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('Request Restore', error.message, payload)
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Restores all requests that are marked to be deleted.
   *
   * @param {Store<RequestState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {boolean} payload.isSearching Whether the application is using filtered requests or not.
   * @param {Partial<UserEntity>} payload.user The current user info.
   */
  async restoreAllMarkedRequests({ commit, state }, payload) {
    commit('setLoading', true)

    const { isSearching, user } = payload

    try {
      const requests = await controller.restoreAll(user.email)

      const falseMarkedRequests = state.deleteMarkRequests.filter(
        q => !q.toDelete.status,
      )

      commit('setDeleteMarkRequests', falseMarkedRequests)

      for (const request of requests) {
        if (isSearching) {
          commit('updateFilteredRequest', request)
        }

        commit('updateRequest', request)
        commit('updateCurrentRequestsPage', request)
      }

      commit('setSuccess', 'Requests successfully restored!')
    } catch (error) {
      const errorModel = showErrorMessage('connection', '', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('Request Restore All', error.message, payload)
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Changes a request's delete status to false (confirmed deletion).
   *
   * @param {Store<RequestState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {string[]} payload.names The requests names.
   * @param {boolean} payload.isSearching Whether the application is using filtered requests or not.
   */
  async changeDeleteStatusRequests({ commit, dispatch }, payload) {
    commit('setLoading', true)

    const { names, isSearching } = payload

    try {
      const requests = await controller.updateQuery(
        {
          where: [
            {
              field: 'name',
              operator: '==',
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

      requests.forEach(request => {
        if (isSearching) {
          commit('updateFilteredRequest', request)
        }

        commit('updateRequest', request)
        commit('updateCurrentRequestsPage', request)
        commit('updateDeleteMarkRequest', request)
      })

      commit('setSuccess', 'Request successfully deleted!')
    } catch (error) {
      const errorModel = showErrorMessage('exclusion', 'Request', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('Request Confirm Delete', error.message, payload)
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Deletes all requests that are marked to be deleted (toDelete.status = false).
   *
   * @param {Store<RequestState>} store - The vuex store.
   */
  async deleteRequests({ commit }) {
    try {
      const { requestsSize } = await controller.deleteMarked()

      if (!requestsSize) {
        return
      }

      commit('addRemoveSize', {
        key: 'question-requests',
        data: requestsSize,
      })
    } catch (error) {
      console.error('Error removing requests:', error)

      createErrorLog('Requests DB Delete', error.message)
    }
  },
  /**
   * Deletes all approved request from a user.
   *
   * @param {Store<RequestState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {Partial<UserEntity>} payload.userInfo The current user info.
   */
  async deleteApprovedRequests({ commit }, payload) {
    const { userInfo } = payload

    try {
      const { requests, requestsSize } = await controller.deleteApproved(
        userInfo.id,
      )

      requests.forEach(r => {
        commit('removeRequest', r.id)
      })

      if (!requestsSize) {
        return
      }

      commit('addRemoveSize', {
        key: 'question-requests',
        data: requestsSize,
      })
    } catch (error) {
      const errorModel = showErrorMessage(
        'connection',
        '',
        'Requests auto delete error - ' + error.message,
      )

      commit('setError', { message: errorModel })

      createErrorLog('Request Approved Delete', error.message, payload)
    }
  },
  /**
   * Loads the most recent pending requests.
   *
   * @param {Store<RequestState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {number} payload.limit The limit of requests on the response.
   */
  async loadLastPendentRequests({ commit, dispatch }, payload) {
    commit('setLoading', true)

    try {
      const requests = await controller.query({
        where: [
          {
            field: 'status',
            operator: '==',
            value: '0-pendant',
          },
        ],
        orderBy: [
          {
            field: 'updated',
            mode: 'desc',
          },
        ],
        limit: payload ? payload.limit : 5,
      })

      commit('setLastPendentRequests', requests)
    } catch (error) {
      const errorModel = showErrorMessage(
        'load',
        'Pendent Requests',
        error.message,
      )

      commit('setError', { message: errorModel })

      createErrorLog('Pendent Requests Loading', error.message, payload)
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Loads the most recent pending requests.
   *
   * @param {Store<RequestState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {number} payload.limit The limit of requests on the response.
   * @param {string} payload.userId The current user id.
   * @param {"current"|"other"} payload.mode The data request mode.
   */
  async loadUserRequests({ commit, dispatch }, payload) {
    commit('setLoading', true)

    const { userId, mode, limit } = payload

    try {
      /**
       * @type {OrderBy}
       */
      const orderBy = [
        {
          field: 'updated',
          mode: 'desc',
        },
      ]

      if (mode === 'other') {
        orderBy.push({
          field: 'userId',
        })
      }

      const requests = await controller.query({
        where: [
          {
            field: 'userId',
            operator: mode === 'other' ? '!=' : '==',
            value: userId,
          },
        ],
        orderBy,
        limit: limit || 5,
      })

      if (mode === 'other') {
        return void commit('setOtherUserRequests', requests)
      }

      commit('setCurrentUserRequests', requests)
    } catch (error) {
      const errorModel = showErrorMessage(
        'load',
        mode === 'other' ? 'Pendent Requests' : 'User Requests',
        error.message,
      )

      commit('setError', { message: errorModel })

      createErrorLog('Pendent User Requests Load', error.message, payload)
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Resets the request state to it's initial state.
   *
   * @param {Store<RequestState>} store The vuex store.
   */
  resetRequests({ commit }) {
    commit('RESETRequests')
  },
}

const getters = {
  /**
   * Gets an array of requests that were marked to be deleted.
   *
   * @param {RequestState} state The requests state.
   * @returns {RequestEntity[]} An array of requests.
   */
  getDeleteMarkRequests(state) {
    return state.deleteMarkRequests
  },
  /**
   * Gets an array of requests of the given page.
   *
   * @param {RequestState} state The request state.
   * @param {number} page The page number.
   * @returns {(page: number) => RequestEntity[]} An array of requests.
   */
  getRequestsByPage(state) {
    return page => state.requests['p' + page]
  },
  /**
   * Gets an array of the current page requests.
   *
   * @param {RequestState} state The request state.
   * @returns {RequestEntity[]} An array of requests.
   */
  getCurrentRequestsPage(state) {
    return state.currentRequestsPage
  },
  /**
   * Gets an array of the filtered requests.
   *
   * @param {RequestState} state The request state.
   * @returns {RequestEntity[]} An array of requests.
   */
  getFilteredRequests(state) {
    return state.filteredRequests
  },
  /**
   * Gets the most recent pending requests.
   *
   * @param {RequestState} state The request state.
   * @returns {RequestEntity[]} An array of requests.
   */
  getLastPendentRequests(state) {
    return state.lastPendentRequests
  },
  /**
   * Gets the most recent pending requests from the current user.
   *
   * @param {RequestState} state The request state.
   * @returns {RequestEntity[]} An array of requests.
   */
  getCurrentUserRequests(state) {
    return state.currentUserRequests
  },
  /**
   * Gets the most recent pending requests from other users.
   *
   * @param {RequestState} state The request state.
   * @returns {RequestEntity[]} An array of requests.
   */
  getOtherUserRequests(state) {
    return state.otherUserRequests
  },
}

export default {
  state,
  mutations,
  actions,
  getters,
}
