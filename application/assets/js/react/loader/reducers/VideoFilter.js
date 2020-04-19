import * as types from '../constants/Types';

const initialState = {
    dispName: "",
    selectVal: 0,
    startDate: null,
    endDate: null,
    active: true,
    tags: []
};

const initial = Object.assign({}, initialState);

export default function VideoFilter(state = initial, action) {

  switch (action.type) {
    case types.CLEAR_VIDEO_FILTER:
        return Object.assign({}, initialState);
        break;
        case types.UPDATE_VIDEO_FILTER:
            let result = Object.assign({}, state, action.value);


            if (!result.selectVal) {
                result.selectVal = initial.selectVal;
            }
            return result;
        break;
    default:
        return state;
  }
}