import * as types from '../constants/Types';
import axios from 'axios';
import qs from 'qs'
import moment from 'moment-timezone'

// check login OK
axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Select host
 * @param {*} host
 */
export function selectHost(host)
{
    return { type: types.SELECT_HOST, value: host };
}

/**
 * Select category (tab)
 * @param {*} category 
 */
export function selectCategory(category)
{
    return { type: types.SELECT_CATEGORY, value: category };
}

/**
 * Select category (tab)
 * @param {*} category 
 */
export function selectTimezone(timezone)
{
    return { type: types.SELECT_TIMEZONE, value: timezone };
}

/*                 BRAND - API             */

export function OnClickBrand(data) {
    return function(dispatch, getState) {
        const { Host } = getState();
        const config = { headers: { 'X-Requested-With': 'XMLHttpRequest' } };

        dispatch({ type: types.SELECTED_BRAND, value: data });
        dispatch(unSelectAllVideo());
        dispatch(BrandVideoList(data.id, false));
    }
}

export function OnChangeInputDealerSearch(Value) {

    return { type: types.SEARCH_BRAND, value: Value };
}

export function BrandList(catId, callback) {

    return function (dispatch, getState) {
        const { Host } = getState();
        const config = { headers: { 'X-Requested-With': 'XMLHttpRequest' } };

        axios.get( `${Host}adverts/brandList/${catId}`, config)
            .then(function (response) {
                if (response.data.error) {
                    throw new Error(response.data.error);
                }
                dispatch({
                    type: types.BRAND_LIST,
                    BrandList: response.data.list,
                    lastError: null
                })
                if (callback) {
                    callback(response.data.list);
                }
            })
            .catch(function (error) {
                dispatch({
                    type: types.BRAND_LIST,
                    BrandList: [],
                    lastError: error
                })
            });
    };
}

/* VIDEO FILTER API */

export function updateVideoFilter(data) {
    return { type: types.UPDATE_VIDEO_FILTER, value: data };
}

export function clearVideoFilter() {
    return { type: types.CLEAR_VIDEO_FILTER };
}

/*  VIDEO LIST API */

export function videoListSortChange(sortField, sortOrder) {
    return { type: types.VIDEO_LIST_SORT_CHANGE, value: { sortField, sortOrder } };
}

export function videoListPageChange(page) {
    return { type: types.VIDEO_LIST_PAGE_CHANGE, value: page };
}

export function videoListPageSizeChange(pageSize) {
    return { type: types.VIDEO_LIST_PAGE_SIZE_CHANGE, value: pageSize };
}

export function chooseBrandVideo(data) {

    return { type: types.CHOOSE_VIDEO, value: data };
}

export function clearChosenVideo() {

    return { type: types.CLEAR_CHOSEN_VIDEO };
}

export function updateChosenVideo(data) {

    return { type: types.UPDATE_CHOSEN_VIDEO, value: data };
}

export function selectVideo(id) {
    return { type: types.SELECT_VIDEO, value: id };
}

export function unSelectVideo(id) {
    return { type: types.UNSELECT_VIDEO, value: id };
}

export function selectAllVideo() {
    return function (dispatch, getState) {
        let { BrandVideo: { BrandVideoList: { Data: data }, SelectBrandVideo: { list } } } = getState();

        dispatch(selectVideo(list.concat(data.map(v => v.id))));
        dispatch({ type: types.SELECT_ALL_VIDEO });
    }
}

export function unSelectAllVideo() {
    return function (dispatch, getState) {
        let { BrandVideo: { BrandVideoList: { Data: data }, SelectBrandVideo: { list } } } = getState();

        dispatch(unSelectVideo(list.concat(data.map(v => v.id))));
        dispatch({ type: types.UNSELECT_ALL_VIDEO });
    }
}

export function BrandVideoList(propId, keepChoose = false, callback) {

    return function (dispatch, getState) {
        const config = { headers: { 'X-Requested-With': 'XMLHttpRequest' } };
        const {
            Host,
            Timezone: timezone,
            Category: category,
            BrandVideo: {
                BrandVideoList: { sortField, sortOrder, page, sizePerPage },
                VideoFilter: VideoFilter,
                ChosenBrandVideo: advert,
                SelectBrandVideo: {all}
            }
        } = getState();
        const timeFormat = 'MM-DD-YYYY HH:mm:ss';
        const currentTimezone = moment.tz.guess();

        let filter = Object.assign({}, VideoFilter);
        /**
         * We change timestamp to make it looks like it would be if we use server timezone
         */
        if (filter.startDate) {
            filter.startDate = moment.tz(moment.tz(filter.startDate*1000, currentTimezone).startOf('day').format(timeFormat), timeFormat, timezone).unix();
        }
        if (filter.endDate) {
            filter.endDate = moment.tz(moment.tz(filter.endDate*1000, currentTimezone).endOf('day').format(timeFormat), timeFormat, timezone).unix();
        }

        config.params = {
            sort: sortField,
            dir: sortOrder,
            page: page,
            limit: sizePerPage,
            filter: JSON.stringify(filter)
        };

        dispatch({ type: types.LOADING_VIDEO_LIST });

        axios.get(`${Host}adverts/advertList/${category}/${propId}`, config)
            .then(function (response) {
                if (response.data.error) {
                    throw new Error(response.data.error);
                }
                dispatch({
                    type: types.MODEL_LIST,
                    list: response.data.models,
                    lastError: ''
                });

                response.data.list.data.forEach((advert) => {
                    if (advert.startDate) {
                        advert.startDate = moment.tz(moment.tz(advert.startDate*1000, timezone).format(timeFormat), timeFormat, currentTimezone).unix();
                    }
                    if (advert.endDate) {
                        advert.endDate = moment.tz(moment.tz(advert.endDate*1000, timezone).format(timeFormat), timeFormat, currentTimezone).unix();
                    }
                });
                dispatch({
                    type: types.VIDEO_LIST,
                    list: response.data.list.data,
                    total: response.data.list.total,
                    page: response.data.list.page,
                    limit: response.data.list.limit,
                    lastError: ''
                });

                if (keepChoose &&response.data.list.data.filter((item) => item.id == advert.id).length) {
                    dispatch(chooseBrandVideo(advert));
                } else {
                    dispatch(clearChosenVideo());
                }

                if (all) {
                    dispatch(selectAllVideo());
                }

                if (callback) {
                    callback(response.data.list);
                }
            })
            .catch(function (error) {
                alert(error);
                dispatch({
                    type: types.VIDEO_LIST,
                    list: [],
                    total: 0,
                    page: 0,
                    limit: 10,
                    lastError: error
                });
            });
    };
}

