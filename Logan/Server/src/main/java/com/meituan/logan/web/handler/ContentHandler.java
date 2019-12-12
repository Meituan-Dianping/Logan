package com.meituan.logan.web.handler;

/**
 * 日志格式化接口，使用可自行实现各种日志类型的格式化操作
 */
public interface ContentHandler {

    String getSimpleContent(String content);

    String getFormatContent(String content);

}
