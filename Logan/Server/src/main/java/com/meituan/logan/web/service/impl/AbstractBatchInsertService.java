package com.meituan.logan.web.service.impl;

import com.meituan.logan.web.service.BatchInsertService;
import com.meituan.logan.web.task.DelaySupplier;
import com.meituan.logan.web.task.SingleThreadTaskLoop;
import com.meituan.logan.web.task.TaskLoop;
import org.apache.commons.collections.CollectionUtils;
import org.apache.log4j.Logger;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

public abstract class AbstractBatchInsertService<T> implements BatchInsertService<T> {
    private static final Logger LOGGER = Logger.getLogger(AbstractBatchInsertService.class);

    private static final int CACHED_SIZE = 200;
    private List<T> cachedLogDetails = new ArrayList<>(CACHED_SIZE);
    private TaskLoop taskLoop;

    @PostConstruct
    private void init() {
        taskLoop = new SingleThreadTaskLoop(AbstractBatchInsertService.class.getSimpleName());
        taskLoop.setDelaySupplier(new DelaySupplier() {
            @Override
            public long getInitialDelay() {
                return 0;
            }

            @Override
            public int getPeriod() {
                return 50;
            }

            @Override
            public TimeUnit getTimeUnit() {
                return TimeUnit.MILLISECONDS;
            }
        });
        taskLoop.registerHarvestTask(this::doBatchInsert);
        taskLoop.start();
    }

    @Override
    public void saveLogDetail(T data) {
        taskLoop.submitTask(() -> {
            cachedLogDetails.add(data);
            if (cachedLogDetails.size() >= CACHED_SIZE) {
                doBatchInsert();
            }
        });
    }

    @Override
    public void saveLogDetails(List<T> list) {
        if (CollectionUtils.isNotEmpty(list)) {
            list.forEach(this::saveLogDetail);
        }
    }

    private void doBatchInsert() {
        try {
            if (!cachedLogDetails.isEmpty()) {
                execute(cachedLogDetails);
            }
        } catch (Exception e) {
            LOGGER.error(e);
        } finally {
            cachedLogDetails.clear();
        }
    }

    protected abstract void execute(List<T> cachedLogDetails);

}
