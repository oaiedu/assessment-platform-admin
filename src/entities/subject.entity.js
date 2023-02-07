import { Entity } from './base.entity'

/**
 * @typedef {Object} SubjectQuestion
 * @property {number} level Defines the question level index (0 - 3).
 * @property {string} name Defines the question name/id.
 */

/**
 * Class that represents the subject entity.
 */
export class SubjectEntity extends Entity {
  /**
   * @param {Partial<SubjectEntity>} partial
   */
  constructor(partial) {
    super(partial)

    /**
     * Defines the subject name.
     *
     * @type {string}
     */
    this.name = partial.name

    /**
     * Defines a list of objects that represents the questions and its level.
     *
     * @type {SubjectQuestion[]}
     */
    this.questions = partial.questions ?? []
  }

  /**
   * Clones the current entity into a new one with a different reference.
   *
   * @returns a new entity.
   */
  clone() {
    return super.clone(SubjectEntity)
  }

  /**
   * Gets a new subject entity from the given map.
   *
   * @param {Partial<SubjectEntity>} map a map that represents the subject.
   * @returns a new subject entity.
   */
  static fromMap(map) {
    return Entity.fromMap(map, SubjectEntity)
  }
}
