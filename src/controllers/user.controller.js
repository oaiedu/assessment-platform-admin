import { analytics, auth, googleProvider } from '../api/firebase'

import { UserEntity } from '../entities/user.entity'

import { Controller } from './base.controller'
import { DataSizeController } from './data-size.controller'

const USER_COLLECTION = 'users'

/**
 * Defines the data size controller.
 */
const dataSizeController = new DataSizeController()

/**
 * Class that represents the user controller.
 */
export class UserController extends Controller {
  /**
   * Gets all users from the database.
   *
   * @returns a list of users.
   */
  async getAll() {
    return super._getAll(USER_COLLECTION, UserEntity)
  }

  /**
   * Gets the last created user from the database.
   *
   * @returns {Promise<UserEntity?>} the last user entity.
   */
  async getLast() {
    const [user] = await super._query(USER_COLLECTION, UserEntity, {
      orderBy: [
        {
          field: 'created',
          mode: 'desc',
        },
      ],
      limit: 1,
    })

    return user ?? null
  }

  /**
   * Gets an user from the database.
   *
   * @param {string} id the user id.
   * @returns the found user entity.
   */
  async getOne(id) {
    return super._getOne(USER_COLLECTION, UserEntity, id)
  }

  /**
   * Gets an user from the database according to the given email.
   *
   * @param {string} email the user email.
   * @returns {Promise<UserEntity?>} a found user.
   */
  async getByEmail(email) {
    const [user] = await super._query(USER_COLLECTION, UserEntity, {
      where: [
        {
          field: 'email',
          operator: '==',
          value: email,
        },
      ],
      limit: 1,
    })

    return user ?? null
  }

  /**
   * Updates an user into the database.
   *
   * @param {Partial<UserEntity>} data the data to be set.
   * @returns the updated user.
   */
  async updateOne(data) {
    return super._updateOne(USER_COLLECTION, UserEntity, data)
  }

  /**
   * Updates an user by its email.
   *
   * @param {string} email the user email.
   * @param {Partial<UserEntity>} data the data to be set.
   * @returns {Promise<UserEntity?>} the updated user.
   */
  async updateByEmail(email, data) {
    const [user] = await super._updateQuery(
      USER_COLLECTION,
      UserEntity,
      {
        where: [
          {
            field: 'email',
            operator: '==',
            value: email,
          },
        ],
        limit: 1,
      },
      data,
    )

    return user ?? null
  }

  /**
   * Sets an user into the database.
   *
   * @param {Partial<UserEntity>} data the data to be set.
   * @returns the set user.
   */
  async setOne(data) {
    return super._setOne(USER_COLLECTION, UserEntity, data)
  }

  /**
   * Signs the user in using the Google popup.
   *
   * @param {boolean} loginOnly whether the user will only login. Defaults to `false`.
   */
  async signInWithGoogle(loginOnly = false) {
    const user = await auth.signInWithPopup(googleProvider)

    if (user.additionalUserInfo.isNewUser || loginOnly) {
      return
    }

    analytics.logEvent('login')

    await this.updateOne({ id: user.user.uid, provider: 'google' })
  }

  /**
   * Signs an user up using its email and password.
   *
   * @param {Object} data the user sign up data.
   * @param {string} data.name the user name.
   * @param {string} data.email the user email.
   * @param {string} data.password the user password.
   * @param {string} data.image the user image URL.
   * @param {string} data.userUid the user uid in case it was created with Google account.
   */
  async signUp({ name, email, password, image, userUid }) {
    let uid = userUid

    if (!uid) {
      const { user: userData } = await auth.createUserWithEmailAndPassword(
        email,
        password,
      )

      uid = userData.uid
    }

    const user = await this.setOne({
      id: uid,
      name,
      email,
      provider: userUid ? 'google' : 'password',
      profileImages: image,
    })

    analytics.logEvent('sign_up')

    const dataSize = await dataSizeController.getOne()
    const size = +dataSize.users + 1

    await dataSizeController.updateOne({
      users: size,
    })

    return {
      size,
      user,
    }
  }

  /**
   *
   * @param {Object} data the user login data.
   * @param {string} data.email the user email.
   * @param {string} data.password the user password.
   */
  async signIn({ email, password }) {
    const user = await this.getByEmail(email)

    const google = user && user.provider === 'google'

    if (google) {
      await this.signInWithGoogle(true)
    } else {
      await auth.signInWithEmailAndPassword(email, password)
    }

    analytics.logEvent('login')
  }

  /**
   * Sends a link to the `email` to reset the user password.
   *
   * @param {string} email the user email.
   */
  async resetPassword(email) {
    return auth.sendPasswordResetEmail(email)
  }

  /**
   * Uploads an avatar (image) to the storage.
   *
   * @param {File} image the image file to be uploaded.
   * @param {string} name the file name.
   * @returns an URL to the uploaded image.
   */
  async uploadAvatar(image, name) {
    return super._uploadFile(image, name)
  }
}
