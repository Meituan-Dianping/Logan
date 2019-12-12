package com.meituan.logan.web.util;

import org.apache.commons.lang3.StringUtils;

/**
 * 功能描述:  <p></p>
 *
 * @version 1.0 2019-10-31
 * @since logan-web 1.0
 */
public class LocalStringUtils {

    public static boolean isAllNotEmpty(String... strings) {
        for (String item : strings) {
            if (StringUtils.isEmpty(item)) {
                return false;
            }
        }
        return true;
    }
}
