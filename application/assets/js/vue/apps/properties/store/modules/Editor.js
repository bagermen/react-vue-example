import * as types from '../Mutations'
import api from '../../api'

// initial state
const state = {
    filterValue: '',
    showSearch: true,
    editMode: false,
    filterValues: false
}

// getters
const getters = {
    isAllowEdit(state, getters, rootState) {
        if (rootState.selectedValue.id) {
            let search = getters['values/allValues'].filter((value) => value.id == rootState.selectedValue.id);
            return search.length == 1;
        } else {
            return false;
        }
    }
}

// mutations
const mutations = {
    [types.SET_FILTER](state, value) {
        state.filterValue = value;
    },
    [types.SET_SHOW_SEARCH](state, value) {
        state.showSearch = value;
    },
    [types.SET_EDIT_MODE](state, value) {
        state.editMode = value;
    },
    [types.TOGGLE_FILTER_VALUE](state) {
        state.filterValues = !state.filterValues;
    }
}

// actions
const actions = {
    onAddItem({ commit, dispatch, rootState }) {
        commit(types.SET_EDIT_MODE, false);
        commit(types.SET_SHOW_SEARCH, false);
        commit(types.SELECT_VALUE, {...rootState.emptyValue});
    },

    onEditItem({ commit, dispatch, rootState }) {
        commit(types.SET_EDIT_MODE, true);
        commit(types.SET_SHOW_SEARCH, false);
    },

    onReset({ commit, dispatch, rootState }, { selected }) {
        commit(types.SET_EDIT_MODE, false);
        commit(types.SET_SHOW_SEARCH, true);
        commit(types.UPDATE_SELECTED_VALUE, selected);
    },

    resetValues({ commit, dispatch, rootState }) {
        commit(types.SET_SHOW_SEARCH, true);
        commit(types.SELECT_VALUE, {...rootState.emptyValue});
        commit(types.SET_FILTER, '');
    },

    onSelectedUpdate({ commit, state, rootState }, { selected }) {
        commit(types.UPDATE_SELECTED_VALUE, selected);
    },

    saveValue({ commit, dispatch, state, rootState }) {
        return new Promise((resolve, reject) => {
            dispatch('setLoading', true);
            api.saveValue(rootState.selectedItem, rootState.selectedValue).then(
                (resp) => {
                    dispatch('setLoading', false);
                    dispatch('resetValues');
                    dispatch('values/update', resp);
                    resolve(resp);
                },
                (resp) => {
                    dispatch('setLoading', false);
                    dispatch('resetValues');
                    reject(resp);
                }
            )
        });
    },

    deleteValue({ commit, dispatch, state, rootState }) {
        dispatch('setLoading', true);
        return new Promise((resolve, reject) => {
            api.deleteValue(rootState.selectedValue).then(
                (resp) => {
                    dispatch('setLoading', false);
                    dispatch('resetValues');
                    dispatch('values/delete', resp);
                    resolve(resp);
                },
                (resp) => {
                    dispatch('setLoading', false);
                    dispatch('resetValues');
                    reject(resp);
                }
            )
        });
    },

    onFilterValues({ commit }) {
        commit(types.TOGGLE_FILTER_VALUE);
    }
}

export default {
    namespaced: false,
    state,
    mutations,
    getters,
    actions
}
