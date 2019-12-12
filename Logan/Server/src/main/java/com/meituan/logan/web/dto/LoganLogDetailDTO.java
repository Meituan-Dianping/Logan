package com.meituan.logan.web.dto;

import com.meituan.logan.web.model.LoganLogDetailModel;
import com.meituan.logan.web.model.LoganLogSimpleModel;
import lombok.Data;

import java.util.Date;

/**
 * @since 2019-10-14 15:22
 * @since logan-web 1.0
 */
@Data
public class LoganLogDetailDTO implements Comparable<LoganLogDetailDTO> {

    private long id;

    private long taskId;

    private int logType;

    private String content;

    private long logTime;

    private Date addTime;

    private Date updateTime;

    @Override
    public int compareTo(LoganLogDetailDTO o) {
        if (null == o) {
            return 0;
        }
        return id - o.getId() > 0 ? 1 : -1;
    }

    public LoganLogDetailModel transformToModel() {
        LoganLogDetailModel model = new LoganLogDetailModel();
        model.setId(id);
        model.setTaskId(taskId);
        model.setLogType(logType);
        model.setContent(content);
        model.setLogTime(logTime);
        return model;
    }

    public LoganLogSimpleModel transformToSimple() {
        LoganLogSimpleModel model = new LoganLogSimpleModel();
        model.setId(id);
        model.setLogType(logType);
        model.setLogTime(logTime);
        return model;
    }
}
