import * as types from '../constants/Types';

const initialState = {
    Data: [],
    lastError: null
};

export default function ModelList(state = initialState, action) {
  switch (action.type) {
    case types.MODEL_LIST:
        return Object.assign({}, state, {
            Data: action.list,
            lastError: action.lastError
        });
      case types.ADD_MODEL:
          let list = state.Data.slice();
          list.push(action.model);

          return {
            Data: list,
            lastError: null
          };
      case types.EDIT_MODEL:
        return Object.assign({}, state, {
            Data: state.Data.map((item) => item.id === action.model.id ? action.model : item),
            lastError: action.lastError
        });
      case types.DEL_MODEL:
          return Object.assign({}, state, {
            Data: state.Data.filter((item) => item.id !== action.id),
            lastError: action.lastError
          });
    default:
      return state;
  }
}