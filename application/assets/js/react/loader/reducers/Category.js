import * as types from '../constants/Types';

const initialState = 0;

export default function Category(state = initialState, action) {
    switch (action.type) {
        case types.SELECT_CATEGORY:
            return action.value;
        default:
            return state;
    }
}