import { initialState } from "./initial-state";

export const NATIVE_UPDATE_LOG_INFO = "NATIVE_UPDATE_LOG_INFO";
export const NATIVE_UPDATE_LOG_DOWNLOAD_URL = "NATIVE_UPDATE_LOG_DOWNLOAD_URL";
export const NATIVE_UPDATE_LOG_TYPES = "NATIVE_UPDATE_LOG_TYPES";
export const NATIVE_UPDATE_BRIEFS = "NATIVE_UPDATE_BRIEFS";
export const NATIVE_UPDATE_TASK_DETAIL = "NATIVE_UPDATE_TASK_DETAIL";
export const NATIVE_UPDATE_LOG_DETAIL = "NATIVE_UPDATE_LOG_DETAIL";
export const NATIVE_UPDATE_HIGH_LIGHT_INDEX = "NATIVE_UPDATE_HIGH_LIGHT_INDEX";
export const NATIVE_UPDATE_FOCUS_LOG_ID = "NATIVE_UPDATE_FOCUS_LOG_ID";
export const NATIVE_UPDATE_LOGDETAIL_FILTER_CONDITIONS = "NATIVE_UPDATE_LOGDETAIL_FILTER_CONDITIONS";
export const NATIVE_UPDATE_LOG_TYPES_IN_TASK = "NATIVE_UPDATE_LOG_TYPES_IN_TASK";
export const NATIVE_INITIAL_STATE = "NATIVE_INITIAL_STATE";
export const NATIVE_UPDATE_SORTED = "NATIVE_UPDATE_SORTED";

export default (state = initialState, action) => {
  switch (action.type) {
    case NATIVE_UPDATE_LOG_INFO:
      return {
        ...state,
        logInfo: action.logInfo
      };
    case NATIVE_UPDATE_LOG_DOWNLOAD_URL:
      return {
        ...state,
        logDownloadUrl: action.logDownloadUrl
      };
    case NATIVE_UPDATE_LOG_TYPES:
      return {
        ...state,
        logTypes: action.logTypes
      };
    case NATIVE_UPDATE_BRIEFS:
      return {
        ...state,
        briefs: action.briefs
      };
    case NATIVE_UPDATE_TASK_DETAIL:
      if (action.direction === "up") {
        let taskDetails = action.taskDetails.concat(state.taskDetails);
        let slicedDetails = taskDetails;
        if (taskDetails.length > 150) {
          slicedDetails = taskDetails.slice(0, 150)
        }
        return {
          ...state,
          taskDetails: slicedDetails
        };
      } else if (action.direction === "down") {
        let taskDetails = state.taskDetails.concat(action.taskDetails);
        let slicedDetails = taskDetails;
        if (taskDetails.length > 150) {
          slicedDetails = taskDetails.slice(taskDetails.length - 150, taskDetails.length);
        }
        return {
          ...state,
          taskDetails: slicedDetails
        };
      } else {
        return {
          ...state,
          taskDetails: action.taskDetails
        };
      }
    case NATIVE_UPDATE_LOG_DETAIL:
      return {
        ...state,
        logDetail: action.logDetail
      };
    case NATIVE_UPDATE_HIGH_LIGHT_INDEX:
      return {
        ...state,
        highlightStartIndex: action.highlightStartIndex,
        highlightEndIndex: action.highlightEndIndex
      };
    case NATIVE_UPDATE_FOCUS_LOG_ID:
      return {
        ...state,
        focusLogId: action.focusLogId
      };
    case NATIVE_UPDATE_LOGDETAIL_FILTER_CONDITIONS:
      return {
        ...state,
        filterConditions: action.filterConditions
      };
    case NATIVE_UPDATE_LOG_TYPES_IN_TASK:
      return {
        ...state,
        logTypesInTask: action.logTypesInTask
      };
    case NATIVE_INITIAL_STATE:
      return {
        ...initialState
      };
    case NATIVE_UPDATE_SORTED:
      return {
        ...state,
        sorted: action.sorted
      };
    default:
      return state;
  }
};
