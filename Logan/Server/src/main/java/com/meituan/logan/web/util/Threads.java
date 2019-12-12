package com.meituan.logan.web.util;

import com.google.common.util.concurrent.ThreadFactoryBuilder;
import org.apache.commons.lang3.concurrent.BasicThreadFactory;

import java.util.concurrent.*;

/**
 * 功能描述:  <p></p>
 *
 * @version 1.0 2019-10-31
 * @since logan-web 1.0
 */
public class Threads {
    private static final String COMMON_PREFIX = "logan-web-";
    private static final String SCHEDULE_PREFIX = "logan-web-schedule-";

    /**
     * 创建单线程
     *
     * @param name 待创建的线程名称
     */

    public static ExecutorService newSingleThreadExecutor(String name) {
        return new ThreadPoolExecutor(1, 1, 0, TimeUnit.MILLISECONDS,
                new LinkedBlockingQueue<>(5000), getCommonThreadFactory(name),
                new ThreadPoolExecutor.AbortPolicy());
    }

    /**
     * 创建定时任务单线程
     *
     * @param name 待创建的线程名称
     */
    public static ScheduledExecutorService newSingleThreadScheduledExecutor(String name) {
        return new ScheduledThreadPoolExecutor(1, new BasicThreadFactory.Builder().namingPattern(
                SCHEDULE_PREFIX + name + "-%d").daemon(true).build());
    }

    public static ExecutorService newFixedThreadPool(String name, int nThread) {
        return new ThreadPoolExecutor(nThread, nThread, 0, TimeUnit.MILLISECONDS,
                new LinkedBlockingQueue<>(5000), getCommonThreadFactory(name),
                new ThreadPoolExecutor.AbortPolicy());
    }

    private static ThreadFactory getCommonThreadFactory(String name) {
        return new ThreadFactoryBuilder().setNameFormat(COMMON_PREFIX + name + "-%d").build();
    }
}
