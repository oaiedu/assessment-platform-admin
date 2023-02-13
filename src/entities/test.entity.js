import uuid from 'uuid-random'

import { Entity } from './base.entity'
import { QuestionEntity } from './question.entity'
import { UserEntity } from './user.entity'

/**
 * @typedef {import('./question.entity').Level} Level
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
 * Class that represents the test entity.
 */
export class TestEntity extends Entity {
  /**
   * @param {Omit<Partial<TestEntity>, 'query'>} partial
   */
  constructor(partial) {
    super(partial)

    /**
     * Defines the user that created the quiz.
     *
     * @type {string}
     */
    this.userId = partial.userId ?? ''

    /**
     * Defines the user that is linked to the quiz.
     *
     * @type {UserEntity}
     */
    this.user = partial.user ?? null

    /**
     * Defines the quiz title.
     *
     * @type {string}
     */
    this.title = partial.title ?? ''

    /**
     * Defines the quiz instructions.
     *
     * @type {string}
     */
    this.instructions = partial.instructions ?? ''

    /**
     * Defines how many questions the quiz have.
     *
     * @type {number}
     */
    this.questionsAmount = partial.questionsAmount ?? 0

    /**
     * Defines the percentage of the quiz questions that the user must
     * score to be approved.
     *
     * @type {number}
     */
    this.approvalPercentage = partial.approvalPercentage ?? 0

    /**
     * Defines whether the quiz has unlimited time.
     *
     * @type {boolean}
     */
    this.unlimitedTime = partial.unlimitedTime ?? false

    /**
     * Defines the quiz timer.
     *
     * @type {Time}
     */
    this.time = partial.time

    /**
     * Defines the quiz level.
     *
     * @type {Level}
     */
    this.level = partial.level

    /**
     * Defines the quiz type.
     *
     * @type {'selected'|'random'|'auto'}
     */
    this.type = partial.type

    /**
     * Defines a list with the quiz questions.
     *
     * @type {Partial<QuestionEntity>[]}
     */
    this.questions = partial.questions ?? []

    /**
     * Defines a list with the subjects names.
     *
     * @type {string[]}
     */
    this.subjects = partial.subjects ?? []

    /**
     * Defines an array that contains all questions names added to the quiz.
     *
     * @type {string[]}
     */
    this.questionsNames = partial.questionsNames ?? []

    /**
     * Defines an object containing all user attempts (id and number of attempts).
     *
     * @type {Record<string, number>}
     */
    this.userAttempts = partial.userAttempts ?? null

    /**
     * Defines an identifier to be used for tests ordering and filtering.
     *
     * @type {string}
     */
    this.uuid = partial.uuid ?? uuid()

    /**
     * Defines and identifier to be used for tests searching.
     *
     * @readonly
     *
     * @type {string}
     */
    this.query = (partial.title ?? '').toUpperCase()
  }

  /**
   * Clones the current entity into a new one with a different reference.
   *
   * @returns a new entity.
   */
  clone() {
    return super.clone(TestEntity)
  }

  /**
   * Gets a new test entity from the given map.
   *
   * @param {Partial<TestEntity>} map a map that represents the test.
   * @returns a new test entity.
   */
  static fromMap(map) {
    return Entity.fromMap(map, TestEntity)
  }
}
