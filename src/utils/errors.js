import uuid from "uuid-random";
import store from "../store";

import { getNowISOString } from "./date";

const models = {
  /**
   * Gets a error message of the 'load' type.
   *
   * @param {string} category the error category.
   * @param {string} message the message to be displayed.
   * @returns {string} the message model.
   */
  load(category, message) {
    return "Error ao carregar " + category + ": " + message;
  },
  /**
   * Gets a error message of the 'creation' type.
   *
   * @param {string} category the error category.
   * @param {string} message the message to be displayed.
   * @returns {string} the message model.
   */
  creation(category, message) {
    return "Erro ao criar " + category + ": " + message;
  },
  /**
   * Gets a error message of the 'edition' type.
   *
   * @param {string} category the error category.
   * @param {string} message the message to be displayed.
   * @returns {string} the message model.
   */
  edition(category, message) {
    return "Erro ao editar " + category + ": " + message;
  },
  /**
   * Gets a error message of the 'exclusion' type.
   *
   * @param {string} category the error category.
   * @param {string} message the message to be displayed.
   * @returns {string} the message model.
   */
  exclusion(category, message) {
    return "Erro ao excluir " + category + ": " + message;
  },
  /**
   * Gets a error message of the 'notFound' type.
   *
   * @param {string} message the message to be displayed.
   * @returns {string} the message model.
   */
  notFound(message) {
    return 'Item "' + message + '" não encontrado!';
  },
  /**
   * Gets a error message of the 'connection' type.
   *
   * @param {string} message the message to be displayed.
   * @returns {string} the message model.
   */
  connection(message) {
    return "Erro de conexão: " + message;
  },
  /**
   * Gets a error message of the 'admin' type.
   *
   * @param {string} message the message to be displayed.
   * @returns {string} the message model.
   */
  admin(message) {
    return "Erro: " + message + "\nEntre em contato com algum administrador.";
  },
  /**
   * Gets a error message of the 'default' type.
   *
   * @param {string} message the message to be displayed.
   * @returns {string} the message model.
   */
  default(message) {
    return "Erro: " + message;
  }
};

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
    type == "notFound" ||
    type == "connection" ||
    type == "admin" ||
    type == "default"
  )
    return models[type](message);
  return models[type](category, message);
};

/**
 * Creates an error log and send it to Firebase.
 *
 * @param {string} type the error type.
 * @param {string} message the error message.
 * @param {*} payload the payload at the moment of the error.
 */
export const createErrorLog = (type, message, payload) => {
  const user = store.getters.userInfo;

  const log = {
    id: uuid(),
    type,
    date: getNowISOString(),
    user: {
      id: user ? user.id : null,
      name: user ? user.name : null,
      email: user ? user.email : null
    },
    message,
    payload: payload || null
  };

  const toAdd = window.location.pathname === "/admin";

  store.dispatch("createLog", { log, toAdd });
};
