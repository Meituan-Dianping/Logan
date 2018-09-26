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

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.text.SimpleDateFormat;
import java.util.Date;

public class Util {

    private static SimpleDateFormat sDateFormat = new SimpleDateFormat("yyyy-MM-dd");

    public static boolean loadLibrary(String loadName, Class className) {
        boolean isLoad = false;
        try {
            ClassLoader classLoader = className.getClassLoader();
            Class runtime = Runtime.getRuntime().getClass();
            Class[] args = new Class[2];
            int version = android.os.Build.VERSION.SDK_INT;
            String functionName = "loadLibrary";
            if (version > 24) {
                args[0] = ClassLoader.class;
                args[1] = String.class;
                functionName = "loadLibrary0";
                Method loadMethod = runtime.getDeclaredMethod(functionName, args);
                loadMethod.setAccessible(true);
                loadMethod.invoke(Runtime.getRuntime(), classLoader, loadName);
            } else {
                args[0] = String.class;
                args[1] = ClassLoader.class;
                Method loadMethod = runtime.getDeclaredMethod(functionName, args);
                loadMethod.setAccessible(true);
                loadMethod.invoke(Runtime.getRuntime(), loadName, classLoader);
            }
            isLoad = true;
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InvocationTargetException e) {
            e.printStackTrace();
        } catch (NoSuchMethodException e) {
            e.printStackTrace();
        }
        return isLoad;
    }

    public static long getCurrentTime() {
        long currentTime = System.currentTimeMillis();
        long tempTime = 0;
        try {
            String dataStr = sDateFormat.format(new Date(currentTime));
            tempTime = sDateFormat.parse(dataStr).getTime();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return tempTime;
    }

    public static String getDateStr(long time) {
        return sDateFormat.format(new Date(time));
    }
}
