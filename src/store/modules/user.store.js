import { Store } from 'vuex'
// import axios from 'axios'

import { analytics, auth } from '../../api/firebase'

import { UserController } from '../../controllers/user.controller'

import { UserEntity } from '../../entities/user.entity'

import { createErrorLog, showErrorMessage } from '../../utils/errors'

/**
 * @typedef {import('./tests.store.js').Attempt} Attempt
 */

/**
 * @typedef {{admin: boolean, appraiser: boolean, student: boolean}} UserClaims
 */

/**
 * @typedef {Object} UserState
 * @property {{id: string}?} user The current user uid.
 * @property {UserEntity} userInfo The current user info.
 * @property {UserClaims} userClaims The current user claims.
 * @property {UserEntity[]} users An array of users.
 * @property {UserEntity} lastUser The most recent registered user.
 */

/**
 * Defines the user controller.
 */
const controller = new UserController()

/**
 * Gets the initial state for sign user store.
 *
 * @returns {UserState} The initial user state object.
 */
const initialState = () => ({
  user: null,
  userInfo: null,
  userClaims: null,
  users: [],
  lastUser: null,
})

const state = initialState()

const mutations = {
  /**
   * Sets the current user uid into the state.
   *
   * @param {UserState} state The user state.
   * @param {{id: string}?} data The user uid.
   */
  setUser(state, data) {
    state.user = data
  },
  /**
   * Sets the current user info into the state.
   *
   * @param {UserState} state The user state.
   * @param {UserEntity} data The user info.
   */
  setUserInfo(state, data) {
    state.userInfo = data ? data.clone() : null
  },
  /**
   * Sets the current user claims into the state.
   *
   * @param {UserState} state The user state.
   * @param {UserClaims} data The user claims.
   */
  setUserClaims(state, data) {
    state.userClaims = data
  },
  /**
   * Sets an array of users into the state.
   *
   * @param {UserState} state The user state.
   * @param {UserEntity[]} data The array of users.
   */
  setUsers(state, data) {
    state.users = data.map(u => u.clone())
  },
  /**
   * Sets the most recent registered user into the state.
   *
   * @param {UserState} state The user state.
   * @param {UserEntity} data The most recent user info.
   */
  setLastUser(state, data) {
    state.lastUser = data ? data.clone() : null
  },
  /**
   * Sets to a user a new role according to it's e-mail.
   *
   * @param {UserState} state The user state.
   * @param {Object} data The data containing the user e-mail and new role.
   * @param {string} data.email The user e-mail.
   * @param {string} data.role The user new role.
   * @param {string} data.updated The user edition date.
   */
  setUserRole(state, data) {
    const { email, role, updated } = data

    const users = []

    state.users.forEach(user => {
      if (user.email !== email) {
        return users.push(user)
      }

      users.push(
        UserEntity.fromMap({
          ...user,
          role,
          updated,
        }),
      )
    })

    state.users = [...users]
  },
  /**
   * Resets the user state to it's initial state.
   *
   * @param {UserState} state The user state.
   */
  RESETUsers(state) {
    const newState = initialState()
    Object.keys(newState).forEach(key => {
      state[key] = newState[key]
    })
  },
}

