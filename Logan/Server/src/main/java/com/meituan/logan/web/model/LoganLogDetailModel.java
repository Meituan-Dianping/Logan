package com.meituan.logan.web.model;

import lombok.Data;

/**
 * 功能描述:  <p></p>
 *
 *
 * @version 1.0 2019-10-07
 * @since logan-web 1.0
 */
@Data
public class LoganLogDetailModel {
    private long id;

    private long taskId;

    private int logType;

    /**
     * 原始日志
     */
    private String content;

    /**
     * 日志摘要
     */
    private String simpleContent;
    /**
     * 日志详情
     */
    private String formatContent;

    private long logTime;
}
