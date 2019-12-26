package com.meituan.logan.web.parser;

import com.meituan.logan.web.enums.PlatformEnum;
import com.meituan.logan.web.model.LoganTaskModel;
import com.meituan.logan.web.util.DateFormatStyleEnum;
import com.meituan.logan.web.util.DateTimeUtil;
import org.apache.commons.lang3.math.NumberUtils;

import javax.servlet.http.HttpServletRequest;
import java.util.Date;
import java.util.UUID;

/**
 * @since 2019-11-08 10:18
 */
public class RequestContextParser {

    public static LoganTaskModel parse(HttpServletRequest request) {
        LoganTaskModel model = new LoganTaskModel();
        model.setAmount(request.getContentLength() + "");
        model.setAppId(getString(request, "appId"));
        model.setUnionId(getString(request, "unionId"));
        model.setPlatform(PlatformEnum.valueOfPlatform(getInteger(request, "platform")).getPlatform());
        model.setBuildVersion(getString(request, "buildVersion"));
        model.setAppVersion(getString(request, "appVersion"));
        model.setDeviceId(getString(request, "deviceId"));
        Date date = DateTimeUtil.parse(getString(request, "fileDate"), DateFormatStyleEnum.DATE);
        model.setLogDate(date == null ? 0 : date.getTime());
        model.setLogFileName(createFileNameByAppDeviceDate(model));
        model.setAddTime(System.currentTimeMillis());

        return model;
    }

    private static String getString(HttpServletRequest request, String headerName) {
        return request.getHeader(headerName);
    }

    private static Integer getInteger(HttpServletRequest request, String headerName) {
        return NumberUtils.toInt(request.getHeader(headerName));
    }

    private static String createFileNameByAppDeviceDate(LoganTaskModel model) {
        return model.getAppId() + "_" +
                model.getDeviceId() + "_" +
                model.getLogDate() + "_" + UUID.randomUUID() + ".log";
    }

}