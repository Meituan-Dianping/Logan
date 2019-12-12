package com.meituan.logan.web.dto;

import com.meituan.logan.web.model.LoganTaskModel;
import lombok.Data;

import java.util.Date;

/**
 * @since 2019-10-14 15:22
 * @since logan-web 1.0
 */
@Data
public class LoganTaskDTO implements Comparable<LoganTaskDTO> {

    private long id;

    private String amount;

    private String appId;

    private String unionId;

    private int platform;

    private String buildVersion;

    private String appVersion;

    private String deviceId;

    private long logDate;

    private String logFileName;

    private long addTime;

    private int status;

    private Date updateTime;

    @Override
    public int compareTo(LoganTaskDTO o) {
        if (null == o) {
            return 0;
        }
        if (logDate == o.logDate) {
            return id < o.getId() ? 1 : -1;
        }
        return logDate < o.getLogDate() ? 1 : -1;
    }

    public LoganTaskModel transformToModel() {
        LoganTaskModel result = new LoganTaskModel();
        result.setTaskId(id);
        result.setAmount(amount);
        result.setAppId(appId);
        result.setUnionId(unionId);
        result.setBuildVersion(buildVersion);
        result.setAppVersion(appVersion);
        result.setDeviceId(deviceId);
        result.setPlatform(platform);
        result.setLogDate(logDate);
        result.setLogFileName(logFileName);
        result.setAddTime(addTime);
        result.setStatus(status);
        return result;
    }
}
