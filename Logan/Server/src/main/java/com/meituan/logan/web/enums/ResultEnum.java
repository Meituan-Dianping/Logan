package com.meituan.logan.web.enums;

public enum ResultEnum {
    SUCCESS,//成功
    ERROR_PARAM,//参数错误
    EXCEPTION,//日志解析异常
    ERROR_LOG_PATH,//文件路径创建失败
    ERROR_DECRYPT,//解密过程中出错
    ERROR_DATABASE;//保存到数据库出错

}
