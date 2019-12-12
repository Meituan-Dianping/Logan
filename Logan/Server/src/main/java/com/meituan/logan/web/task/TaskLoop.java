package com.meituan.logan.web.task;



public interface TaskLoop {
    void submitTask(Task task);

    void registerHarvestTask(Task task);

    void setDelaySupplier(DelaySupplier delaySupplier);

    void start();

    long getBlockedTask();
}
