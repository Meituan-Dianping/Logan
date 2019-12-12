import {initialState} from "./initial-state";


export const NATIVE_UPDATE_TASKS = "NATIVE_UPDATE_TASKS";
export const NATIVE_UPDATE_FILTER_CONDITIONS = "NATIVE_UPDATE_FILTER_CONDITIONS";
export const NATIVE_CHANGE_LOADING = "NATIVE_CHANGE_LOADING";

export default (state = initialState, action) => {
  switch (action.type) {
    case NATIVE_UPDATE_TASKS:
      return {
        ...state,
        tasks: action.tasks
      };
    case NATIVE_UPDATE_FILTER_CONDITIONS:
      return {
        ...state,
        filterConditions: action.filterConditions
      };
    case NATIVE_CHANGE_LOADING:
      return {
        ...state,
        loading: action.loading
      };
    default:
      return state;
  }
};
