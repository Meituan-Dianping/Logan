import {flattenDeep, sortBy, reverse} from "lodash";
import {
  fetchNativeTaskInfoByTaskIdApi,
  fetchNativeTaskBriefsByTaskIdApi,
  fetchNativeLogTypesApi,
  fetchNativeTaskDetailsByDetailIdsApi,
  fetchNativeSingleLogDetailByLogIdApi,
  fetchNativeDownloadUrlApi
} from "../../../common/api";
import {
  NATIVE_UPDATE_LOG_INFO,
  NATIVE_UPDATE_LOG_DOWNLOAD_URL,
  NATIVE_UPDATE_LOG_TYPES,
  NATIVE_UPDATE_BRIEFS,
  NATIVE_UPDATE_TASK_DETAIL,
  NATIVE_UPDATE_LOG_DETAIL,
  NATIVE_UPDATE_HIGH_LIGHT_INDEX,
  NATIVE_UPDATE_FOCUS_LOG_ID,
  NATIVE_UPDATE_LOGDETAIL_FILTER_CONDITIONS,
  NATIVE_UPDATE_LOG_TYPES_IN_TASK,
  NATIVE_UPDATE_SORTED,
  NATIVE_INITIAL_STATE
} from "./reducer";

import {getPageOfLogIdsBySingleLogId} from "../../../common/util";
import {convertBriefsToLoglistInfiniteScrollBriefs} from "../../../common/adapter";



export function fetchPageInitData(taskId, focusLogId) {
  return (dispatch, getState) => {
    return Promise.all([
      fetchNativeTaskInfoByTaskIdApi(taskId),
      fetchNativeLogTypesApi(),
      fetchNativeTaskBriefsByTaskIdApi(taskId)
    ])
      .then(([infoData, logTypeData, briefData]) => {
        // flatten the briefData
        briefData = flattenDeep(briefData);
        let detailIds = [];
        if (briefData.length > 0) {
          if (focusLogId) {
            detailIds = getPageOfLogIdsBySingleLogId(briefData, focusLogId);
          } else {
            detailIds = getPageOfLogIdsBySingleLogId(briefData, briefData[0].id);
          }
        }
        return Promise.all([infoData, logTypeData, briefData, detailIds])
      })
      .then(([infoData, logTypeData, briefData,detailIds]) => {
        return Promise.all([infoData, logTypeData, briefData, fetchNativeTaskDetailsByDetailIdsApi(detailIds.join(','))])
      })
      .then(([infoData, logTypeData, briefData, detailData]) => {
        const logTypeInTask = [...new Set(briefData.map(brief => brief.logType))];
        dispatch({
          type: NATIVE_UPDATE_LOG_INFO,
          logInfo: infoData
        });
        dispatch({
          type: NATIVE_UPDATE_LOG_TYPES,
          logTypes: logTypeData
        });
        dispatch({
          type: NATIVE_UPDATE_BRIEFS,
          briefs: briefData
        });
        // initialized filterConditions to make sure the logTypes all selected
        dispatch({
          type: NATIVE_UPDATE_LOGDETAIL_FILTER_CONDITIONS,
          filterConditions: {
            ...getState().nativeLogDetail.filterConditions,
            logTypes: logTypeInTask
          }
        });
        dispatch({
          type: NATIVE_UPDATE_LOG_TYPES_IN_TASK,
          logTypesInTask: logTypeInTask
        });
        dispatch({
          type: NATIVE_UPDATE_TASK_DETAIL,
          taskDetails: detailData
        });
      })
  };
}

export function updateFocusLogId(focusLogId) {
  return (dispatch, getState) => {


    if (focusLogId === -1) {
      dispatch({
        type: NATIVE_UPDATE_LOG_DETAIL,
        logDetail: null
      });
      dispatch({
        type: NATIVE_UPDATE_FOCUS_LOG_ID,
        focusLogId: focusLogId
      });
    } else {
      const state = getState();
      const { briefs, taskDetails } = state.nativeLogDetail;
      const detailIds = getPageOfLogIdsBySingleLogId(briefs, focusLogId);

      // 查找新的focusLogId是否已经从服务器加载，如果已加载，则忽略，如果未加载，则加载。
      if (taskDetails.find(item => item.id === focusLogId) === undefined) {
        return fetchNativeTaskDetailsByDetailIdsApi(detailIds.join(","))
          .then(data => {
            dispatch({
              type: NATIVE_UPDATE_TASK_DETAIL,
              taskDetails: data
            });
          })
          .then(() => {
            return fetchNativeSingleLogDetailByLogIdApi(focusLogId);
          })
          .then(data => {
            dispatch({
              type: NATIVE_UPDATE_LOG_DETAIL,
              logDetail: data
            });
          }).then(() => {
            dispatch({
              type: NATIVE_UPDATE_FOCUS_LOG_ID,
              focusLogId: focusLogId
            });
          })
      } else {
        return fetchNativeSingleLogDetailByLogIdApi(focusLogId)
          .then(data => {
            dispatch({
              type: NATIVE_UPDATE_LOG_DETAIL,
              logDetail: data
            });
          })
          .then(() => {
            dispatch({
              type: NATIVE_UPDATE_FOCUS_LOG_ID,
              focusLogId: focusLogId
            });
          })
      }
    }
  };
}

