import { Controller } from './base.controller'
import { DataSizeController } from './data-size.controller'
import { UserController } from './user.controller'

import { RequestEntity } from '../entities/request.entity'

/**
 * @typedef {import('./base.controller').Where} Where
 */

/**
 * @typedef {import('./base.controller').Query} Query
 */

/**
 * @typedef {import('./base.controller').PaginationQuery} PaginationQuery
 */

const REQUEST_COLLECTION = 'question-requests'

/**
 * Defines the data size controller.
 */
const dataSizeController = new DataSizeController()

/**
 * Defines the user controller.
 */
const userController = new UserController()

/**
 * Class that represents the question request controller.
 */
export class RequestController extends Controller {
  /**
   * Gets a request by its name.
   *
   * @param {string} name the request name.
   * @returns {Promise<RequestEntity | null>} the found request.
   */
  async getByName(name) {
    const [request] = await this.query({
      where: [
        {
          field: 'name',
          operator: '==',
          value: name,
        },
      ],
      limit: 1,
    })

    return request ?? null
  }

  /**
   * Gets one request by its id.
   *
   * @param {string} id the request id.
   * @returns the found request.
   */
  async getOne(id) {
    const entity = await super._getOne(REQUEST_COLLECTION, RequestEntity, id)

    if (!entity) {
      return null
    }

    const [request] = await this._setUsers([entity])

    return request ?? null
  }

  /**
   * Creates a request into the database.
   *
   * @param {Partial<RequestEntity>} data the request to be created.
   * @returns an object containing the request, the new data size and the subject.
   */
  async createOne(data) {
    const clone = { ...data }

    if (clone.user) {
      delete clone.user
    }

    const entity = await super._createOne(
      REQUEST_COLLECTION,
      RequestEntity,
      clone,
    )

    analytics.logEvent('create_request', {
      subject: entity.subject,
      level: entity.level.index,
      user: entity.userId,
    })

    const [request] = await this._setUsers([entity])

    const dataSize = await dataSizeController.getOne()

    const { general, users } = dataSize['question-requests']

    const updatedSize = await dataSizeController.updateOne({
      ['question-request']: {
        general: general + 1,
        users: {
          ...users,
          [request.userId]: (users[request.userId] ?? 0) + 1,
        },
      },
    })

    return {
      request,
      dataSize: updatedSize,
    }
  }

  /**
   * Updates a requests according to the given data.
   *
   * @param {Partial<RequestEntity>} data the data to be set. Must contain the id.
   * @returns the updated requests.
   */
  async updateOne(data) {
    const clone = { ...data }

    if (clone.user) {
      delete clone.user
    }

    const entity = await super._updateOne(
      REQUEST_COLLECTION,
      RequestEntity,
      clone,
    )

    const [request] = await this._setUsers([entity])

    return request
  }

  /**
   * Lists some question from the database according to the given parameters.
   *
   * @param {PaginationQuery} query an object that contains the pagination data.
   * @param {string?} userId an identifier to the user owner of the requests created.
   * @returns an object containing the gotten question and other data.
   */
  async list(query, userId) {
    /**
     * @type {Query}
     */
    const q = {
      where: [],
      orderBy: [],
    }

    if (userId) {
      q.where.push({ field: 'userId', operator: '==', value: userId })
    }

    q.orderBy.push({
      field: 'status',
    })

    const { data, ...rest } = await super._list(
      REQUEST_COLLECTION,
      RequestEntity,
      query,
      q,
    )

    const requests = await this._setUsers(data)

    return { ...rest, data: requests }
  }

  /**
   * Searches requests from the database by their name and subject.
   *
   * @param {string} query the request name query.
   * @param {string?} userId the request user id.
   * @param {string?} status the request status.
   * @returns the found requests.
   */
  async search(query = '', userId, status) {
    const field = 'name'

    /**
     * @type {Where[]}
     */
    const where = []

    if (status) {
      where.push({
        field: 'status',
        operator: '==',
        value: status,
      })
    }

    if (query) {
      where.push(
        {
          field,
          operator: '>=',
          value: query.toUpperCase(),
        },
        {
          field,
          operator: '<=',
          value: `${query.toUpperCase()}~`,
        },
      )
    }

    if (userId) {
      where.push({
        field: 'userId',
        operator: '==',
        value: userId,
      })
    }

    /**
     * @type {import('./base.controller').OrderBy}
     */
    const orderBy = []

    if (query) {
      orderBy.push({
        field,
      })
    }

    if (!status) {
      orderBy.push({
        field: 'status',
      })
    }

    return this.query({
      orderBy,
      where,
    })
  }

