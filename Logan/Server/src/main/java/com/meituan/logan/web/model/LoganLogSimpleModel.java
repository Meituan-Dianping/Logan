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
public class LoganLogSimpleModel implements Comparable<LoganLogSimpleModel> {
    private long id;

    private int logType;

    private long logTime;

    @Override
    public int compareTo(LoganLogSimpleModel o) {
        return (int) (this.logTime - o.logTime);
    }
}
