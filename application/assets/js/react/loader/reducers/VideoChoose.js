import * as types from '../constants/Types';

const initialState = {
    id: null,
    dispName: '',
    startDate: null,
    endDate: null,
    description: '',
    selectVal: 0,
    year: '',
    seasonal: '',
    metaData: '',
    file_id: null,
    active: null,
    fileName: '',
    tags: []
};

export default function VideoEdit(state = initialState, action) {

    switch (action.type) {
        case types.CHOOSE_VIDEO:
            if (typeof action.value === 'object') {
                return Object.assign({}, initialState, action.value);
            } else {
                return state;
            }
            break;
        case types.CLEAR_CHOSEN_VIDEO:
            return Object.assign({}, initialState);
            break;
        case types.UPDATE_CHOSEN_VIDEO:
            return Object.assign({}, state, action.value);
            break;
        default:
            return state;
    }
}