  /**
   * Makes a query to get requests from the database.
   *
   * @param {Query} query the query to be used.
   * @returns the found requests.
   */
  async query(query) {
    const result = await super._query(REQUEST_COLLECTION, RequestEntity, query)

    return this._setUsers(result)
  }

  /**
   * Updates one or more requests according to the given query.
   *
   * @param {Query} query the query to be used.
   * @param {Partial<RequestEntity>} data the data to be set.
   * @returns a list with the updated requests.
   */
  async updateQuery(query, data) {
    const requests = await super._updateQuery(
      REQUEST_COLLECTION,
      RequestEntity,
      query,
      data,
    )

    return this._setUsers(requests)
  }

  /**
   * Soft deletes a request from the database, meaning it will be marked
   * to be deleted by the user itself or some administrator.
   *
   * @param {string} id the request id.
   * @param {string} userEmail the user that deleted the request.
   * @returns an object container the soft deleted request and subject.
   */
  async softDeleteOne(id, userEmail) {
    const entity = await super._softDeleteOne(
      REQUEST_COLLECTION,
      RequestEntity,
      id,
      userEmail,
    )

    const [request] = await this._setUsers([entity])

    return request
  }

  /**
   * Restores one request from being deleted. Also, updates the request
   * subject's list to contain the restored request.
   *
   * @param {string} id the request id.
   * @returns an object container the restored request and subject.
   */
  async restoreOne(id) {
    const entity = await super._restoreOne(
      REQUEST_COLLECTION,
      RequestEntity,
      id,
    )

    const [request] = await this._setUsers([entity])

    return request
  }

  /**
   * Restores all questions from the database.
   *
   * @param {string} userEmail the email of the user whom the requests belong.
   * @returns an object containing a list of questions by each subject id.
   */
  async restoreAll(userEmail) {
    const requests = await super._restoreAll(
      REQUEST_COLLECTION,
      RequestEntity,
      userEmail,
    )

    return this._setUsers(requests)
  }

  /**
   * Deletes all questions from the database that are marked to deletion.
   *
   * @returns the deleted questions.
   */
  async deleteMarked() {
    const requests = await super._deleteQuery(
      REQUEST_COLLECTION,
      RequestEntity,
      {
        where: [
          {
            field: 'toDelete.status',
            operator: '==',
            value: false,
          },
        ],
      },
    )

    for (const request of requests) {
      await super._deleteFile(request.image)
    }

    const dataSize = await dataSizeController.getOne()

    if (!dataSize || !requests.length) {
      return { requests, requestsSize: null }
    }

    const general = dataSize['question-requests'].general

    const requestsSize = {
      general: general - requests.length,
      users: {
        ...dataSize['question-requests'].users,
      },
    }

    requests.forEach(r => {
      requestsSize.users[r.userId]--
    })

    await dataSizeController.updateOne({
      ['question-requests']: requestsSize,
    })

    return { requests, requestsSize }
  }

  /**
   * Deletes all approved requests from an user.
   *
   * @param {string} userId the user unique identifier.
   * @returns a list with all deleted requests and the requests size.
   */
  async deleteApproved(userId) {
    const requests = await super._deleteQuery(
      REQUEST_COLLECTION,
      RequestEntity,
      {
        where: [
          {
            field: 'userId',
            operator: '==',
            value: userId,
          },
          {
            field: 'status',
            operator: '==',
            value: '2-approved',
          },
        ],
      },
    )

    const dataSize = await dataSizeController.getOne()

    if (!dataSize || !requests.length) {
      return { requests, requestsSize: null }
    }

    const general = dataSize['question-requests'].general

    const requestsSize = {
      general: general - requests.length,
      users: {
        ...dataSize['question-requests'].users,
      },
    }

    requests.forEach(r => {
      requestsSize.users[r.userId]--
    })

    await dataSizeController.updateOne({
      ['question-requests']: requestsSize,
    })

    return { requests, requestsSize }
  }

  /**
   * Uploads an image to the storage with the given name (no ext.).
   *
   * @param {Object} data
   * @param {File} data.image the image file.
   * @param {string} data.name the file name (no ext.).
   * @returns the image URL.
   */
  async uploadImage({ image, name }) {
    return super._uploadFile(image, `questions/question-${name}`)
  }

  /**
   * Sets the users to all given requests.
   *
   * @private
   *
   * @param {RequestEntity[]} requests a list of requests.
   * @returns a list of requests with their users.
   */
  async _setUsers(requests = []) {
    const list = [...requests]

    for (const request of list) {
      request.user = await userController.getOne(request.userId)
    }

    return list
  }
}
