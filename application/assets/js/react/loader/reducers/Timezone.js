import * as types from '../constants/Types';

const initialState = 'GMT';

export default function Timezone(state = initialState, action) {
    switch (action.type) {
        case types.SELECT_TIMEZONE:
            return action.value ? action.value : initialState;
        default:
            return state;
    }
}