package com.meituan.logan.web.service;

import com.meituan.logan.web.model.LoganLogDetailModel;
import com.meituan.logan.web.model.LoganLogSimpleModel;

import java.util.List;

public interface LoganLogDetailService {

    List<List<LoganLogSimpleModel>> listByTaskIdTypeKeyword(long taskId, List<Integer> type, String keyword);

    List<LoganLogDetailModel> listByDetailIds(List<Long> detailIds);

    LoganLogDetailModel getByDetailId(long detailId);
}
