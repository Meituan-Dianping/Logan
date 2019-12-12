package com.meituan.logan.web.service;

import com.meituan.logan.web.model.LoganTaskModel;
import com.meituan.logan.web.model.request.LoganTaskRequest;

import java.util.List;

public interface LoganTaskService {

    List<LoganTaskModel> search(LoganTaskRequest request);

    LoganTaskModel getByTaskId(long taskId);

    long insertTask(LoganTaskModel loganTaskModel);

    List<LoganTaskModel> queryLatest(int limit);
}
