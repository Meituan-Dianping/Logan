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

import android.text.TextUtils;

public class LoganConfig {

    private static final long DAYS = 24 * 60 * 60 * 1000; //天
    private static final long M = 1024 * 1024; //M
    private static final long DEFAULT_DAY = 7 * DAYS; //默认删除天数
    private static final long DEFAULT_FILE_SIZE = 10 * M;
    private static final long DEFAULT_MIN_SDCARD_SIZE = 50 * M; //最小的SD卡小于这个大小不写入
    private static final int DEFAULT_QUEUE = 500;

    String mCachePath; //mmap缓存路径
    String mPathPath; //file文件路径

    long mMaxFile = DEFAULT_FILE_SIZE; //删除文件最大值
    long mDay = DEFAULT_DAY; //删除天数
    long mMaxQueue = DEFAULT_QUEUE;
    long mMinSDCard = DEFAULT_MIN_SDCARD_SIZE; //最小sdk卡大小

    byte[] mEncryptKey16; //128位aes加密Key
    byte[] mEncryptIv16; //128位aes加密IV

    boolean isValid() {
        boolean valid = false;
        if (!TextUtils.isEmpty(mCachePath) && !TextUtils.isEmpty(mPathPath) && mEncryptKey16 != null
                && mEncryptIv16 != null) {
            valid = true;
        }
        return valid;
    }

    private LoganConfig() {

    }

    private void setCachePath(String cachePath) {
        mCachePath = cachePath;
    }

    private void setPathPath(String pathPath) {
        mPathPath = pathPath;
    }

    private void setMaxFile(long maxFile) {
        mMaxFile = maxFile;
    }

    private void setDay(long day) {
        mDay = day;
    }

    private void setMinSDCard(long minSDCard) {
        mMinSDCard = minSDCard;
    }

    private void setEncryptKey16(byte[] encryptKey16) {
        mEncryptKey16 = encryptKey16;
    }

    private void setEncryptIV16(byte[] encryptIv16) {
        mEncryptIv16 = encryptIv16;
    }

    public static final class Builder {
        String mCachePath; //mmap缓存路径
        String mPath; //file文件路径
        long mMaxFile = DEFAULT_FILE_SIZE; //删除文件最大值
        long mDay = DEFAULT_DAY; //删除天数
        byte[] mEncryptKey16; //128位ase加密Key
        byte[] mEncryptIv16; //128位aes加密IV
        long mMinSDCard = DEFAULT_MIN_SDCARD_SIZE;

        public Builder setCachePath(String cachePath) {
            mCachePath = cachePath;
            return this;
        }

        public Builder setPath(String path) {
            mPath = path;
            return this;
        }

        public Builder setMaxFile(long maxFile) {
            mMaxFile = maxFile * M;
            return this;
        }

        public Builder setDay(long day) {
            mDay = day * DAYS;
            return this;
        }

        public Builder setEncryptKey16(byte[] encryptKey16) {
            mEncryptKey16 = encryptKey16;
            return this;
        }

        public Builder setEncryptIV16(byte[] encryptIv16) {
            mEncryptIv16 = encryptIv16;
            return this;
        }

        public Builder setMinSDCard(long minSDCard) {
            this.mMinSDCard = minSDCard;
            return this;
        }

        public LoganConfig build() {
            LoganConfig config = new LoganConfig();
            config.setCachePath(mCachePath);
            config.setPathPath(mPath);
            config.setMaxFile(mMaxFile);
            config.setMinSDCard(mMinSDCard);
            config.setDay(mDay);
            config.setEncryptKey16(mEncryptKey16);
            config.setEncryptIV16(mEncryptIv16);
            return config;
        }
    }
}
