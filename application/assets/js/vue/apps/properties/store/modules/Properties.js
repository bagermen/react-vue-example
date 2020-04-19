import * as types from '../Mutations'
import api from '../../api'

// initial state
const state = {
  properties: []
}

// getters
const getters = {
    allProperties: (state) => state.properties
}

// mutations
const mutations = {
    [types.LOAD_PROPERTIES](state, { properties }) {
    state.properties = properties;
  }
}

// actions
const actions = {
    getAllProperties({ commit }) {
        return new Promise((resolve, reject) => {
            api.getProperties().then(
                (properties) => {
                    commit(types.LOAD_PROPERTIES, { properties });
                    resolve(properties);
                },
                (msg) => {
                    reject(msg);
                }
            );
        });
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    getters,
    actions
}
