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

import android.content.Context;
import android.os.Handler;
import android.os.Looper;

import com.dianping.logan.Logan;
import com.dianping.logan.LoganConfig;
import com.dianping.logan.Util;

import java.io.File;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;

import io.flutter.plugin.common.MethodCall;
import io.flutter.plugin.common.MethodChannel;
import io.flutter.plugin.common.MethodChannel.MethodCallHandler;
import io.flutter.plugin.common.MethodChannel.Result;
import io.flutter.plugin.common.PluginRegistry.Registrar;

/**
 * FlutterLoganPlugin
 */
public class FlutterLoganPlugin implements MethodCallHandler {

  private static Executor sExecutor;
  private static Executor sMainExecutor = new Executor() {
    private Handler mMainHandler = new Handler();

    @Override
    public void execute(Runnable runnable) {
      if (Looper.myLooper() == Looper.getMainLooper()) {
        runnable.run();
      } else {
        mMainHandler.post(runnable);
      }
    }
  };
  private Context mContext;
  private String mLoganFilePath;

  /**
   * Plugin registration.
   */
  public static void registerWith(Registrar registrar) {
    final MethodChannel channel = new MethodChannel(registrar.messenger(), "flutter_logan");
    channel.setMethodCallHandler(new FlutterLoganPlugin(registrar.context()));
  }

  public FlutterLoganPlugin(Context context) {
    mContext = context.getApplicationContext();
  }

  /**
   * @param result the reply methods of result MUST be invoked on main thread
   */
  @Override
  public void onMethodCall(MethodCall call, Result result) {
    switch (call.method) {
    case "init":
      loganInit(call.arguments, result);
      break;
    case "log":
      log(call.arguments, result);
      break;
    case "flush":
      flush(result);
      break;
    case "getUploadPath":
      getUploadPath(call.arguments, result);
      break;
    case "upload":
      uploadToServer(call.arguments, result);
      break;
    case "cleanAllLogs":
      cleanAllLog(result);
      break;
    default:
      result.notImplemented();
      break;
    }
  }

  private void replyOnMainThread(final Result result, final Object r) {
    sMainExecutor.execute(new Runnable() {
      @Override
      public void run() {
        result.success(r);
      }
    });
  }

  private void loganInit(Object args, Result result) {
    final File file = mContext.getExternalFilesDir(null);
    if (file == null) {
      result.success(false);
      return;
    }
    final LoganConfig.Builder builder = new LoganConfig.Builder();
    String encryptKey = "";
    String encryptIV = "";
    if (args instanceof Map) {
      Long maxFileLen = Utils.getLong((Map) args, "maxFileLen");
      if (maxFileLen != null) {
        builder.setMaxFile(maxFileLen);
      }
      final String aesKey = Utils.getString((Map) args, "aesKey");
      if (Utils.isNotEmpty(aesKey)) {
        encryptKey = aesKey;
      }
      final String aesIv = Utils.getString((Map) args, "aesIv");
      if (Utils.isNotEmpty(aesIv)) {
        encryptIV = aesIv;
      }
    }
    // key iv check.
    if (Utils.isEmpty(encryptKey) || Utils.isEmpty(encryptIV)) {
      result.success(false);
      return;
    }
    mLoganFilePath = file.getAbsolutePath() + File.separator + "logan_v1";
    builder.setCachePath(mContext.getFilesDir().getAbsolutePath())
           .setPath(mLoganFilePath)
           .setEncryptKey16(encryptKey.getBytes())
           .setEncryptIV16(encryptIV.getBytes());
    Logan.init(builder.build());
    result.success(true);
  }

  private void log(Object args, Result result) {
    if (args instanceof Map) {
      String log = Utils.getString((Map) args, "log");
      Integer type = Utils.getInt((Map) args, "type");
      if (Utils.isNotEmpty(log) && type != null) {
        Logan.w(log, type);
      }
    }
    result.success(null);
  }

  private void checkAndInitExecutor() {
    if (sExecutor == null) {
      synchronized (this) {
        if (sExecutor == null) {
          sExecutor = Executors.newSingleThreadExecutor(new ThreadFactory() {
            @Override
            public Thread newThread(Runnable r) {
              return new Thread(r, "flutter-plugin-thread");
            }
          });
        }
      }
    }
  }

  private void flush(Result result) {
    Logan.f();
    result.success(null);
  }

  private void getUploadPath(final Object args, final Result result) {
    if (!(args instanceof Map)) {
      result.success("");
      return;
    }
    if (Utils.isEmpty(mLoganFilePath)) {
      result.success("");
      return;
    }
    checkAndInitExecutor();
    sExecutor.execute(new Runnable() {
      @Override
      public void run() {
        File dir = new File(mLoganFilePath);
        if (!dir.exists()) {
          replyOnMainThread(result, "");
          return;
        }
        final String date = Utils.getString((Map) args, "date");
        File[] files = dir.listFiles();
        if (files == null) {
          replyOnMainThread(result, "");
          return;
        }
        for (File file : files) {
          try {
            String fileDate = Util.getDateStr(Long.parseLong(file.getName()));
            if (date != null && date.equals(fileDate)) {
              replyOnMainThread(result, file.getAbsolutePath());
              return;
            }
          } catch (Exception e) {
            e.printStackTrace();
          }
        }
        replyOnMainThread(result, "");
      }
    });
  }

  private void cleanAllLog(final Result result) {
    if (Utils.isEmpty(mLoganFilePath)) {
      result.success(null);
      return;
    }
    checkAndInitExecutor();
    sExecutor.execute(new Runnable() {
      @Override
      public void run() {
        try {
          File dir = new File(mLoganFilePath);
          Utils.deleteRecursive(dir, false);
        } catch (Exception ignored) {
        } finally {
          replyOnMainThread(result, null);
        }
      }
    });
  }

  private void uploadToServer(final Object args, final Result result) {
    if (!(args instanceof Map)) {
      result.success(false);
      return;
    }
    final String date = Utils.getString((Map) args, "date");
    final String serverUrl = Utils.getString((Map) args, "serverUrl");
    if (Utils.isEmpty(date) || Utils.isEmpty(serverUrl)) {
      result.success(false);
      return;
    }
    final RealSendLogRunnable sendLogRunnable = new RealSendLogRunnable() {
      @Override
      protected void onSuccess(boolean success) {
        replyOnMainThread(result, success);
      }
    };
    Map<String, String> params = Utils.getStringMap((Map) args, "params");
    if (params != null) {
      Set<Map.Entry<String, String>> entrySet = params.entrySet();
      for (Map.Entry<String, String> tempEntry : entrySet) {
        sendLogRunnable.addHeader(tempEntry.getKey(), tempEntry.getValue());
      }
    }
    sendLogRunnable.setUrl(serverUrl);
    Logan.s(new String[]{date}, sendLogRunnable);
  }

}
