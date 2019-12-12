package com.meituan.logan.web.util;

import com.google.common.base.Function;
import com.google.common.collect.Lists;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.math.NumberUtils;

import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;

/**
 * 功能描述:  <p></p>
 *
 * @version 1.0 2019-10-07
 * @since logan-web 1.0
 */
public class TypeSafeUtil {

    public static final long SEVEN_DAY = 7 * 24 * 60 * 60 * 1000L;

    private static final String REGEX = ",";

    public static <T> T nullToDefault(T value, T defaultValue) {
        return value == null ? defaultValue : value;
    }

    public static List<Integer> parseIntList(String str) {
        return parseList(str, s -> NumberUtils.toInt(s, 0));
    }

    public static List<Integer> parseIntList(String str, String regex) {
        return parseList(str, regex, s -> NumberUtils.toInt(s, 0));
    }

    public static List<Long> parseLongList(String str, String regex) {
        return parseList(str, regex, s -> NumberUtils.toLong(s, 0L));
    }

    public static List<Long> parseLongList(String str) {
        return parseList(str, s -> NumberUtils.toLong(s, 0L));
    }

    public static <T> List<T> ignore(List<T> list, T ignored) {
        if (CollectionUtils.isNotEmpty(list)) {
            List<T> result = new LinkedList<>();
            for (T item : list) {
                if (!item.equals(ignored)) {
                    result.add(item);
                }
            }
            return result;
        }
        return list;
    }

    private static <T> List<T> parseList(String str, Function<String, T> func) {
        return parseList(str, REGEX, func);
    }

    private static <T> List<T> parseList(String str, String regex, Function<String, T> func) {
        if (StringUtils.isEmpty(str)) {
            return Collections.emptyList();
        }
        return Lists.newArrayList(Lists.transform(Arrays.asList(str.split(regex)), func));
    }
}
