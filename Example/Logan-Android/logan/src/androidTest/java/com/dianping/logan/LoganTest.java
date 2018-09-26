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

import static org.junit.Assert.assertEquals;

import android.content.Context;
import android.support.test.InstrumentationRegistry;
import android.support.test.runner.AndroidJUnit4;
import android.util.Log;

import org.junit.Before;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.MethodSorters;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/**
 * Instrumentation test, which will execute on an Android device.
 *
 * @see <a href="http://d.android.com/tools/testing">Testing documentation</a>
 */
@RunWith(AndroidJUnit4.class)
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class LoganTest {
    private static final String TAG = LoganTest.class.getName();
    private static final String FILE_NAME = "logan" + "_vtest";

    private SimpleDateFormat mDateFormat = new SimpleDateFormat("yyyy-MM-dd");
    private CountDownLatch mLatch;

    @Before
    public void setUp() throws Exception {
        mLatch = new CountDownLatch(1);
    }

    @Test
    public void test001Init() {
        Context applicationContext = InstrumentationRegistry.getTargetContext();
        LoganConfig config = new LoganConfig.Builder()
                .setCachePath(applicationContext.getFilesDir().getAbsolutePath())
                .setPath(applicationContext.getExternalFilesDir(null).getAbsolutePath()
                        + File.separator + FILE_NAME)
                .setEncryptKey16("0123456789012345".getBytes())
                .setEncryptIV16("0123456789012345".getBytes())
                .build();
        Logan.init(config);
        Logan.setDebug(true);
        Logan.setOnLoganProtocolStatus(new OnLoganProtocolStatus() {
            @Override
            public void loganProtocolStatus(String cmd, int code) {
                Log.d(TAG, "clogan > cmd : " + cmd + " | " + "code : " + code);
            }
        });
    }

    @Test
    public void test002LoganW() throws InterruptedException {
        Logan.w("Logan junit test write function", 1);
        assertWriteLog();
    }

    @Test
    public void test003LoganF() {
        Logan.f();
    }

    @Test
    public void test004LoganS() {
        SendLogRunnable sendLogRunnable = new SendLogRunnable() {
            @Override
            public void sendLog(File logFile) {

            }
        };
        Logan.s(getTodayDate(), sendLogRunnable);
    }

    @Test
    public void test005LoganFilesInfo() {
        Map<String, Long> map = Logan.getAllFilesInfo();
        if (map != null) {
            StringBuilder info = new StringBuilder();
            for (Map.Entry<String, Long> entry : map.entrySet()) {
                info.append("文件日期：").append(entry.getKey()).append("  文件大小（bytes）：").append(
                        entry.getValue()).append("\n");
            }
            Log.d(TAG, info.toString());
        }
    }

    // Functions

    private String[] getTodayDate() {
        String d = mDateFormat.format(new Date(System.currentTimeMillis()));
        String[] temp = new String[1];
        temp[0] = d;
        return temp;
    }

    private void assertWriteLog() throws InterruptedException {
        final int[] statusCode = new int[1];
        Logan.setOnLoganProtocolStatus(new OnLoganProtocolStatus() {
            @Override
            public void loganProtocolStatus(String cmd, int code) {
                statusCode[0] = code;
                if (cmd.equals(ConstantCode.CloganStatus.CLOGAN_WRITE_STATUS)) {
                    mLatch.countDown();
                    assertEquals(ConstantCode.CloganStatus.CLOGAN_WRITE_SUCCESS, code);
                }
            }
        });
        mLatch.await(2333, TimeUnit.MILLISECONDS);
        assertEquals("write状态码", ConstantCode.CloganStatus.CLOGAN_WRITE_SUCCESS, statusCode[0]);
    }
}
