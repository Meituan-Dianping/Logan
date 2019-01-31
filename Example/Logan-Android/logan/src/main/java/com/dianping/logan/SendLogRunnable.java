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

import java.io.File;

public abstract class SendLogRunnable implements Runnable {
    public static final int SENDING = 10001;
    public static final int FINISH = 10002;

    private SendAction mSendAction;
    private OnSendLogCallBackListener mCallBackListener;

    /**
     * 真正发送上传日志文件的方法，留给外部实现
     *
     * @param logFile 日志文件
     */
    public abstract void sendLog(File logFile);

    void setSendAction(SendAction action) {
        mSendAction = action;
    }

    @Override
    public void run() {
        if (mSendAction == null || TextUtils.isEmpty(mSendAction.date)) {
            finish();
            return;
        }

        if (TextUtils.isEmpty(mSendAction.uploadPath)) {
            finish();
            return;
        }
        File file = new File(mSendAction.uploadPath);
        sendLog(file);
    }

    void setCallBackListener(OnSendLogCallBackListener callBackListener) {
        mCallBackListener = callBackListener;
    }

    /**
     * Must call this method after send log finish!
     */
    protected void finish() {
        if (mCallBackListener != null) {
            mCallBackListener.onCallBack(FINISH);
        }
    }

    interface OnSendLogCallBackListener {
        void onCallBack(int statusCode);
    }
}
