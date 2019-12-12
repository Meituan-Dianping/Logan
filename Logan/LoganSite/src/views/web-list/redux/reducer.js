import {initialState as initState} from "./initial-state";


export const WEB_UPDATE_TASKS = "WEB_UPDATE_TASKS";
export const WEB_UPDATE_FILTER_CONDITIONS = "WEB_UPDATE_FILTER_CONDITIONS";
export const WEB_CHANGE_LOADING = "WEB_CHANGE_LOADING";

export default (state = initState, action) => {
  switch (action.type) {
    case WEB_UPDATE_TASKS:
      return {
        ...state,
        tasks: action.tasks
      };
    case WEB_UPDATE_FILTER_CONDITIONS:
      return {
        ...state,
        filterConditions: action.filterConditions
      };
    case WEB_CHANGE_LOADING:
      return {
        ...state,
        loading: action.loading
      };
    default:
      return state;
  }
};