import { initialState } from "./initial-state";

export const WEB_UPDATE_LOG_INFO = "WEB_UPDATE_LOG_INFO";
export const WEB_UPDATE_BRIEFS = "WEB_UPDATE_BRIEFS";
export const WEB_UPDATE_TASK_DETAIL = "WEB_UPDATE_TASK_DETAIL";
export const WEB_UPDATE_LOG_DETAIL = "WEB_UPDATE_LOG_DETAIL";
export const WEB_UPDATE_HIGH_LIGHT_INDEX = "WEB_UPDATE_HIGH_LIGHT_INDEX";
export const WEB_UPDATE_FOCUS_LOG_ID = "WEB_UPDATE_FOCUS_LOG_ID";
export const WEB_UPDATE_LOGDETAIL_FILTER_CONDITIONS = "WEB_UPDATE_LOGDETAIL_FILTER_CONDITIONS";
export const WEB_UPDATE_LOG_TYPES_IN_TASK = "WEB_UPDATE_LOG_TYPES_IN_TASK";
export const WEB_INITIAL_STATE = "WEB_INITIAL_STATE";
export const WEB_UPDATE_SORTED = "WEB_UPDATE_SORTED";

export default (state = initialState, action) => {
  switch (action.type) {
    case WEB_UPDATE_LOG_INFO:
      return {
        ...state,
        logInfo: action.logInfo
      };
    case WEB_UPDATE_BRIEFS:
      return {
        ...state,
        briefs: action.briefs
      };
    case WEB_UPDATE_TASK_DETAIL:
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
    case WEB_UPDATE_LOG_DETAIL:
      return {
        ...state,
        logDetail: action.logDetail
      };
    case WEB_UPDATE_HIGH_LIGHT_INDEX:
      return {
        ...state,
        highlightStartIndex: action.highlightStartIndex,
        highlightEndIndex: action.highlightEndIndex
      };
    case WEB_UPDATE_FOCUS_LOG_ID:
      return {
        ...state,
        focusLogId: action.focusLogId
      };
    case WEB_UPDATE_LOGDETAIL_FILTER_CONDITIONS:
      return {
        ...state,
        filterConditions: action.filterConditions
      };
    case WEB_UPDATE_LOG_TYPES_IN_TASK:
      return {
        ...state,
        logTypesInTask: action.logTypesInTask
      };
    case WEB_INITIAL_STATE:
      return {
        ...initialState
      };
    case WEB_UPDATE_SORTED:
      return {
        ...state,
        sorted: action.sorted
      };
    default:
      return state;
  }
};