export function updateVideoFile(callback) {
    return function (dispatch, getState) {
        const { Host, Timezone: timezone, Category: category, Brand: {SelectedBrand: {id: brand}}, BrandVideo: { ChosenBrandVideo: advert } } = getState();
        const config = { headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded'
        }};
        const timeFormat = 'MM-DD-YYYY HH:mm:ss';
        const currentTimezone = moment.tz.guess();

        let data = {
            brand: brand,
            category: category,
            advert: Object.assign({}, advert)
        }
        if (data.advert.startDate) {
            data.advert.startDate = moment.tz(moment.tz(data.advert.startDate*1000, currentTimezone).format(timeFormat), timeFormat, timezone).unix();
        }
        if (data.advert.endDate) {
            data.advert.endDate = moment.tz(moment.tz(data.advert.endDate*1000, currentTimezone).format(timeFormat), timeFormat, timezone).unix();
        }

        axios.post( `${Host}adverts/uploadAdvert`, qs.stringify(data), config)
            .then(function ({ data }) {
                if (data.error) {
                    throw new Error(data.error);
                }

                if (data.advert.startDate) {
                    data.advert.startDate = moment.tz(moment.tz(data.advert.startDate*1000, timezone).format(timeFormat), timeFormat, currentTimezone).unix();
                }
                if (data.advert.endDate) {
                    data.advert.endDate = moment.tz(moment.tz(data.advert.endDate*1000, timezone).format(timeFormat), timeFormat, currentTimezone).unix();
                }

                dispatch({
                    type: types.UPDATE_CHOSEN_VIDEO,
                    value: data.advert
                });

                dispatch(BrandVideoList(brand, true, () => {
                    if (callback) {
                        callback(data.advert);
                    }
                }));
            })
            .catch(function (error) {
                alert('Error! ' + error.message);
            });
    };
}
/*=========================== ACTIONS =====================================*/

export function adsAction(action, keepChoose, callback) {
    return function (dispatch, getState) {
        const { Host,
            Category: category,
            Brand: {SelectedBrand: {id: brandId}},
            BrandVideo: {SelectBrandVideo: {all, list}}
        } = getState();
        const config = { headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded'
         }};
         dispatch({ type: types.LOADING_VIDEO_LIST });
        axios.post(`${Host}adverts/advertAction/${action}`, qs.stringify({
            all,
            list: all ? null : list,
            category,
            propId: brandId
        }), config)
            .then(function (data) {
                if (data.error) {
                    throw new Error(data.error);
                }

                dispatch(BrandVideoList(brandId, keepChoose, callback));
            })
            .catch(function (error) {
                alert('Error!');
            });
    };
}

/*===========================MODEL NAME=====================================*/

export function resetEditedModel() {
    return { type: types.CLEAR_EDIT_MODEL };
}
export function updateModelName(name) {
    return { type: types.UPDATE_EDIT_MODEL, value: name };
}

/**
 * save model name
 * @param {*} data 
 */
export function addModelName(id = null, name, callback, error) {

    return function (dispatch, getState) {
        const { Host, Category: category, Brand: {SelectedBrand: {id: brandId}} } = getState();
        const config = { headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded'
         }};

        let val = {
            'category': parseInt(category, 10),
            'brand': parseInt(brandId, 10),
            'model': { id, name }
        };
        axios.post(`${Host}adverts/addModel`, qs.stringify(val), config)
            .then(function (response) {
                if (response.data.error) {
                    throw new Error(response.data.error);
                }
                if (id) {
                    dispatch({
                        type: types.EDIT_MODEL,
                        model: response.data.model,
                        lastError: null
                    });
                } else {
                    dispatch({
                        type: types.ADD_MODEL,
                        model: response.data.model,
                        lastError: null
                    });
                }

                if (callback) {
                    callback(response.data.model);
                }
            })
            .catch(function (e) {
                if (error) {
                    error(e);
                } else {
                    alert(e);
                }
            });
    };
}

export function delModelName(id, callback, error) {
    return function (dispatch, getState) {
        const { Host } = getState();
        const config = { headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded'
         }};

        axios.delete(`${Host}adverts/delModel/${id}`, config)
            .then(function (response) {
                if (response.data.error) {
                    throw new Error(response.data.error);
                }
                dispatch({
                    type: types.DEL_MODEL,
                    id: id,
                    lastError: null
                });

                if (callback) {
                    callback();
                }
            })
            .catch(function (e) {
                if (error) {
                    error(e);
                } else {
                    alert(e);
                }
            });
    };
}