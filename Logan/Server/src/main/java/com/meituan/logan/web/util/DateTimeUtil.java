package com.meituan.logan.web.util;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.math.NumberUtils;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

/**
 * 功能描述:  <p></p>
 *
 * @version 1.0 2019-08-23
 * @since logan-web 1.0
 */
public class DateTimeUtil {
    public static final long ONE_DAY = 24 * 60 * 60 * 1000L;

    public static Date trimAfter(TrimFieldEnum field, Date date) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        switch (field) {
            case HOUR:
                calendar.set(Calendar.HOUR_OF_DAY, 0);
            case MINUTE:
                calendar.set(Calendar.MINUTE, 0);
            case SECOND:
                calendar.set(Calendar.SECOND, 0);
            case MIL_SECOND:
                calendar.set(Calendar.MILLISECOND, 0);
        }
        return calendar.getTime();
    }

    public static Date plusDay(Date date, int days) {
        return new Date(date.getTime() + ONE_DAY * days);
    }

    public static String formatDate(Date date) {
        return format(date, DateFormatStyleEnum.DATE);
    }

    public static String formatTime(Date date) {
        return format(date, DateFormatStyleEnum.TIME);
    }

    public static String formatMonthDay(Date date) {
        return format(date, DateFormatStyleEnum.MONTH_DAY);
    }

    public static String formatYMD(Date date) {
        return format(date, DateFormatStyleEnum.YMD);
    }

    public static String formatDateTime(Date date) {
        return format(date, DateFormatStyleEnum.DATE_TIME);
    }

    public static Date parseDate(String date) {
        return parse(date, DateFormatStyleEnum.DATE);
    }

    public static Date parseTime(String date) {
        return parse(date, DateFormatStyleEnum.TIME);
    }

    public static Date parseDateTime(String date) {
        return parse(date, DateFormatStyleEnum.DATE_TIME);
    }

    public static int getDayOffset(Date date) {
        return (int) (date.getTime() - trimAfter(TrimFieldEnum.HOUR, date).getTime()) / (1000 * 60);
    }

    public static int getOffset(String hourAndMinute, int defaultOffset) {
        if (StringUtils.isEmpty(hourAndMinute)) {
            return defaultOffset;
        }
        String[] array = hourAndMinute.split(":");
        if (array.length != 2) {
            return defaultOffset;
        }
        return NumberUtils.toInt(array[0]) * 60 + NumberUtils.toInt(array[1]);
    }

    private static String format(Date date, DateFormatStyleEnum styleEnum) {
        try {
            DateFormat format = new SimpleDateFormat(styleEnum.style);
            return format.format(date);
        } catch (Exception e) {
            return null;
        }
    }

    public static Date parse(String date, DateFormatStyleEnum styleEnum) {
        try {
            DateFormat format = new SimpleDateFormat(styleEnum.style);
            return format.parse(date);
        } catch (Exception e) {
            return null;
        }
    }
}