export function updateFilterConditions(filterConditions) {
  return (dispatch, getState) => {
    dispatch({
      type: NATIVE_UPDATE_LOGDETAIL_FILTER_CONDITIONS,
      filterConditions: filterConditions
    });
    const { logInfo } = getState().nativeLogDetail;
    if (logInfo) {
      return fetchNativeTaskBriefsByTaskIdApi(logInfo.taskId, filterConditions.logTypes.join(","), filterConditions.keyword)
        .then(data => {
          const newBriefs  = flattenDeep(data);
          dispatch({
            type: NATIVE_UPDATE_BRIEFS,
            briefs: newBriefs
          });
          return newBriefs;
        })
        .then(newBriefs => {
          return fetchNativeTaskDetailsByDetailIdsApi(newBriefs.map(item => item.id).join(","));
        })
        .then(data => {
          dispatch({
            type: NATIVE_UPDATE_TASK_DETAIL,
            taskDetails: data
          });
        });
    }
  };
}

export function updateHighLightIndex(start, end) {
  return (dispatch) => {
    dispatch({
      type: NATIVE_UPDATE_HIGH_LIGHT_INDEX,
      highlightStartIndex: start,
      highlightEndIndex: end
    });
  };
}

export function fetchDownloadUrl(taskId) {
  return (dispatch) => {
    return fetchNativeDownloadUrlApi(taskId)
      .then(data => {
        dispatch({
          type: NATIVE_UPDATE_LOG_DOWNLOAD_URL,
          logDownloadUrl: data
        });
      });
  };
}

export function fetchTaskDetail(detailIds, direction) {
  return (dispatch) => {
    return fetchNativeTaskDetailsByDetailIdsApi(detailIds.join(","))
      .then(data => {
        dispatch({
          type: NATIVE_UPDATE_TASK_DETAIL,
          taskDetails: data,
          direction: direction
        });
      });
  };
}

export function initState() {
  return (dispatch) => {
    dispatch({
      type: NATIVE_INITIAL_STATE
    })
  }
}

export function updateSorted(sorted) {
  return (dispatch, getState) => {
    dispatch({
      type: NATIVE_UPDATE_SORTED,
      sorted: sorted
    });

    const { logInfo, filterConditions } = getState().nativeLogDetail;
    if (logInfo) {
      return fetchNativeTaskBriefsByTaskIdApi(logInfo.taskId, filterConditions.logTypes.join(","), filterConditions.keyword)
        .then(briefs => {
          const newBriefs = flattenDeep(briefs);
          let sortedBriefs = [];
          if (sorted) {
            sortedBriefs = sortBy(newBriefs, item => item.id);
          } else {
            sortedBriefs = sortBy(newBriefs, item => item.id);
            sortedBriefs = reverse(sortedBriefs);
          }
          const detailIds = getPageOfLogIdsBySingleLogId(convertBriefsToLoglistInfiniteScrollBriefs(sortedBriefs, "native"), sortedBriefs[0].id);
          return Promise.all([detailIds, sortedBriefs]);
        }).then(([detailIds, sortedBriefs]) => {
          return Promise.all([sortedBriefs, fetchNativeTaskDetailsByDetailIdsApi(detailIds.join(","))])
        }).then(([sortedBriefs, data]) => {
          dispatch({
            type: NATIVE_UPDATE_BRIEFS,
            briefs: sortedBriefs
          });
          dispatch({
            type: NATIVE_UPDATE_HIGH_LIGHT_INDEX,
            highlightStartIndex: -1,
            highlightEndIndex: -1
          });
          dispatch({
            type: NATIVE_UPDATE_FOCUS_LOG_ID,
            focusLogId: -1
          });
          dispatch({
            type: NATIVE_UPDATE_TASK_DETAIL,
            taskDetails: data
          });
        });
    }
  };
}





