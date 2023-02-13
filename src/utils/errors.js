import { LogEntity } from '../entities/log.entity'
import store from '../store'

import { getNowISOString } from './date'

const models = {
  /**
   * Gets a error message of the 'load' type.
   *
   * @param {string} category the error category.
   * @param {string} message the message to be displayed.
   * @returns {string} the message model.
   */
  load(category, message) {
    return 'Error loading ' + category + ': ' + message
  },
  /**
   * Gets a error message of the 'creation' type.
   *
   * @param {string} category the error category.
   * @param {string} message the message to be displayed.
   * @returns {string} the message model.
   */
  creation(category, message) {
    return 'Error creating ' + category + ': ' + message
  },
  /**
   * Gets a error message of the 'edition' type.
   *
   * @param {string} category the error category.
   * @param {string} message the message to be displayed.
   * @returns {string} the message model.
   */
  edition(category, message) {
    return 'Error editing ' + category + ': ' + message
  },
  /**
   * Gets a error message of the 'exclusion' type.
   *
   * @param {string} category the error category.
   * @param {string} message the message to be displayed.
   * @returns {string} the message model.
   */
  exclusion(category, message) {
    return 'Error deleting ' + category + ': ' + message
  },
  /**
   * Gets a error message of the 'notFound' type.
   *
   * @param {string} message the message to be displayed.
   * @returns {string} the message model.
   */
  notFound(message) {
    return 'Item "' + message + '" not found!'
  },
  /**
   * Gets a error message of the 'connection' type.
   *
   * @param {string} message the message to be displayed.
   * @returns {string} the message model.
   */
  connection(message) {
    return 'Connection error: ' + message
  },
  /**
   * Gets a error message of the 'admin' type.
   *
   * @param {string} message the message to be displayed.
   * @returns {string} the message model.
   */
  admin(message) {
    return 'Error: ' + message + '\nContact some administrator.'
  },
  /**
   * Gets a error message of the 'default' type.
   *
   * @param {string} message the message to be displayed.
   * @returns {string} the message model.
   */
  default(message) {
    return 'Error: ' + message
  },
}

/**
 * Formats an error message according to the given params.
 *
 * @param {string} type the error type.
 * @param {string} category the error category.
 * @param {string} message the message to be displayed.
 * @returns {string} the error message.
 */
export const showErrorMessage = (type, category, message) => {
  if (
    type == 'notFound' ||
    type == 'connection' ||
    type == 'admin' ||
    type == 'default'
  )
    return models[type](message)
  return models[type](category, message)
}

/**
 * Creates an error log and send it to Firebase.
 *
 * @param {string} type the error type.
 * @param {string} message the error message.
 * @param {*} payload the payload at the moment of the error.
 */
export const createErrorLog = (type, message, payload) => {
  const user = store.getters.userInfo

  const log = new LogEntity({
    type,
    date: getNowISOString(),
    user: {
      id: user ? user.id : null,
      name: user ? user.name : null,
      email: user ? user.email : null,
    },
    message,
    payload: payload ? JSON.stringify(payload) : null,
  })

  const toAdd = window.location.pathname === '/admin'

  store.dispatch('createLog', { log, toAdd })
}
