export const initialState = {
  // meta data of task
  logInfo: null,

  // url of log to download
  logDownloadUrl: "",

  // all valid log types
  logTypes: [],

  // log types in current task
  logTypesInTask: [],

  // briefs of current task
  briefs: [],

  // details in this page of current task
  taskDetails: [],

  // single log detail (related to focus log)
  logDetail: null,

  // focused log id
  focusLogId: -1,

  // start index of taskDetails in infinite scroll view
  highlightStartIndex: -1,

  // end index of taskDetails in infinite scroll view
  highlightEndIndex: -1,

  filterConditions: {
    keyword: "",
    logTypes: [],
  },

  // whether the log should sorted, true stands for ascending order 
  sorted: true
};