const actions = {
  /**
   * Signs an user in using its Google account.
   *
   * @param {Store<UserState>} store the vuex store.
   */
  async signWithGoogle({ commit }) {
    commit('setLoading', true)

    try {
      await controller.signInWithGoogle()
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        return
      }

      if (error.code === '') {
        createErrorLog('Google Sign', error.message)
      }

      const errorModel = showErrorMessage(
        'default',
        '',
        'Google sign error - ' + error.message,
      )

      commit('setError', { message: errorModel })
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Uploads a new avatar image to the current user.
   *
   * @param {Store<UserState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {File} payload.image The image to be uploaded.
   * @returns The image url.
   */
  async uploadAvatar({ commit }, payload) {
    const { image } = payload

    try {
      if (!image) {
        return null
      }

      return controller.uploadAvatar(
        payload.image,
        `users/${auth.currentUser.uid}/avatar`,
      )
    } catch (error) {
      createErrorLog('Avatar Upload', error.message, payload)

      const errorModel = showErrorMessage(
        'connection',
        '',
        'Avatar upload error - ' + error.message,
      )

      commit('setError', { message: errorModel })
    }
  },
  /**
   * Creates a new user account in Firebase Authentication.
   *
   * @param {Store<UserState>} store the vuex store.
   * @param {Object} payload the action payload.
   * @param {string} payload.name the new user name.
   * @param {string} payload.email the new user email.
   * @param {string} payload.image the new user image url.
   * @param {string} payload.password the new user password.
   * @param {string} payload.userUid whether the user was created using a Google account.
   */
  async signUserUp({ commit, dispatch }, payload) {
    commit('setLoading', true)
    commit('clearError')

    try {
      const { user, size } = await controller.signUp(payload)

      // let url = "";

      // if (process.env.NODE_ENV === "production") {
      //   url =
      //     "https://us-central1-cloud-quiz-generator.cloudfunctions.net/authentication-userDefaultRole";

      //   await axios.get(url, { headers: { uid: user.id } });
      // }

      commit('addRemoveSize', {
        key: 'users',
        data: size,
      })

      await dispatch('loadUserClaims', true)

      commit('setUserInfo', user)
      commit('setUser', { id: user.id })
    } catch (error) {
      createErrorLog('Sign Up', error.message, {
        name: payload.name,
        email: payload.email,
      })

      const errorModel = showErrorMessage(
        'default',
        '',
        'Sign up error - ' + error.message,
      )

      commit('setError', { message: errorModel })
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Updates an user name and avatar image.
   *
   * @param {Store<UserState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {string} payload.name The user new name.
   * @param {string} payload.profileImages The user new avatar image.
   * @param {Attempt[]} payload.attempts The user quizzes attempts.
   * @param {boolean} payload.noMessage Whether the success message will be shown.
   */
  async updateUser({ commit, state }, payload) {
    commit('setLoading', true)

    try {
      const user = await controller.updateOne({
        id: state.user.id,
        name: payload.name ?? state.userInfo.name,
        profileImages:
          payload.profileImages ?? state.userInfo.profileImages ?? '',
        attempts: payload.attempts ?? state.userInfo.attempts ?? '',
      })

      commit('setUserInfo', user)

      if (payload.noMessage) {
        return
      }

      commit('setSuccess', `'${user.name || user.email}' successfully edited!`)
    } catch (error) {
      createErrorLog('User DB Update', error.message, payload)

      const errorModel = showErrorMessage(
        'default',
        '',
        'User update error - ' + error.message,
      )

      commit('setError', { message: errorModel })
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Sign in the user using it's e-mail and password.
   *
   * @param {Store<UserState>} store the vuex store.
   * @param {Object} payload the action payload.
   * @param {string} payload.email the user e-mail.
   * @param {string} payload.password the user password.
   */
  async signUserIn({ commit, dispatch }, payload) {
    commit('setLoading', true)

    commit('clearError')
    commit('clearSuccess')

    await dispatch('loadDataSize')

    dispatch('resetQuestions')
    dispatch('resetRequests')
    dispatch('resetTests')

    try {
      await controller.signIn(payload)

      // analytics.logEvent('login')
    } catch (error) {
      const errorModel = showErrorMessage(
        'default',
        '',
        'Login error - ' + error.message,
      )

      commit('setError', { message: errorModel })

      if (
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/user-not-found'
      ) {
        return
      }

      createErrorLog('Login', error.message, {
        email: payload.email,
      })
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Loads the current user info base on it's uid.
   *
   * @param {Store<UserState>} store the vuex store.
   * @param {Object} payload the action payload.
   * @param {string} payload.id The user uid.
   */
  async loadUserInfo({ commit }, payload) {
    commit('setLoading', true)

    const user = await controller.getOne(payload.id)

    commit('setUserInfo', user)
    commit('setLoading', false)
  },
  /**
   * Loads the current user claims.
   *
   * @param {Store<UserState>} store the vuex store.
   * @param {boolean} payload whether is to apply the default role or not.
   * @returns the user claims.
   */
  async loadUserClaims({ commit, state }, payload) {
    try {
      if (!auth.currentUser || state.userClaims) {
        return null
      }

      const user = await controller.getOne(auth.currentUser.uid)

      const claims = {
        admin: false,
        appraiser: false,
        student: false,
      }

      claims[payload ? 'student' : user.role] = true

      commit('setUserClaims', claims)

      return claims
    } catch (error) {
      const errorModel = showErrorMessage('load', 'User Claims', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('User Claims Load', error.message, {
        currentUser: auth.currentUser,
        claims: state.userClaims,
      })
    }
  },
  /**
   * Loads all the application users.
   *
   * @param {Store<UserState>} store The vuex store.
   */
  async loadUsers({ commit }) {
    commit('setLoading', true)

    try {
      const users = await controller.getAll()

      commit('setUsers', users)
    } catch (error) {
      const errorModel = showErrorMessage('load', 'Users', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('Users Load', error.message)
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Loads the most recent registered user.
   *
   * @param {Store<UserState>} store - The vuex store.
   */
  async loadLastUser({ commit }) {
    commit('setLoading', true)

    try {
      const user = await controller.getLast()

      commit('setLastUser', user)
    } catch (error) {
      const errorModel = showErrorMessage('load', 'Users', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('Last User Loading', error.message)
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Gets an user by its uid.
   *
   * @param {Store<UserState>} store the vuex store.
   * @param {Object} payload the action payload.
   * @param {string} payload.id the user uid.
   * @returns {Promise<UserInfo>} an user data.
   */
  async getUserById({ commit }, payload) {
    commit('setLoading', true)

    try {
      return controller.getOne(payload.id)
    } catch (error) {
      const errorModel = showErrorMessage('load', 'User', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('User By Id Loading', error.message, payload)
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Gets an user by its e-mail.
   *
   * @param {Store<UserState>} store the vuex store.
   * @param {Object} payload the action payload.
   * @param {string} payload.email The user e-mail.
   * @returns {Promise<UserInfo>} an user data.
   */
  async getUserByEmail({ commit }, payload) {
    commit('setLoading', true)

    try {
      return controller.getByEmail(payload.email)
    } catch (error) {
      const errorModel = showErrorMessage('load', 'User', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('User By E-mail Loading', error.message, payload)
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Sets to an user a new role.
   *
   * @param {Store<UserState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {string} payload.email The user email.
   * @param {string} payload.role The user new role.
   */
  async setUserRole({ commit }, payload) {
    commit('setLoading', true)

    const { email, role } = payload

    // let url = "";

    // if (process.env.NODE_ENV === "production") {
    //   url =
    //     "https://us-central1-cloud-quiz-generator.cloudfunctions.net/authentication-setRole";
    // }

    try {
      const user = await controller.updateByEmail(email, {
        role,
      })

      if (!user) {
        return
      }

      commit('setUserRole', user.toMap())
      commit('setSuccess', `'${user.name || email}' successfully edited!`)

      // if (process.env.NODE_ENV === "production") {
      //   await axios.post(url, {
      //     data: {
      //       email,
      //       role
      //     }
      //   });
      // }
    } catch (error) {
      const errorModel = showErrorMessage('edition', 'User role', error.message)

      commit('setError', { message: errorModel })

      createErrorLog('User Role Update', error.message, payload)
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Logs out the current user.
   *
   * @param {Store<UserState>} store - The vuex store.
   */
  async logout({ commit }) {
    await auth.signOut()

    commit('setUser', null)
    commit('setUserInfo', null)
    commit('setUserClaims', null)
  },
  /**
   * Auto sign in an user if it's id is already into the browser local storage.
   *
   * @param {Store<UserState>} store the vuex store.
   * @param {Object} payload the user payload.
   */
  async autoSignIn({ commit, dispatch }, payload) {
    try {
      if (!navigator.onLine) {
        throw new Error('No internet connection')
      }

      const user = await controller.getOne(payload.uid)

      analytics.setUserId(payload.uid)

      if (!user) {
        if (
          !navigator.onLine ||
          (payload.providerData[0] &&
            payload.providerData[0].providerId === 'google.com')
        ) {
          throw new Error('No internet connection')
        }

        await dispatch('signUserUp', {
          name: payload.displayName,
          email: payload.email,
          image: payload.photoURL,
          userUid: payload.uid,
        })

        return
      }

      await dispatch('loadUserClaims')

      dispatch('loadUserInfo', { id: payload.uid })
      commit('setUser', { id: payload.uid })
    } catch (error) {
      const errorModel = showErrorMessage(
        'connection',
        '',
        'It was not possible to log into your account.',
      )

      commit('setError', { message: errorModel })

      createErrorLog('User Auto Login', error.message, payload)
    }
  },
  /**
   * Resets the user password according to it's e-mail.
   *
   * @param {Store<UserState>} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {string} payload.email The user e-mail.
   */
  async resetPassword({ commit }, payload) {
    try {
      await controller.resetPassword(payload.email)

      commit('setSuccess', `Email sent to ${email}`)
    } catch (error) {
      const errorModel = showErrorMessage(
        'admin',
        '',
        'It was not possible to send the password recovering email.',
      )

      commit('setError', { message: errorModel })

      createErrorLog('User Password Reset', error.message, payload)
    } finally {
      commit('setLoading', false)
    }
  },
  /**
   * Resets the user state to it's initial state.
   *
   * @param {Store<UserState>} store The vuex store.
   */
  resetUsers({ commit }) {
    commit('RESETUsers')
  },
}

const getters = {
  /**
   * Gets the current user uid.
   *
   * @param {UserState} state The user state.
   * @returns {{id: string}|null} The current user uid.
   */
  user(state) {
    return state.user
  },
  /**
   * Gets the current user info.
   *
   * @param {UserState} state The user state.
   * @returns {UserEntity} The current user info.
   */
  userInfo(state) {
    return state.userInfo
  },
  /**
   * Gets an array of all application users.
   *
   * @param {UserState} state The user state.
   * @returns {UserEntity[]} An array of users.
   */
  users(state) {
    return state.users
  },
  /**
   * Gets the current user claims.
   *
   * @param {UserState} state The user state.
   * @returns {UserClaims} The current user claims.
   */
  getUserClaims(state) {
    return state.userClaims
  },
  /**
   * Gets the most recent registered user info.
   *
   * @param {UserState} state The user state.
   * @returns {UserEntity} The last registered user info.
   */
  getLastUser(state) {
    return state.lastUser
  },
}

export default {
  state,
  mutations,
  actions,
  getters,
}
