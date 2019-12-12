package com.meituan.logan.web.model.request;

import com.meituan.logan.web.enums.PlatformEnum;
import com.meituan.logan.web.util.DateTimeUtil;
import com.meituan.logan.web.util.TypeSafeUtil;
import lombok.Data;

/**
 * 功能描述:  <p></p>
 *
 * @version 1.0 2019-10-07
 * @since logan-web 1.0
 */
@Data
public class LoganTaskRequest {
    private String deviceId;

    private Long beginTime;

    private Long endTime;

    private Integer platform;

    /**
     * 调整参数
     */
    public void ready() {
        this.platform = TypeSafeUtil.nullToDefault(this.platform, PlatformEnum.ALL.getPlatform());
        this.endTime = TypeSafeUtil.nullToDefault(this.endTime + DateTimeUtil.ONE_DAY, System.currentTimeMillis());
        this.beginTime = TypeSafeUtil.nullToDefault(this.beginTime,
                this.endTime - TypeSafeUtil.SEVEN_DAY);
    }

    public LoganTaskRequest(String deviceId, Long beginTime, Long endTime, Integer platform) {
        this.deviceId = deviceId;
        this.beginTime = beginTime;
        this.endTime = endTime;
        this.platform = platform;
    }
}
