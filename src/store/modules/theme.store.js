import { Store } from "vuex";

import { db } from "../../main";
import { showErrorMessage } from "../../utils/errors";

/**
 * @typedef {Object} BackgroundColor
 * @property {string} color - The background color.
 */

const initialState = () => ({
    color: white
  });

  //Sets the initial state
  const state = initialState();

  const mutations = {
  /**
   * Sets the loading to true or false.
   *
   * @param {LogsState} state - The background color state.
   * @param {boolean} data - The color value to be setted.
   */
    setColor(state, data) {
      state.color = data;
    },
  };
  
  //Export the fuctions
  export default {
    state,
    mutations
  };
  