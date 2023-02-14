/**
 * @template {any} T
 * @typedef {{ new (...args: unknown[]) => T }} Type
 */

import { getNowISOString } from '../utils/date'

/**
 * @typedef {Object} ToDelete
 * @property {boolean} status If `true`, the entity can be restored. If `false`, it will be deleted.
 * @property {string?} userEmail Defines the user that marked the entity to be deleted.
 */

/**
 * @typedef {Object} BaseEntity
 * @property {string} id Defines an unique identifier for all app entities.
 * @property {string} created Defines an ISOString (Date) for when the entity was created.
 * @property {string} updated Defines an ISOString (Date) for when the entity was updated.
 * @property {ToDelete} toDelete Defines the entity exclusion status.
 */

/**
 * Class that represents the base entity, which must be extended by all
 * other entities in the application.
 */
export class Entity {
  /**
   * @param {Partial<BaseEntity>} partial
   */
  constructor(partial) {
    const now = getNowISOString()

    /**
     * Defines the entity unique identifier.
     *
     * @type {string | undefined}
     */
    this.id = partial.id

    /**
     * Defines the entity creation date.
     *
     * @type {string}
     */
    this.created = partial.created ?? now

    /**
     * Defines the entity edition date.
     *
     * @type {string}
     */
    this.updated = partial.updated ?? now

    /**
     * Defines the entity deletion status.
     *
     * @type {ToDelete}
     */
    this.toDelete = partial.toDelete ?? null
  }

  /**
   * Clones the current entity into a new one with a different reference.
   *
   * @template T
   *
   * @param {Type<T>} entity the entity type.
   * @returns {T} a clone of this entity.
   */
  clone(entity) {
    return new entity(this.toMap())
  }

  /**
   * Generates a map object from the current entity.
   *
   * @returns a map object that represents the entity.
   */
  toMap() {
    /**
     * @type {Record<keyof this, unknown>}
     */
    const map = {}

    Object.entries(this).forEach(([key, value]) => {
      if (!value) {
        return
      }

      if (value instanceof Entity) {
        map[key] = value.toMap()
        return
      }

      map[key] = value
    })

    return map
  }

  /**
   * Generates an Entity based on the given map.
   *
   * @template T
   *
   * @param {Partial<T>} map the map to be converted.
   * @param {Type<T>} entity the entity type.
   * @returns {T}
   */
  static fromMap(map, entity = Entity) {
    return new entity(map)
  }
}
