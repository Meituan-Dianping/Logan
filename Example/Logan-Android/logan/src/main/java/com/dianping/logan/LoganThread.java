/*
 * Copyright (c) 2018-present, 美团点评
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

package com.dianping.logan;

import android.os.StatFs;
import android.text.TextUtils;
import android.util.Log;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;

class LoganThread extends Thread {

    private static final String TAG = "LoganThread";
    private static final int MINUTE = 60 * 1000;
    private static final long LONG = 24 * 60 * 60 * 1000;
    private static final int CACHE_SIZE = 1024;

    private final Object sync = new Object();
    private final Object sendSync = new Object();
    private volatile boolean mIsRun = true;

    private long mCurrentDay;
    private boolean mIsWorking;
    private File mFileDirectory;
    private boolean mIsSDCard;
    private long mLastTime;
    private LoganProtocol mLoganProtocol;
    private ConcurrentLinkedQueue<LoganModel> mCacheLogQueue;
    private String mCachePath; // 缓存文件路径
    private String mPath; //文件路径
    private long mSaveTime; //存储时间
    private long mMaxLogFile;//最大文件大小
    private long mMinSDCard;
    private String mEncryptKey16;
    private String mEncryptIv16;
    private int mSendLogStatusCode;
    // 发送缓存队列
    private ConcurrentLinkedQueue<LoganModel> mCacheSendQueue = new ConcurrentLinkedQueue<>();
    private ExecutorService mSingleThreadExecutor;

    LoganThread(
            ConcurrentLinkedQueue<LoganModel> cacheLogQueue, String cachePath,
            String path, long saveTime, long maxLogFile, long minSDCard, String encryptKey16,
            String encryptIv16) {
        mCacheLogQueue = cacheLogQueue;
        mCachePath = cachePath;
        mPath = path;
        mSaveTime = saveTime;
        mMaxLogFile = maxLogFile;
        mMinSDCard = minSDCard;
        mEncryptKey16 = encryptKey16;
        mEncryptIv16 = encryptIv16;
    }

    void notifyRun() {
        if (!mIsWorking) {
            synchronized (sync) {
                sync.notify();
            }
        }
    }

    void quit() {
        mIsRun = false;
        if (!mIsWorking) {
            synchronized (sync) {
                sync.notify();
            }
        }
    }

    @Override
    public void run() {
        super.run();
        while (mIsRun) {
            synchronized (sync) {
                mIsWorking = true;
                try {
                    LoganModel model = mCacheLogQueue.poll();
                    if (model == null) {
                        mIsWorking = false;
                        sync.wait();
                        mIsWorking = true;
                    } else {
                        action(model);
                    }
                } catch (InterruptedException e) {
                    e.printStackTrace();
                    mIsWorking = false;
                }
            }
        }
    }

    private void action(LoganModel model) {
        if (model == null || !model.isValid()) {
            return;
        }
        if (mLoganProtocol == null) {
            mLoganProtocol = LoganProtocol.newInstance();
            mLoganProtocol.setOnLoganProtocolStatus(new OnLoganProtocolStatus() {
                @Override
                public void loganProtocolStatus(String cmd, int code) {
                    Logan.onListenerLogWriteStatus(cmd, code);
                }
            });
            mLoganProtocol.logan_init(mCachePath, mPath, (int) mMaxLogFile, mEncryptKey16,
                    mEncryptIv16);
            mLoganProtocol.logan_debug(Logan.sDebug);
        }

        if (model.action == LoganModel.Action.WRITE) {
            doWriteLog2File(model.writeAction);
        } else if (model.action == LoganModel.Action.SEND) {
            if (model.sendAction.sendLogRunnable != null) {
                // 是否正在发送
                synchronized (sendSync) {
                    if (mSendLogStatusCode == SendLogRunnable.SENDING) {
                        mCacheSendQueue.add(model);
                    } else {
                        doSendLog2Net(model.sendAction);
                    }
                }
            }
        } else if (model.action == LoganModel.Action.FLUSH) {
            doFlushLog2File();
        }
    }

    private void doFlushLog2File() {
        if (Logan.sDebug) {
            Log.d(TAG, "Logan flush start");
        }
        if (mLoganProtocol != null) {
            mLoganProtocol.logan_flush();
        }
    }

    private boolean isDay() {
        long currentTime = System.currentTimeMillis();
        return mCurrentDay < currentTime && mCurrentDay + LONG > currentTime;
    }

    private void deleteExpiredFile(long deleteTime) {
        File dir = new File(mPath);
        if (dir.isDirectory()) {
            String[] files = dir.list();
            if (files != null) {
                for (String item : files) {
                    try {
                        if (TextUtils.isEmpty(item)) {
                            continue;
                        }
                        String[] longStrArray = item.split("\\.");
                        if (longStrArray.length > 0) {  //小于时间就删除
                            long longItem = Long.valueOf(longStrArray[0]);
                            if (longItem <= deleteTime && longStrArray.length == 1) {
                                new File(mPath, item).delete(); //删除文件
                            }
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
        }
    }

    private void doWriteLog2File(WriteAction action) {
        if (Logan.sDebug) {
            Log.d(TAG, "Logan write start");
        }
        if (mFileDirectory == null) {
            mFileDirectory = new File(mPath);
        }

        if (!isDay()) {
            long tempCurrentDay = Util.getCurrentTime();
            //save时间
            long deleteTime = tempCurrentDay - mSaveTime;
            deleteExpiredFile(deleteTime);
            mCurrentDay = tempCurrentDay;
            mLoganProtocol.logan_open(String.valueOf(mCurrentDay));
        }

        long currentTime = System.currentTimeMillis(); //每隔1分钟判断一次
        if (currentTime - mLastTime > MINUTE) {
            mIsSDCard = isCanWriteSDCard();
        }
        mLastTime = System.currentTimeMillis();

        if (!mIsSDCard) { //如果大于50M 不让再次写入
            return;
        }
        mLoganProtocol.logan_write(action.flag, action.log, action.localTime, action.threadName,
                action.threadId, action.isMainThread);
    }

    private void doSendLog2Net(SendAction action) {
        if (Logan.sDebug) {
            Log.d(TAG, "Logan send start");
        }
        if (TextUtils.isEmpty(mPath) || action == null || !action.isValid()) {
            return;
        }
        boolean success = prepareLogFile(action);
        if (!success) {
            if (Logan.sDebug) {
                Log.d(TAG, "Logan prepare log file failed, can't find log file");
            }
            return;
        }
        action.sendLogRunnable.setSendAction(action);
        action.sendLogRunnable.setCallBackListener(
                new SendLogRunnable.OnSendLogCallBackListener() {
                    @Override
                    public void onCallBack(int statusCode) {
                        synchronized (sendSync) {
                            mSendLogStatusCode = statusCode;
                            if (statusCode == SendLogRunnable.FINISH) {
                                mCacheLogQueue.addAll(mCacheSendQueue);
                                mCacheSendQueue.clear();
                                notifyRun();
                            }
                        }
                    }
                });
        mSendLogStatusCode = SendLogRunnable.SENDING;
        if (mSingleThreadExecutor == null) {
            mSingleThreadExecutor = Executors.newSingleThreadExecutor(new ThreadFactory() {
                @Override
                public Thread newThread(Runnable r) {
                    // Just rename Thread
                    Thread t = new Thread(Thread.currentThread().getThreadGroup(), r,
                            "logan-thread-send-log", 0);
                    if (t.isDaemon()) {
                        t.setDaemon(false);
                    }
                    if (t.getPriority() != Thread.NORM_PRIORITY) {
                        t.setPriority(Thread.NORM_PRIORITY);
                    }
                    return t;
                }
            });
        }
        mSingleThreadExecutor.execute(action.sendLogRunnable);
    }

    /**
     * 发送日志前的预处理操作
     */
    private boolean prepareLogFile(SendAction action) {
        if (Logan.sDebug) {
            Log.d(TAG, "prepare log file");
        }
        if (isFile(action.date)) { //是否有日期文件
            String src = mPath + File.separator + action.date;
            if (action.date.equals(String.valueOf(Util.getCurrentTime()))) {
                doFlushLog2File();
                String des = mPath + File.separator + action.date + ".copy";
                if (copyFile(src, des)) {
                    action.uploadPath = des;
                    return true;
                }
            } else {
                action.uploadPath = src;
                return true;
            }
        } else {
            action.uploadPath = "";
        }
        return false;
    }

    private boolean copyFile(String src, String des) {
        boolean back = false;
        FileInputStream inputStream = null;
        FileOutputStream outputStream = null;
        try {
            inputStream = new FileInputStream(new File(src));
            outputStream = new FileOutputStream(new File(des));
            byte[] buffer = new byte[CACHE_SIZE];
            int i;
            while ((i = inputStream.read(buffer)) >= 0) {
                outputStream.write(buffer, 0, i);
                outputStream.flush();
            }
            back = true;
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                if (inputStream != null) {
                    inputStream.close();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
            try {
                if (outputStream != null) {
                    outputStream.close();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return back;
    }

    private boolean isCanWriteSDCard() {
        boolean item = false;
        try {
            StatFs stat = new StatFs(mPath);
            long blockSize = stat.getBlockSize();
            long availableBlocks = stat.getAvailableBlocks();
            long total = availableBlocks * blockSize;
            if (total > mMinSDCard) { //判断SDK卡
                item = true;
            }
        } catch (IllegalArgumentException e) {
            e.printStackTrace();
        }
        return item;
    }

    private boolean isFile(String name) {
        boolean isExist = false;
        if (TextUtils.isEmpty(mPath)) {
            return false;
        }
        File file = new File(mPath + File.separator + name);
        if (file.exists() && file.isFile()) {
            isExist = true;
        }
        return isExist;
    }
}
