import { Entity } from './base.entity'

/**
 * @typedef {Object} Amount
 * @property {number} general A number that represents the total amount.
 * @property {Record<string, number> | undefined} users An object that contains the users ids and their question requests amount.
 * @property {Record<string, number> | undefined} subject An object that contains the amount of questions by subject.
 */

/**
 * Class that represents the data size entity.
 */
export class DataSizeEntity extends Entity {
  /**
   * @param {Partial<DataSizeEntity>} partial
   */
  constructor(partial) {
    super(partial)

    /**
     * Defines the amount of question requests.
     *
     * @type {Amount}
     */
    this['question-requests'] = partial['question-requests']

    /**
     * Defines the amount of questions.
     *
     * @type {Amount}
     */
    this.questions = partial.questions

    /**
     * Defines the amount of quizzes.
     *
     * @type {number}
     */
    this.tests = partial.tests

    /**
     * Defines the amount of tests by week.
     *
     * @type {Record<string, number>}
     */
    this.testsByWeek = partial.testsByWeek

    /**
     * Defines the amount of users.
     *
     * @type {number}
     */
    this.users = partial.users
  }

  /**
   * Clones the current entity into a new one with a different reference.
   *
   * @returns a new entity.
   */
  clone() {
    return super.clone(DataSizeEntity)
  }

  /**
   * Generates a new data size entity based on the given map.
   *
   * @param {Partial<DataSizeEntity>} map the map to be used.
   * @returns a new data size entity.
   */
  static fromMap(map) {
    return Entity.fromMap(map, DataSizeEntity)
  }
}
