import {
  NATIVE_UPDATE_FILTER_CONDITIONS,
  NATIVE_UPDATE_TASKS,
  NATIVE_CHANGE_LOADING
} from "./reducer";
import {fetchNativeTaskApi, fetchNativeListInitData} from "../../../common/api";

export function fetchInitData() {
  return (dispatch) => {
    return fetchNativeListInitData()
      .then(data => {
        dispatch({
          type: NATIVE_UPDATE_TASKS,
          tasks: data
        })
      })
  }
}

export function updateFilterConditions(newFilterConditions) {
  return (dispatch, getState) => {
    dispatch({
      type: NATIVE_UPDATE_FILTER_CONDITIONS,
      filterConditions: newFilterConditions
    });
  };
}

export function changeLoading(loading) {
  return (dispatch, getState) => {
    dispatch({
      type: NATIVE_CHANGE_LOADING,
      loading: loading
    });
  };
}

export function fetchTasks({deviceId, platform, beginTime, endTime}) {
  return (dispatch, getState) => {
    return fetchNativeTaskApi(deviceId, platform, beginTime, endTime)
      .then(data => {
        dispatch({
          type: NATIVE_UPDATE_TASKS,
          tasks: data
        });
      })
  };
}
