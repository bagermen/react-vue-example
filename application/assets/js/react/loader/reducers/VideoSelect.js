import * as types from '../constants/Types';

const initialState = {
    list: [],
    all: false
};

export default function VideoSelect(state = initialState, action) {

    switch (action.type) {
        case types.SELECT_VIDEO:
            let selected = (action.value instanceof Array ? action.value : [action.value])
                .filter((v) => state.list.indexOf(v) === -1);

            if (!selected.length) {
                return state;
            }

            return Object.assign({}, state, {
                list: state.list.concat(selected)
            });
        case types.UNSELECT_VIDEO:
            let unselected = (action.value instanceof Array ? action.value : [action.value])
                .filter((v) => state.list.indexOf(v) > -1)

            if (!unselected.length) {
                return state;
            }

            return Object.assign({}, state, {
                list: state.list.filter(v => unselected.indexOf(v) === -1)
            });
            break;
        case types.SELECT_ALL_VIDEO:
            return Object.assign({}, state, {
                all: true
            });
            break;
        case types.UNSELECT_ALL_VIDEO:
            return Object.assign({}, state, {
                list: [],
                all: false
            });
            break;
        default:
            return state;
    }
}