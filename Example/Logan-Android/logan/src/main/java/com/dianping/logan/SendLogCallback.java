package com.dianping.logan;

/**
 * Create by luoheng on 2019-11-20.
 */
public interface SendLogCallback {
    /**
     * 日志上传结果回调方法.
     *
     * @param statusCode 对应http状态码.
     * @param data       http返回的data.
     */
    void onLogSendCompleted(int statusCode, byte[] data);
}
