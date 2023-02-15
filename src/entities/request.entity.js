import { Entity } from './base.entity'
import { UserEntity } from './user.entity'

/**
 * @typedef {import('./question.entity').Answer} Answer
 * @typedef {"0-pendant"|"1-rejected"|"2-approved"} RequestStatus
 * @typedef {import('./question.entity').Level} Level
 */

/**
 * Class that represents the question request entity.
 */
export class RequestEntity extends Entity {
  /**
   * @param {Partial<RequestEntity>} partial
   */
  constructor(partial) {
    super(partial)

    /**
     * Defines a justification/explanation for the right answer.
     *
     * @type {string}
     */
    this.answerJustification = partial.answerJustification ?? ''

    /**
     * Defines a source for the answer justification/explanation.
     *
     * @type {string}
     */
    this.answerJustificationSource = partial.answerJustificationSource ?? ''

    /**
     * Defines a list of answers, usually 4.
     *
     * @type {Answer[]}
     */
    this.answers = partial.answers ?? []

    /**
     * Defines the request image URL.
     *
     * @type {string}
     */
    this.image = partial.image ?? ''

    /**
     * Defines the request image size.
     *
     * @type {'1x'|'2x'|'3x'}
     */
    this.imageSize = partial.imageSize ?? '1x'

    /**
     * Defines the request level.
     *
     * @type {Level}
     */
    this.level = partial.level

    /**
     * Defines whether the request has multiple answers.
     *
     * @type {boolean}
     */
    this.multipleAnswers = partial.multipleAnswers ?? false

    /**
     * Defines the request identifier/name.
     *
     * @usageNotes
     * The ideal name should have 4 to 5 letters.
     *
     * @type {string}
     */
    this.name = partial.name

    /**
     * Defines the request question statement.
     *
     * @type {string}
     */
    this.question = partial.question

    /**
     * Defines the request subject name.
     *
     * @type {string}
     */
    this.subject = partial.subject

    /**
     * Defines the request current status.
     *
     * @type {RequestStatus?}
     */
    this.status = partial.status ?? null

    /**
     * Defines the id of the user that created the request.
     *
     * @type {string}
     */
    this.userId = partial.userId

    /**
     * Defines the user that is linked to the request.
     *
     * @type {UserEntity}
     */
    this.user = partial.user ?? null
  }

  /**
   * Clones the current entity into a new one with a different reference.
   *
   * @returns a new entity.
   */
  clone() {
    return super.clone(RequestEntity)
  }

  /**
   * Gets a new request entity from the given map.
   *
   * @param {Partial<RequestEntity>} map a map that represents the request.
   * @returns a new request entity.
   */
  static fromMap(map) {
    return Entity.fromMap(map, RequestEntity)
  }
}
