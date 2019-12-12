package com.meituan.logan.web.task;

import com.meituan.logan.web.util.Threads;
import org.apache.log4j.Logger;

import java.util.Queue;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * 自旋式执行任务，然后定时收尾
 */
public class SingleThreadTaskLoop implements TaskLoop {
    private static final Logger LOGGER = Logger.getLogger(TaskLoop.class);

    private Executor executor;
    private ScheduledExecutorService scheduledExecutor;

    private Task harvestTask;
    private Queue<Task> taskQueue = new LinkedBlockingQueue();

    private volatile Semaphore semaphore = new Semaphore(0);
    private AtomicBoolean wakeup = new AtomicBoolean(false);

    private AtomicBoolean started = new AtomicBoolean(false);

    private DelaySupplier delaySupplier;

    public SingleThreadTaskLoop(String name) {
        executor = Threads.newSingleThreadExecutor("taskloop-" + name);
        scheduledExecutor = Threads.newSingleThreadScheduledExecutor("taskloop-" + name);
    }

    @Override
    public void start() {
        if (started.compareAndSet(false, true)) {
            startConsuming();
            scheduleExecuteHarvestTask();
        }
    }

    @Override
    public void submitTask(Task task) {
        taskQueue.offer(task);
        if (wakeup.compareAndSet(true, false)) {
            wakeup();
        }
    }

    private void wakeup() {
        semaphore.release();
    }

    @Override
    public void registerHarvestTask(Task task) {
        harvestTask = task;
    }

    @Override
    public void setDelaySupplier(DelaySupplier delaySupplier) {
        this.delaySupplier = delaySupplier;
    }

    private void startConsuming() {
        executor.execute(() -> {
            for (; ; ) {
                Task task = taskQueue.poll();
                if (task != null) {
                    safeExecute(task);
                } else {
                    wakeup.set(true);
                    waitForSubmitTask();
                }
            }
        });
    }

    private void waitForSubmitTask() {
        try {
            semaphore.tryAcquire(1, TimeUnit.MILLISECONDS);
        } catch (Exception ignored) {
            LOGGER.error(ignored);
        }
    }

    private void scheduleExecuteHarvestTask() {
        scheduledExecutor.scheduleAtFixedRate(() -> submitTask(harvestTask), delaySupplier.getInitialDelay(), delaySupplier.getPeriod(), delaySupplier.getTimeUnit());

    }

    private void safeExecute(Task task) {
        try {
            task.exec();
        } catch (Exception e) {
            LOGGER.error(e);
        }
    }

    @Override
    public long getBlockedTask() {
        return taskQueue.size();
    }
}
