package com.meituan.logan.web.service.impl;

import com.google.common.collect.Maps;
import com.meituan.logan.web.enums.LogTypeEnum;
import com.meituan.logan.web.handler.*;
import com.meituan.logan.web.service.HandlerDispatcher;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import java.util.Map;

@Component
public class HandlerDispatcherDefaultImpl implements HandlerDispatcher {

    private Map<LogTypeEnum, ContentHandler> handlers = Maps.newConcurrentMap();

    @Resource
    private LoganTypeOneHandler oneHandler;
    @Resource
    private LoganTypeTwoHandler twoHandler;
    @Resource
    private LoganTypeThreeHandler threeHandler;
    @Resource
    private LoganTypeUnknownHandler unknownHandler;

    @PostConstruct
    public void init() {
        handlers.put(LogTypeEnum.ONE, oneHandler);
        handlers.put(LogTypeEnum.TWO, twoHandler);
        handlers.put(LogTypeEnum.THREE, threeHandler);
        handlers.put(LogTypeEnum.UNKNOWN, unknownHandler);
    }

    @Override
    public ContentHandler getHandler(LogTypeEnum logTypeEnum) {
        ContentHandler handler = handlers.get(logTypeEnum);
        return handler == null ? unknownHandler : handler;
    }
}
