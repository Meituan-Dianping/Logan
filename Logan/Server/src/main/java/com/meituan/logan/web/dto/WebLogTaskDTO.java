package com.meituan.logan.web.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.util.Date;

/**
 * 功能描述:  <p></p>
 *
 * @version 1.0 2019-10-30
 * @since logan-web 1.0
 */
@Data
public class WebLogTaskDTO implements Comparable<WebLogTaskDTO> {
    private long taskId;

    /**
     * 设备标示
     */
    private String deviceId;

    /**
     * 来源
     */
    private String webSource;

    /**
     * 环境信息
     */
    private String environment;

    private int pageNum;

    @JsonIgnore
    private String content;

    /**
     * 日志上报时间
     */
    private long addTime = System.currentTimeMillis();

    /**
     * 日志所属天
     */
    private long logDate;

    /**
     * 0:未解析过，1：解析过
     */
    private int status = 0;

    /**
     * 客户端上报元信息
     */
    private String customReportInfo;

    /**
     * 汇集多个taskId为一个task组
     */
    private String tasks;

    private Date updateTime;

    @Override
    public int compareTo(WebLogTaskDTO o) {
        if (null == o) {
            return 0;
        }
        return this.pageNum - o.getPageNum();
    }
}
