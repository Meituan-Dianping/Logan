package com.meituan.logan.web.enums;

/**
 * 功能描述:  <p>H5端日志字段枚举</p>
 *
 * @version 1.0 2019-11-01
 * @since logan-web 1.0
 */
public enum WebLogFieldEnum {

    VERSION("v", "加密版本"), LOG("l", "日志体"), IV("iv", "客户端IV"), KEY("k", "客户端非对称加密AES key"), LOG_TYPE(
            "t", "日志类型"), CONTENT("c", "日志内容"), LOG_TIME("d", "客户端记录日志的时间");

    public String key;
    public String desc;

    WebLogFieldEnum(String key, String desc) {
        this.desc = desc;
        this.key = key;
    }
}
