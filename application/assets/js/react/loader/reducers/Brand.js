import * as types from '../constants/Types';

const initialState = {
  Data: [],
  SelectedBrand: {},
  filter: '',
  lastError: null
};

export default function Brand(state = initialState, action) {
  switch (action.type) {
    case types.BRAND_LIST:
      return Object.assign({}, state, {
        Data: action.BrandList,
        lastError: action.lastError
      });

    case types.SELECTED_BRAND:
      return Object.assign({}, state, {
        SelectedBrand: action.value
      });

    case types.SEARCH_BRAND:
      return Object.assign({}, state, {
        filter: action.value.toString()
      });

    default:
      return state;
  }
}


