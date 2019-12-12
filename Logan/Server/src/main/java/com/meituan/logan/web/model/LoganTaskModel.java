package com.meituan.logan.web.model;

import com.meituan.logan.web.dto.LoganTaskDTO;
import com.meituan.logan.web.enums.TaskStatusEnum;
import lombok.Data;

/**
 * 功能描述:  <p></p>
 *
 * @version 1.0 2019-10-07
 * @since logan-web 1.0
 */
@Data
public class LoganTaskModel {

    private long taskId;

    private String amount;

    private String appId;

    private String unionId;

    private int platform;

    private String buildVersion;

    private String appVersion;

    private String deviceId;
    /**
     * 日志所属天
     */
    private long logDate;
    /**
     * 文件名
     */
    private String logFileName;
    /**
     * 日志上报时间
     */
    private long addTime;
    /**
     * 0 : 未分析过，1 : 已分析过
     */
    private int status;

    public LoganTaskDTO transformToDto() {
        LoganTaskDTO dto = new LoganTaskDTO();
        dto.setAmount(amount);
        dto.setAppId(appId);
        dto.setUnionId(unionId);
        dto.setBuildVersion(buildVersion);
        dto.setPlatform(platform);
        dto.setAppVersion(appVersion);
        dto.setDeviceId(deviceId);
        dto.setLogFileName(logFileName);
        dto.setAddTime(addTime);
        dto.setLogDate(logDate);
        dto.setStatus(TaskStatusEnum.NORMAL.getStatus());
        return dto;
    }
}
