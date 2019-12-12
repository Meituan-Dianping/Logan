package com.meituan.logan.web.enums;

import com.meituan.logan.web.model.Tuple;
import lombok.Getter;

import java.util.LinkedList;
import java.util.List;

/**
 * 功能描述:  <p>客户端日志类型，各使用方可自行定义</p>
 *
 * @version 1.0 2019-10-07
 * @since logan-web 1.0
 */
public enum LogTypeEnum {
    UNKNOWN(0, "unknown"), ONE(1, "日志类型1"), TWO(2, "日志类型2"), THREE(3, "日志类型3");

    @Getter
    private int logType;

    @Getter
    private String logDesc;

    LogTypeEnum(int logType, String logDesc) {
        this.logDesc = logDesc;
        this.logType = logType;
    }

    public static LogTypeEnum valueOfLogType(int logType) {
        for (LogTypeEnum en : LogTypeEnum.values()) {
            if (en.getLogType() == logType) {
                return en;
            }
        }
        return UNKNOWN;
    }

    public static List<Tuple<Integer, String>> allLogTypes() {
        List<Tuple<Integer, String>> logTypes = new LinkedList<>();
        for (LogTypeEnum logType : LogTypeEnum.values()) {
            if (logType != UNKNOWN) {
                logTypes.add(Tuple.create(logType.logType, logType.logDesc));
            }
        }
        return logTypes;
    }

    public static boolean contains(int logType) {
        for (LogTypeEnum en : LogTypeEnum.values()) {
            if (en.logType == logType) {
                return true;
            }
        }
        return false;
    }
}
