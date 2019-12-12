import axios from "axios";
import { message } from 'antd';

const BASE_URL = process.defineEnv.API_BASE_URL;
const API_TIME_OUT = 30000;
let pendingRequests = [];

// axios instance
const instance = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIME_OUT,
  withCredentials: true
});


// Native Apis

export function fetchNativeListInitData() {
  return instance.get("/logan/latest.json");
}

export function fetchNativeTaskApi(deviceId, platform, beginTime, endTime) {
  console.log( { deviceId, platform, beginTime, endTime })
  return instance.get("/logan/task/search.json", {
    params: {
      deviceId,
      platform,
      beginTime,
      endTime
    }
  });
}

export function fetchNativeTaskInfoByTaskIdApi(taskId) {
  return instance.get(`/logan/task/${taskId}/info.json`);
}

export function fetchNativeLogTypesApi() {
  return instance.get("/logan/meta/logtypes.json");
}

export function fetchNativeTaskBriefsByTaskIdApi(taskId, logTypes, keyword) {
  return instance.get(`/logan/task/${taskId}/brief.json`, {
    params: {
      logTypes,
      keyword
    }
  });
}

export function fetchNativeTaskDetailsByDetailIdsApi(detailIds) {
  return instance.get("/logan/task/query/details.json", {
    params: {
      detailIds: detailIds
    }
  });
}

export function fetchNativeSingleLogDetailByLogIdApi(logId) {
  return instance.get(`/logan/task/${logId}/detail.json`);
}

export function fetchNativeDownloadUrlApi(taskId) {
  return instance.get(`/logan/task/${taskId}/download.json`);
}


// Web apis


export function fetchWebDownloadUrlApi(tasks) {
  return instance.get("/logan/web/getDownLoadUrl.json", {
    params: {
      tasks: tasks
    }
  })
}

export function fetchWebListInitData() {
  return instance.get("/logan/web/latest.json");
}

export function fetchWebTaskApi(deviceId, beginTime, endTime) {
  return instance.get("/logan/web/search.json", {
    params: {
      deviceId,
      beginTime,
      endTime
    }
  })
}

export function fetchWebBriefsApi(taskId, logTypes, keyword) {
  return instance.get("/logan/web/detailIndex.json", {
    params: {
      tasks: taskId,
      logTypes: logTypes,
      keyword: keyword,
      beginTime: null,
      endTime: null
    }
  })
}

export function fetchWebTaskDetailsByDetailIdsApi(detailIds) {
  return instance.get("/logan/web/details.json", {
    params: {
      detailIds
    }
  })
}

export function fetchWebTaskInfoByTaskIdApi(taskId) {
  return instance.get("/logan/web/taskDetail.json", {
    params: {
      tasks: taskId
    }
  })
}

export function fetchWebSingleLogDetailByLogIdApi(detailId) {
  return instance.get("/logan/web/logDetail.json", {
    params: {
      detailId
    }
  })
}


// private request configs

const RemovePendingRequest = (config) => {
  pendingRequests.forEach((request, idx) => {
    if (request.id === config.url + '&' + config.method) {
      request.cancel();
      pendingRequests.splice(idx, 1);
    }
  });
};

const AddPendingRequest = (config) => {
  return new axios.CancelToken(c => {
    pendingRequests.push({
      id: config.url + '&' + config.method,
      cancel: c
    });
  });
};

instance.interceptors.request.use((config) => {
  if (config.headers.cancelOthers) {
    delete config.headers.cancelOthers;
    RemovePendingRequest(config);
    config.cancelToken = AddPendingRequest(config);
  }
  if (config.headers.removeXRequestedWith) {
    delete config.headers.removeXRequestedWith;
    delete config.headers['X-Requested-With'];
  }
  return config;
});

function onRequestFulfilled(response) {
  RemovePendingRequest(response.config);
  let {code, msg, data} = response.data;
  if (Number(code) !== 200) {
    message.warning(`请求出错：${msg}`);
    return Promise.reject(response.data);
  }
  return data;
}

function onRequestRejected(error) {
  if (!error.request) {
    return null;
  }
  let status = error.response && error.response.status;
  message.error(`请求出错${status || error.message}`);
  return Promise.reject(error);
}

instance.interceptors.response.use(onRequestFulfilled, onRequestRejected);



