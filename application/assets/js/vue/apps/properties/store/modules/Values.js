import * as types from '../Mutations'
import api from '../../api'
import _ from 'lodash'

// initial state
const state = {
  values: []
}

// getters
const getters = {
    allValues: (state, commit, rootState) => {
        return state.values.filter((data) => {
            if (!rootState.editor.showSearch && !rootState.editor.editMode) {
                return false;
            }

            if (rootState.editor.filterValues && data.used) {
                return false;
            }

            if (!rootState.editor.filterValue) {
                return true;
            } else {
                return data.name.toLowerCase().indexOf(rootState.editor.filterValue.toLowerCase()) > -1;
            }
        }).sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });
    },
    valuesCount: (state) => state.values.length
}

// mutations
const mutations = {
    [types.LOAD_VALUES](state, { values }) {
        state.values = values;
    },
    [types.UPDATE_VALUE](state, { idx, value }) {
        _.extend(state.values[idx], value);
    },
    [types.ADD_VALUE](state, { value }) {
        state.values.push(value);
    },
    [types.DELETE_VALUE](state, { value }) {
        let idx = _.findIndex(state.values, value);
        state.values.splice(idx, 1);
    }
}

// actions
const actions = {
    getAllValues({ commit, dispatch }, { propertyId }) {
        dispatch('setLoading', true, {root: true});
        return new Promise((resolve, reject) => {
            api.getValues(propertyId).then(
                (values) => {
                    dispatch('setLoading', false, {root: true});
                    commit(types.LOAD_VALUES, { values });
                    resolve(values);
                },
                () => {
                    dispatch('setLoading', false);
                    reject();
                }
            );
        });
    },

    update({ commit, state }, value ) {
        let idx = _.findIndex(state.values, value);

        if (idx < 0) {
            commit(types.ADD_VALUE, { value: value });
        } else {
            commit(types.UPDATE_VALUE, { idx:idx, value: value });
        }
    },

    delete({ commit, state }, value) {
        commit(types.DELETE_VALUE, { value: value });
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    getters,
    actions
}
