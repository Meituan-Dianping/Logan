package com.meituan.logan.web.service;

import com.meituan.logan.web.enums.LogTypeEnum;
import com.meituan.logan.web.handler.ContentHandler;

/**
 * @since 2019-10-29 20:31
 */

public interface HandlerDispatcher {

    ContentHandler getHandler(LogTypeEnum logTypeEnum);
}
