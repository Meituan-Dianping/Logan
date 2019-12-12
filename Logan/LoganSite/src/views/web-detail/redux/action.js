import {flattenDeep, sortBy, reverse} from "lodash";
import {
  fetchWebBriefsApi,
  fetchWebTaskDetailsByDetailIdsApi,
  fetchWebTaskInfoByTaskIdApi,
  fetchWebSingleLogDetailByLogIdApi
} from "../../../common/api";
import {
  WEB_UPDATE_LOG_INFO,
  WEB_UPDATE_BRIEFS,
  WEB_UPDATE_TASK_DETAIL,
  WEB_UPDATE_LOG_DETAIL,
  WEB_UPDATE_HIGH_LIGHT_INDEX,
  WEB_UPDATE_FOCUS_LOG_ID,
  WEB_UPDATE_LOGDETAIL_FILTER_CONDITIONS,
  WEB_UPDATE_LOG_TYPES_IN_TASK,
  WEB_INITIAL_STATE, WEB_UPDATE_SORTED
} from "./reducer";
import {convertBriefsToLoglistInfiniteScrollBriefs} from "../../../common/adapter"
import {getPageOfLogIdsBySingleLogId} from "../../../common/util";


export function fetchPageInitData(taskId, focusLogId) {
  return (dispatch, getState) => {
    // 先请求日志类型、日志基本信息、日志概要列表
    return Promise.all([
      fetchWebTaskInfoByTaskIdApi(taskId),
      fetchWebBriefsApi(taskId)
    ])
      .then(([infoData, briefData]) => {
        briefData = flattenDeep(briefData);

        const briefs = briefData.map(item => ({
          id: item.detailId,
          logType: item.logType,
          logTime: item.logTime
        }));

        let detailIds = [];
        if (briefs.length > 0) {
          if (focusLogId) {
            detailIds = getPageOfLogIdsBySingleLogId(briefs, focusLogId);
          } else {
            detailIds = getPageOfLogIdsBySingleLogId(briefs, briefs[0].id);
          }
        }
        return Promise.all([infoData, briefData, detailIds]);
      })
      .then(([infoData, briefData, detailIds]) => {
        return Promise.all([infoData, briefData, fetchWebTaskDetailsByDetailIdsApi(detailIds.join(','))]);
      })
      .then(([infoData, briefData, detailData]) => {
        const logTypeInTask = [...new Set(briefData.map(brief => brief.logType))];
        dispatch({
          type: WEB_UPDATE_LOG_INFO,
          logInfo: infoData
        });
        dispatch({
          type: WEB_UPDATE_BRIEFS,
          briefs: briefData
        });
        dispatch({
          type: WEB_UPDATE_LOGDETAIL_FILTER_CONDITIONS,
          filterConditions: {
            ...getState().webLogDetail.filterConditions,
            logTypes: logTypeInTask
          }
        });
        dispatch({
          type: WEB_UPDATE_LOG_TYPES_IN_TASK,
          logTypesInTask: logTypeInTask
        });
        dispatch({
          type: WEB_UPDATE_TASK_DETAIL,
          taskDetails: detailData
        });
      });
  };
}

export function updateFocusLogId(focusLogId) {
  console.log(`focusLogId: ${focusLogId}`)
  return (dispatch, getState) => {
    if (focusLogId === -1) {
      dispatch({
        type: WEB_UPDATE_LOG_DETAIL,
        logDetail: null
      });
      dispatch({
        type: WEB_UPDATE_FOCUS_LOG_ID,
        focusLogId: focusLogId
      });
      return;
    } 

    const state = getState();
    const { briefs, taskDetails } = state.webLogDetail;
    const detailIds = getPageOfLogIdsBySingleLogId(convertBriefsToLoglistInfiniteScrollBriefs(briefs, "web"), focusLogId);
    
    if (taskDetails.find(item => item.id === focusLogId) === undefined) {
      return fetchWebTaskDetailsByDetailIdsApi(detailIds.join(","))
        .then(data => {
          dispatch({
            type: WEB_UPDATE_TASK_DETAIL,
            taskDetails: data
          });
        })
        .then(() => {
          return fetchWebSingleLogDetailByLogIdApi(focusLogId);
        })
        .then(data => {
          dispatch({
            type: WEB_UPDATE_LOG_DETAIL,
            logDetail: data
          });
        })
        .then(() => {
          dispatch({
            type: WEB_UPDATE_FOCUS_LOG_ID,
            focusLogId: focusLogId
          });
        })
    } 

    return fetchWebSingleLogDetailByLogIdApi(focusLogId)
      .then(data => {
        dispatch({
          type: WEB_UPDATE_LOG_DETAIL,
          logDetail: data
        });
      })
      .then(() => {
        dispatch({
          type: WEB_UPDATE_FOCUS_LOG_ID,
          focusLogId: focusLogId
        });
      })
    
    
  };
}

