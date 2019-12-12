package com.meituan.logan.web.util;

import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.function.Function;

/**
 * @since 2019-10-18 10:47
 */
public class OrderUtil {

    public static <T, R> List<T> order(List<T> source, List<R> target, Function<T, R> func) {
        if (CollectionUtils.isEmpty(source) || CollectionUtils.isEmpty(target)) {
            return Collections.emptyList();
        }
        List<T> temp = new ArrayList<>(Collections.nCopies(target.size(), null));
        for (T t : source) {
            int index = target.indexOf(func.apply(t));
            if (index != -1 && temp.get(index) == null) {
                temp.set(index, t);
            }
        }
        return temp;
    }
}
