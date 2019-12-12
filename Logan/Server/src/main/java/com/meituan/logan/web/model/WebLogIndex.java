package com.meituan.logan.web.model;

import lombok.Data;

import java.io.Serializable;

/**
 * 功能描述:  <p></p>
 *
 *
 * @version 1.0 2019-11-08
 * @since logan-web 1.0
 */
@Data
public class WebLogIndex implements Serializable {

    private long detailId;

    private int logType;

    private long logTime;

    public WebLogIndex(long detailId, int logType, long logTime){
        this.detailId = detailId;
        this.logTime = logTime;
        this.logType = logType;
    }
}
