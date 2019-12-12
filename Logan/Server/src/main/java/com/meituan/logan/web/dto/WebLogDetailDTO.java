package com.meituan.logan.web.dto;

import lombok.Data;

/**
 * 功能描述:  <p></p>
 *
 * @version 1.0 2019-10-31
 * @since logan-web 1.0
 */
@Data
public class WebLogDetailDTO implements Comparable<WebLogDetailDTO> {
    private long id;

    private long taskId;

    private int logType;

    private String content;

    private long logTime;

    private int logLevel;

    private int minuteOffset;

    private long addTime = System.currentTimeMillis();

    @Override
    public int compareTo(WebLogDetailDTO o) {
        if (null == o) {
            return 0;
        }
        return (int) (this.logTime - o.getLogTime());
    }
}
