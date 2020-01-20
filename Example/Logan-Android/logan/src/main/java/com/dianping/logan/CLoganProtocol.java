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

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

class CLoganProtocol implements LoganProtocolHandler {

    private static final String LIBRARY_NAME = "logan";

    private static CLoganProtocol sCLoganProtocol;
    private static boolean sIsCloganOk;

    private boolean mIsLoganInit;
    private boolean mIsLoganOpen;
    private OnLoganProtocolStatus mLoganProtocolStatus;
    private Set<Integer> mArraySet = Collections.synchronizedSet(new HashSet<Integer>());

    static {
        try {
            System.loadLibrary(LIBRARY_NAME);
            sIsCloganOk = true;
        } catch (Throwable e) {
            e.printStackTrace();
            sIsCloganOk = false;
        }
    }

    static boolean isCloganSuccess() {
        return sIsCloganOk;
    }

    static CLoganProtocol newInstance() {
        if (sCLoganProtocol == null) {
            synchronized (CLoganProtocol.class) {
                if (sCLoganProtocol == null) {
                    sCLoganProtocol = new CLoganProtocol();
                }
            }
        }
        return sCLoganProtocol;
    }

    /**
     * 初始化Clogan
     *
     * @param dir_path 目录路径
     * @param max_file 最大文件值
     */
    private native int clogan_init(String cache_path, String dir_path, int max_file,
            String encrypt_key_16, String encrypt_iv_16);

    private native int clogan_open(String file_name);

    private native void clogan_debug(boolean is_debug);

    /**
     * @param flag        日志类型
     * @param log         日志内容
     * @param local_time  本地时间
     * @param thread_name 线程名称
     * @param thread_id   线程ID
     * @param is_main     是否主线程
     */
    private native int clogan_write(int flag, String log, long local_time, String thread_name,
            long thread_id, int is_main);

    private native void clogan_flush();

    @Override
    public void logan_init(String cache_path, String dir_path, int max_file, String encrypt_key_16,
            String encrypt_iv_16) {
        if (mIsLoganInit) {
            return;
        }
        if (!sIsCloganOk) {
            loganStatusCode(ConstantCode.CloganStatus.CLOGAN_LOAD_SO,
                    ConstantCode.CloganStatus.CLOGAN_LOAD_SO_FAIL);
            return;
        }

        try {
            int code = clogan_init(cache_path, dir_path, max_file, encrypt_key_16, encrypt_iv_16);
            mIsLoganInit = true;
            loganStatusCode(ConstantCode.CloganStatus.CLGOAN_INIT_STATUS, code);
        } catch (UnsatisfiedLinkError e) {
            e.printStackTrace();
            loganStatusCode(ConstantCode.CloganStatus.CLGOAN_INIT_STATUS,
                    ConstantCode.CloganStatus.CLOGAN_INIT_FAIL_JNI);
        }
    }

    @Override
    public void logan_debug(boolean debug) {
        if (!mIsLoganInit || !sIsCloganOk) {
            return;
        }
        try {
            clogan_debug(debug);
        } catch (UnsatisfiedLinkError e) {
            e.printStackTrace();
        }
    }

    @Override
    public void setOnLoganProtocolStatus(OnLoganProtocolStatus listener) {
        mLoganProtocolStatus = listener;
    }

    @Override
    public void logan_open(String file_name) {
        if (!mIsLoganInit || !sIsCloganOk) {
            return;
        }
        try {
            int code = clogan_open(file_name);
            mIsLoganOpen = true;
            loganStatusCode(ConstantCode.CloganStatus.CLOGAN_OPEN_STATUS, code);
        } catch (UnsatisfiedLinkError e) {
            e.printStackTrace();
            loganStatusCode(ConstantCode.CloganStatus.CLOGAN_OPEN_STATUS,
                    ConstantCode.CloganStatus.CLOGAN_OPEN_FAIL_JNI);
        }
    }

    @Override
    public void logan_flush() {
        if (!mIsLoganOpen || !sIsCloganOk) {
            return;
        }
        try {
            clogan_flush();
        } catch (UnsatisfiedLinkError e) {
            e.printStackTrace();
        }

    }

    @Override
    public void logan_write(int flag, String log, long local_time, String thread_name,
            long thread_id, boolean is_main) {
        if (!mIsLoganOpen || !sIsCloganOk) {
            return;
        }
        try {
            int isMain = is_main ? 1 : 0;
            int code = clogan_write(flag, log, local_time, thread_name, thread_id,
                    isMain);
            if (code != ConstantCode.CloganStatus.CLOGAN_WRITE_SUCCESS || Logan.sDebug) {
                loganStatusCode(ConstantCode.CloganStatus.CLOGAN_WRITE_STATUS, code);
            }
        } catch (UnsatisfiedLinkError e) {
            e.printStackTrace();
            loganStatusCode(ConstantCode.CloganStatus.CLOGAN_WRITE_STATUS,
                    ConstantCode.CloganStatus.CLOGAN_WRITE_FAIL_JNI);
        }
    }

    private void loganStatusCode(String cmd, int code) {
        if (code < 0) {
            if (ConstantCode.CloganStatus.CLOGAN_WRITE_STATUS.endsWith(cmd)
                    && code != ConstantCode.CloganStatus.CLOGAN_WRITE_FAIL_JNI) {
                if (mArraySet.contains(code)) {
                    return;
                } else {
                    mArraySet.add(code);
                }
            }
            if (mLoganProtocolStatus != null) {
                mLoganProtocolStatus.loganProtocolStatus(cmd, code);
            }
        }
    }
}