export function updateFilterConditions(filterConditions) {
  return (dispatch, getState) => {
    dispatch({
      type: WEB_UPDATE_LOGDETAIL_FILTER_CONDITIONS,
      filterConditions: filterConditions
    });
    const { logInfo } = getState().webLogDetail;
    if (logInfo) {
      return fetchWebBriefsApi(logInfo.taskId, filterConditions.logTypes.join(","), filterConditions.keyword)
        .then(data => {
          let newBriefs = flattenDeep(data);
          dispatch({
            type: WEB_UPDATE_BRIEFS,
            briefs: newBriefs
          });
          return newBriefs;
        }).then(newBriefs => {
          return fetchWebTaskDetailsByDetailIdsApi(newBriefs.map(item => item.detailId).join(","))
        }).then(data => {
          dispatch({
            type: WEB_UPDATE_TASK_DETAIL,
            taskDetails: data
          });
        });
    }
  };
}

export function updateHighLightIndex(start, end) {
  return (dispatch) => {
    dispatch({
      type: WEB_UPDATE_HIGH_LIGHT_INDEX,
      highlightStartIndex: start,
      highlightEndIndex: end
    });
  };
}

export function fetchTaskDetail(detailIds, direction) {
  return (dispatch) => {
    return fetchWebTaskDetailsByDetailIdsApi(detailIds.join(","))
      .then(data => {
        dispatch({
          type: WEB_UPDATE_TASK_DETAIL,
          taskDetails: data,
          direction: direction
        });
      });
  };
}

export function initState() {
  return (dispatch) => {
    dispatch({
      type: WEB_INITIAL_STATE
    })
  }
}

export function updateSorted(sorted) {
  return (dispatch, getState) => {
    dispatch({
      type: WEB_UPDATE_SORTED,
      sorted: sorted
    });

    const { logInfo, filterConditions } = getState().webLogDetail;
    if (logInfo) {
      return fetchWebBriefsApi(logInfo.taskId, filterConditions.logTypes.join(","), filterConditions.keyword)
        .then(briefs => {
          const newBriefs = flattenDeep(briefs);
          let sortedBriefs = [];
          if (sorted) {
            sortedBriefs = sortBy(newBriefs, item => item.detailId);
          } else {
            sortedBriefs = sortBy(newBriefs, item => item.detailId);
            sortedBriefs = reverse(sortedBriefs);
          }
          const detailIds = getPageOfLogIdsBySingleLogId(convertBriefsToLoglistInfiniteScrollBriefs(sortedBriefs, "web"), sortedBriefs[0].detailId);
          return Promise.all([detailIds, sortedBriefs]);
        }).then(([detailIds, sortedBriefs]) => {
          return Promise.all([sortedBriefs, fetchWebTaskDetailsByDetailIdsApi(detailIds.join(","))])
        }).then(([sortedBriefs, data]) => {
          dispatch({
            type: WEB_UPDATE_BRIEFS,
            briefs: sortedBriefs
          });
          dispatch({
            type: WEB_UPDATE_HIGH_LIGHT_INDEX,
            highlightStartIndex: -1,
            highlightEndIndex: -1
          });
          dispatch({
            type: WEB_UPDATE_FOCUS_LOG_ID,
            focusLogId: -1
          });
          dispatch({
            type: WEB_UPDATE_TASK_DETAIL,
            taskDetails: data
          });
        });
    }
  };
}



























