import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    allOptions: {},
  },
  getters: {},
  mutations: {
    setAllOptions(state, { prop, options }) {
      state.allOptions = {
        ...state.allOptions,
        [prop]: options,
      }
    },
  },
  modules: {},
})
