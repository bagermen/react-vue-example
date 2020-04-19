import * as types from '../constants/Types';

const initialState = {
    Data: [],
    loading: false,
    page: 1,
    sizePerPage: 10,
    lastError: null,
    sortField: "dispName",
    sortOrder: "asc",
    totalSize: 0,
    selected: []
};

export default function VideoList(state = initialState, action) {

    switch (action.type) {
        case types.VIDEO_LIST_SORT_CHANGE:
            return Object.assign({}, state, {
                sortField: action.value.sortField,
                sortOrder: action.value.sortOrder
            });
            break;
        case types.VIDEO_LIST_PAGE_SIZE_CHANGE:
            return Object.assign({}, state, {
                sizePerPage: action.value
            });
            break;
        case types.VIDEO_LIST_PAGE_CHANGE:
            return Object.assign({}, state, {
                page: action.value
            });
            break;
        case types.LOADING_VIDEO_LIST:
            return Object.assign({}, state, {
                loading: true
            });
            break;
        case types.STOP_LOADING_VIDEO_LIST:
            return Object.assign({}, state, {
                loading: false
            });
        case types.VIDEO_LIST:
            return Object.assign({}, state, {
                Data: action.list,
                page: action.page,
                sizePerPage: action.limit,
                totalSize: action.total,
                loading: false,
                lastError: action.lastError
            });
        default:
            return state;
    }
}