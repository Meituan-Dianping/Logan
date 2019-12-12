package com.meituan.logan.web.handler;

import org.springframework.stereotype.Component;

/**
 * @since 2019-10-29 20:22
 */
@Component
public class LoganTypeTwoHandler implements ContentHandler {
    @Override
    public String getSimpleContent(String content) {
        return content;
    }

    @Override
    public String getFormatContent(String content) {
        return content;
    }
}
