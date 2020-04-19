import _ from 'lodash'
import Vue from 'vue'
import Vuex from 'vuex'
import properties from './modules/Properties'
import values from './modules/Values'
import editor from './modules/Editor'
import * as types from './Mutations'
import api from '../api'

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

// mutations
const mutations = {
    [types.SELECT_PROPERTY](state, property) {
        state.selectedItem = property;
    },
    [types.SELECT_VALUE](state, value) {
        state.selectedValue = value;
    },
    [types.UPDATE_SELECTED_VALUE](state, value) {
        state.selectedValue = _.extend(state.selectedValue, value);
    },
    [types.SET_LOADING](state, value) {
        state.isLoading = value;
    }
};

const actions = {
    selectValue({ commit, state }, id) {
        let item = {...state.emptyValue};

        if (state.editor.showSearch) {
            if (id) {
                [item] = state.values.values.filter((item) => {
                    return id == item.id;
                });
            }

            if (item.used != 1) {
                commit(types.SELECT_VALUE, item);
            }
        }
    },

    setLoading({ commit, state}, loading) {
        commit(types.SET_LOADING, loading);
    }
};

const getters = {
};

const defaultValue = {
    id: null,
    name: '',
    used: null
};
export default new Vuex.Store({
    strict: debug,
    modules: {
        properties,
        values,
        editor
    },
    state: {
        emptyValue: defaultValue,
        selectedItem: 0,
        selectedValue: defaultValue,
        isLoading: false
    },
    mutations,
    actions,
    getters
});
