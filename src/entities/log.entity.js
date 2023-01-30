import { Entity } from './base.entity'

/**
 * @typedef {Object} LogUser
 * @property {string} email
 * @property {string} id Defines the user uuid.
 * @property {string} name
 */

/**
 * Class that represents the error log entity into the application.
 */
export class LogEntity extends Entity {
  /**
   * @param {Partial<LogEntity>} partial
   */
  constructor(partial) {
    super(partial)

    /**
     * Defines the error date.
     *
     * @type {string}
     */
    this.date = partial.date

    /**
     * Defines the error message.
     *
     * @type {string}
     */
    this.message = partial.message

    /**
     * Defines the type of the error.
     *
     * @type {string}
     */
    this.type = partial.type

    /**
     * Defines the log payload.
     *
     * @type {Record<string, unknown>}
     */
    this.payload = partial.payload ?? null

    /**
     * Defines the user that triggered the error.
     *
     * @type {LogUser}
     */
    this.user = partial.user
  }

  /**
   * Clones the current entity into a new one with a different reference.
   *
   * @returns a new entity.
   */
  clone() {
    return super.clone(LogEntity)
  }

  /**
   * Generates a new log entity based on the given map.
   *
   * @param {Partial<LogEntity>} map the map to be used.
   * @returns a new log entity.
   */
  static fromMap(map) {
    return Entity.fromMap(map, LogEntity)
  }
}
