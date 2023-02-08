import { Entity } from './base.entity'

/**
 * @typedef {import("./test.entity").Attempt} Attempt
 */

/**
 * Class that represents the user entity.
 */
export class UserEntity extends Entity {
  /**
   * @param {Partial<UserEntity>} partial
   */
  constructor(partial) {
    super(partial)

    /**
     * Defines the user name.
     *
     * @type {string}
     */
    this.name = partial.name

    /**
     * Defines the user email.
     *
     * @type {string}
     */
    this.email = partial.email

    /**
     * Defines the user role.
     *
     * @type {'admin'|'appraiser'|'student'}
     */
    this.role = partial.role ?? 'student'

    /**
     * Defines the user image url.
     *
     * @type {string}
     */
    this.profileImages = partial.profileImages ?? ''

    /**
     * Defines the user quizzes attempts.
     *
     * @type {Attempt[]}
     */
    this.attempts = partial.attempts ?? []

    /**
     * Defines the user login provider.
     *
     * @type {'password'|'google'}
     */
    this.provider = partial.provider ?? 'password'
  }

  /**
   * Clones the current entity into a new one with a different reference.
   *
   * @returns a new entity.
   */
  clone() {
    return super.clone(UserEntity)
  }

  /**
   * Gets a new user entity from the given map.
   *
   * @param {Partial<UserEntity>} map a map that represents the user.
   * @returns a new user entity.
   */
  static fromMap(map) {
    return Entity.fromMap(map, UserEntity)
  }
}
