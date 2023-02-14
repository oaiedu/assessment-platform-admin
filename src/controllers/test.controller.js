import { analytics } from '../api/firebase'

import { Controller } from './base.controller'
import { DataSizeController } from './data-size.controller'
import { UserController } from './user.controller'

import { QuestionEntity } from '../entities/question.entity'
import { TestEntity } from '../entities/test.entity'

/**
 * @typedef {import('./base.controller').Where} Where
 */

/**
 * @typedef {import('./base.controller').Query} Query
 */

/**
 * @typedef {import('./base.controller').PaginationQuery} PaginationQuery
 */

const TEST_COLLECTION = 'tests'

/**
 * Defines the user controller.
 */
const userController = new UserController()

/**
 * Defines the data size controller.
 */
const dataSizeController = new DataSizeController()

/**
 * Class that represents the test controller.
 */
export class TestController extends Controller {
  /**
   * Gets a test by its uuid.
   *
   * @param {string} uuid the test uuid.
   * @returns {Promise<TestEntity | null>} the found test.
   */
  async getByUuid(uuid) {
    const [test] = await this.query({
      where: [
        {
          field: 'uuid',
          operator: '==',
          value: uuid,
        },
      ],
      limit: 1,
    })

    return test ?? null
  }

  /**
   * Gets one test by its id.
   *
   * @param {string} id the test id.
   * @returns the found test.
   */
  async getOne(id) {
    const entity = await super._getOne(TEST_COLLECTION, TestEntity, id)

    if (!entity) {
      return null
    }

    const [test] = await this._setUsers([entity])

    return test
  }

  /**
   * Gets a list of tests that contains the given question.
   *
   * @param {Partial<QuestionEntity> | string} question whether a string o a question entity to get its name.
   * @returns a tests list.
   */
  async getByQuestion(question) {
    return this.query({
      where: [
        {
          field: 'questionsNames',
          operator: 'array-contains',
          value: typeof question === 'string' ? question : question.name,
        },
      ],
    })
  }

  /**
   * Gets the last tests based on the given amount
   * @param {number} amount the amount of tests to get.
   * @returns a list of tests.
   */
  async getLast(amount = 5) {
    return this.query({
      orderBy: [
        {
          field: 'updated',
          mode: 'desc',
        },
      ],
      limit: amount,
    })
  }

  /**
   * Creates a test into the database.
   *
   * @param {Partial<TestEntity>} data the test to be created.
   * @returns an object containing the test, the new data size and the subject.
   */
  async createOne(data) {
    const clone = { ...data }

    if (clone.user) {
      delete clone.user
    }

    const entity = await super._createOne(TEST_COLLECTION, TestEntity, clone)

    analytics.logEvent('create_question', {
      type: entity.type,
      questions: entity.questionsAmount,
      level: entity.level.index,
    })

    const [test] = await this._setUsers([entity])

    const dataSize = await dataSizeController.getOne()

    const updatedSize = await dataSizeController.updateOne({
      tests: dataSize.tests + 1,
    })

    return {
      test,
      dataSize: updatedSize,
    }
  }

  /**
   * Updates a test according to the given data.
   *
   * @param {Partial<TestEntity>} data the data to be set. Must contain the id.
   * @returns the updated test.
   */
  async updateOne(data) {
    const clone = { ...data }

    if (clone.user) {
      delete clone.user
    }

    const entity = await super._updateOne(TEST_COLLECTION, TestEntity, clone)

    const [test] = await this._setUsers([entity])

    return test
  }

  /**
   * Lists some test from the database according to the given parameters.
   *
   * @param {PaginationQuery} query an object that contains the pagination data.
   * @returns an object containing the gotten test and other data.
   */
  async list(query) {
    const { data, ...rest } = await super._list(
      TEST_COLLECTION,
      TestEntity,
      query,
    )

    const tests = await this._setUsers(data)

    return { ...rest, data: tests }
  }

  /**
   * Searches tests from the database by their name and subject.
   *
   * @param {string} query the test name query.
   * @returns the found tests.
   */
  async search(query = '') {
    const field = 'query'

    /**
     * @type {Where[]}
     */
    const where = [
      {
        field,
        operator: '>=',
        value: query.toUpperCase(),
      },
    ]

    if (query) {
      where.push({
        field,
        operator: '<=',
        value: `${query.toUpperCase()}~`,
      })
    }

    return this.query({
      orderBy: [
        {
          field,
          mode: 'asc',
        },
      ],
      where,
    })
  }

  /**
   * Makes a query to get tests from the database.
   *
   * @param {Query} query the query to be used.
   * @returns the found tests.
   */
  async query(query) {
    const tests = await super._query(TEST_COLLECTION, TestEntity, query)

    return this._setUsers(tests)
  }

  /**
   * Updates one or more tests according to the given query.
   *
   * @param {Query} query the query to be used.
   * @param {Partial<TestEntity>} data the data to be set.
   * @returns a list with the updated tests.
   */
  async updateQuery(query, data) {
    const clone = { ...data }

    if (clone.user) {
      delete clone.user
    }

    const entity = await super._updateQuery(
      TEST_COLLECTION,
      TestEntity,
      query,
      clone,
    )

    const [test] = await this._setUsers([entity])

    return test
  }

  /**
   * Soft deletes a test from the database, meaning it will be marked to be
   * deleted by the user itself or some administrator.
   *
   * @param {string} id the test id.
   * @param {string} userEmail the user that deleted the test.
   * @returns an object container the soft deleted test.
   */
  async softDeleteOne(id, userEmail) {
    const entity = await super._softDeleteOne(
      TEST_COLLECTION,
      TestEntity,
      id,
      userEmail,
    )

    const [test] = await this._setUsers([entity])

    return test
  }

  /**
   * Restores one test from being deleted. Also, updates the test subject's
   * list to contain the restored test.
   *
   * @param {string} id the test id.
   * @returns an object container the restored test and subject.
   */
  async restoreOne(id) {
    const test = await super._restoreOne(TEST_COLLECTION, TestEntity, id)

    return test
  }

  /**
   * Restores all tests from the database.
   *
   * @param {string} userEmail the user email.
   * @returns an object containing a list of tests by each subject id.
   */
  async restoreAll(userEmail) {
    return super._restoreAll(TEST_COLLECTION, TestEntity, userEmail)
  }

  /**
   * Deletes all tests from the database that are marked to deletion.
   *
   * @returns the deleted tests.
   */
  async deleteMarked() {
    const tests = await super._deleteQuery(TEST_COLLECTION, TestEntity, {
      where: [
        {
          field: 'toDelete.status',
          operator: '==',
          value: false,
        },
      ],
    })

    const dataSize = await dataSizeController.getOne()

    if (!dataSize || !tests.length) {
      return { tests, testsAmount: 0 }
    }

    const testsAmount = dataSize.tests - tests.length

    await dataSizeController.updateOne({ tests: testsAmount })

    return { tests, testsAmount }
  }

  /**
   * Sets the users to all given tests.
   *
   * @private
   *
   * @param {TestEntity[]} tests a list of tests.
   * @returns a list of tests with their users.
   */
  async _setUsers(tests = []) {
    const list = [...tests]

    for (const test of list) {
      test.user = await userController.getOne(test.userId)
    }

    return list
  }
}
