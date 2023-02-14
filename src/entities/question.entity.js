import { Entity } from './base.entity'

/**
 * @typedef {Object} Answer
 * @property {'radio-1'|'radio-2'|'radio-3'|'radio-4'} ansId Defines the answer selected radio id.
 * @property {string} description Defines the answer explanation.
 * @property {string} text Defines the answer text body.
 * @property {boolean} value Defines whether the answer is correct.
 */

/**
 * @typedef {Object} Level
 * @property {number} index Defines the level index (0 - 3).
 * @property {string} name Defines the level label.
 */

/**
 * Class that represents the question entity.
 */
export class QuestionEntity extends Entity {
  /**
   * @param {Partial<QuestionEntity>} partial
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
     * Defines the question image URL.
     *
     * @type {string}
     */
    this.image = partial.image ?? ''

    /**
     * Defines the question image size.
     *
     * @type {'1x'|'2x'|'3x'}
     */
    this.imageSize = partial.imageSize ?? '1x'

    /**
     * Defines the question level.
     *
     * @type {Level}
     */
    this.level = partial.level

    /**
     * Defines whether the question has multiple answers.
     *
     * @type {boolean}
     */
    this.multipleAnswers = partial.multipleAnswers ?? false

    /**
     * Defines the question identifier/name.
     *
     * @usageNotes
     * The ideal name should have 4 to 5 letters.
     *
     * @type {string}
     */
    this.name = partial.name.toUpperCase()

    /**
     * Defines the question statement.
     *
     * @type {string}
     */
    this.question = partial.question

    /**
     * Defines the question subject name.
     *
     * @type {string}
     */
    this.subject = partial.subject
  }

  /**
   * Clones the current entity into a new one with a different reference.
   *
   * @returns a new entity.
   */
  clone() {
    return super.clone(QuestionEntity)
  }

  /**
   * Gets a new question entity from the given map.
   *
   * @param {Partial<QuestionEntity>} map a map that represents the question.
   * @returns a new question entity.
   */
  static fromMap(map) {
    return Entity.fromMap(map, QuestionEntity)
  }
}
