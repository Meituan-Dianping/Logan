package com.meituan.logan.web.model.response;

import lombok.Data;

/**
 * 功能描述:  <p></p>
 *
 *
 * @version 1.0 2019-10-07
 * @since logan-web 1.0
 */
@Data
public class LoganResponse<T> {
    public static final int SUCCESS = 200;
    public static final int SERVER_EXCEPTION = 500;
    public static final int BAD_PARAM = 400;

    private int code;
    private String msg;
    private T data;

    public static <T> LoganResponse<T> success(T data) {
        LoganResponse<T> response = new LoganResponse<>();
        response.setCode(SUCCESS);
        response.setData(data);
        return response;
    }

    public static <T> LoganResponse<T> exception(String msg) {
        return fail(msg, SERVER_EXCEPTION);
    }

    public static <T> LoganResponse<T> badParam(String msg) {
        return fail(msg, BAD_PARAM);
    }

    private static <T> LoganResponse<T> fail(String msg, int errorCode) {
        LoganResponse<T> response = new LoganResponse<>();
        response.setCode(errorCode);
        response.setMsg(msg);
        return response;
    }
}
