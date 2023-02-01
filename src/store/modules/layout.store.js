import { Store } from 'vuex'

/**
 * @typedef {Object} LayoutState
 * @property {string} layout The layout name.
 */

/**
 * Gets the initial state for layout store.
 *
 * @returns {LayoutState} The initial layout state object.
 */
const initialState = () => ({
  layout: 'toolbar-layout',
})

const state = initialState()

const mutations = {
  /**
   * Sets a layout with the given data.
   *
   * @param {LayoutState} state - The layout state.
   * @param {string} data - The layout to be setted.
   */
  setLayout(state, data) {
    state.layout = data
  },
  /**
   * Resets the layout state to it's initial state.
   *
   * @param {LayoutState} state - The layout state.
   */
  RESETLayout(state) {
    const newState = initialState()
    Object.keys(newState).forEach(key => {
      state[key] = newState[key]
    })
  },
}

const actions = {
  /**
   * Resets the layout state to it's initial state.
   *
   * @param {Store<LayoutState>} store - The vuex store.
   */
  resetLayout({ commit }) {
    commit('RESETLayout')
  },
}

const getters = {
  /**
   * Gets the layout name.
   *
   * @param {LayoutState} state - The layout state.
   * @returns {string} The layout name.
   */
  getLayout(state) {
    return state.layout
  },
}

export default {
  state,
  mutations,
  actions,
  getters,
}
