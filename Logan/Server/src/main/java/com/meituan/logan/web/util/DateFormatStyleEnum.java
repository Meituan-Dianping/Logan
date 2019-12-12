package com.meituan.logan.web.util;

/**
 * 功能描述:  <p></p>
 *
 *
 * @version 1.0 2019-08-23
 * @since logan-web 1.0
 */
public enum DateFormatStyleEnum {
    DATE_TIME("yyyy-MM-dd HH:mm:ss"), DATE("yyyy-MM-dd"), TIME("HH:mm:ss"), MONTH_DAY("MM-dd"), YMD(
            "yyyyMMdd");
    public String style;

    DateFormatStyleEnum(String style) {
        this.style = style;
    }
}
