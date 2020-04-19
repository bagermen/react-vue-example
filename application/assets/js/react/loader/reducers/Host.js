import * as types from '../constants/Types';

const initialState = '';

export default function Host(state = initialState, action) {
    switch (action.type) {
        case types.SELECT_HOST:
            return action.value ? action.value : initialState;
        default:
            return state;
    }
}