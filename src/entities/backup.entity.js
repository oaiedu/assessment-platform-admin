import { Entity } from './base.entity'

/**
 * Class that represents the backup entity into the application.
 */
export class BackupEntity extends Entity {
  /**
   * @param {Partial<BackupEntity>} partial
   */
  constructor(partial) {
    super(partial)

    /**
     * Defines the backup registry number.
     *
     * @type {string}
     */
    this.registry = partial.registry

    /**
     * Defines the backup Google Drive cloud id.
     *
     * @type {string}
     */
    this.cloudId = partial.cloudId

    /**
     * Defines the backup size.
     *
     * @type {string}
     */
    this.size = partial.size

    /**
     * Defines the backup start ISOString date.
     *
     * @type {string}
     */
    this.start = partial.start

    /**
     * Defines the backup end ISOString date.
     *
     * @type {string}
     */
    this.end = partial.end

    /**
     * Defines the month that the backup was created.
     */
    this.month = partial.month
  }

  /**
   * Clones the current entity into a new one with a different reference.
   *
   * @returns a new entity.
   */
  clone() {
    return super.clone(BackupEntity)
  }

  /**
   * Generates a new backup entity based on the given map.
   *
   * @param {Partial<BackupEntity>} map the map to be used.
   * @returns a new backup entity.
   */
  static fromMap(map) {
    return Entity.fromMap(map, BackupEntity)
  }
}
