import * as types from '../constants/Types';

const initialState = {
    id: null,
    name: '',
    use: false
};

export default function ModelEdit(state = initialState, action) {

  switch (action.type) {
    case types.ADD_MODEL:
        return Object.assign({}, state, {
            id: action.model.id,
            name: action.model.name
        });
    case types.CLEAR_EDIT_MODEL:
        return Object.assign({}, initialState);
        break;
        case types.UPDATE_EDIT_MODEL:
            return Object.assign({}, state, action.value);
        break;
    default:
        return state;
  }
}