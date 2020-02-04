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

package com.meituan.flutter_logan;

import android.text.TextUtils;
import android.util.Log;

import com.dianping.logan.SendLogRunnable;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.ProtocolException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLSession;

public class RealSendLogRunnable extends SendLogRunnable {
  private String mUploadLogUrl = "http://localhost:3000/logupload";

  private Map<String, String> headers;

  public RealSendLogRunnable() {
    headers = new HashMap<>();
    headers.put("Content-Type", "binary/octet-stream"); //二进制上传
    headers.put("client", "android");
  }

  @Override
  public void sendLog(File logFile) {
    boolean success = doSendFileByAction(logFile);
    Log.d("上传日志测试", "日志上传测试结果：" + success);
    onSuccess(success);
    // Must Call finish after send log
    finish();
    if (logFile.getName().contains(".copy")) {
      logFile.delete();
    }
  }

  public void setUrl(String url) {
    mUploadLogUrl = url;
  }

  public void addHeader(String key, String value) {
    headers.put(key, value);
  }

  /**
   * 主动上报
   */
  private boolean doSendFileByAction(File logFile) {
    boolean isSuccess = false;
    try {
      FileInputStream fileStream = new FileInputStream(logFile);
      byte[] backData = doPostRequest(mUploadLogUrl, fileStream, headers);
      isSuccess = handleSendLogBackData(backData);
    } catch (Throwable e) {
      e.printStackTrace();
    }
    return isSuccess;
  }

  private byte[] doPostRequest(String url, InputStream inputData, Map<String, String> headerMap) {
    byte[] data = null;
    OutputStream outputStream = null;
    InputStream inputStream = null;
    HttpURLConnection c = null;
    ByteArrayOutputStream back;
    byte[] Buffer = new byte[2048];
    try {
      java.net.URL u = new URL(url);
      c = (HttpURLConnection) u.openConnection();
      if (c instanceof HttpsURLConnection) {
        ((HttpsURLConnection) c).setHostnameVerifier(new HostnameVerifier() {
          @Override
          public boolean verify(String hostname, SSLSession session) {
            return true;
          }
        });
      }
      Set<Map.Entry<String, String>> entrySet = headerMap.entrySet();
      for (Map.Entry<String, String> tempEntry : entrySet) {
        c.addRequestProperty(tempEntry.getKey(), tempEntry.getValue());
      }
      c.setReadTimeout(15000);
      c.setConnectTimeout(15000);
      c.setDoInput(true);
      c.setDoOutput(true);
      c.setRequestMethod("POST");
      outputStream = c.getOutputStream();
      int i;
      while ((i = inputData.read(Buffer)) != -1) {
        outputStream.write(Buffer, 0, i);
      }
      outputStream.flush();
      int res = c.getResponseCode();
      if (res == 200) {
        back = new ByteArrayOutputStream();
        inputStream = c.getInputStream();
        while ((i = inputStream.read(Buffer)) != -1) {
          back.write(Buffer, 0, i);
        }
        data = back.toByteArray();
      }
    } catch (ProtocolException e) {
      e.printStackTrace();
    } catch (MalformedURLException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    } finally {
      if (outputStream != null) {
        try {
          outputStream.close();
        } catch (IOException e) {
          e.printStackTrace();
        }
      }
      if (inputStream != null) {
        try {
          inputStream.close();
        } catch (IOException e) {
          e.printStackTrace();
        }
      }
      if (inputData != null) {
        try {
          inputData.close();
        } catch (IOException e) {
          e.printStackTrace();
        }
      }
      if (c != null) {
        c.disconnect();
      }
    }
    return data;
  }

  /**
   * 处理上传日志接口返回的数据
   */
  private boolean handleSendLogBackData(byte[] backData) throws JSONException {
    boolean isSuccess = false;
    if (backData != null) {
      String data = new String(backData);
      if (!TextUtils.isEmpty(data)) {
        JSONObject jsonObj = new JSONObject(data);
        if (jsonObj.optBoolean("success", false)) {
          isSuccess = true;
        }
      }
    }
    return isSuccess;
  }

  /**
   * upload status.
   *
   * @param success
   */
  protected void onSuccess(boolean success) {

  }

}
