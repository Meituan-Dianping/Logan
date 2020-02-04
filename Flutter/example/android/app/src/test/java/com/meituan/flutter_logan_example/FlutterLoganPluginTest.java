package com.meituan.flutter_logan_example;

import android.content.Context;

import com.meituan.flutter_logan.FlutterLoganPlugin;

import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;
import org.powermock.reflect.Whitebox;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executor;

import io.flutter.plugin.common.MethodCall;
import io.flutter.plugin.common.MethodChannel.Result;

/**
 * Create by luoheng on 2020-01-02.
 */
public class FlutterLoganPluginTest {

  @Before
  public void setUp() throws Exception {
    Whitebox.setInternalState(FlutterLoganPlugin.class, "sExecutor", new ImmediateExecutor());
    Whitebox.setInternalState(FlutterLoganPlugin.class, "sMainExecutor", new ImmediateExecutor());
  }

  @Test
  public void test_notImplemented() {
    Context context = Mockito.mock(Context.class);
    Mockito.when(context.getApplicationContext()).thenReturn(context);
    FlutterLoganPlugin flutterLoganPlugin = new FlutterLoganPlugin(context);
    MethodCall methodCall = new MethodCall("test_notImplemented", null);
    Result result = Mockito.mock(Result.class);
    flutterLoganPlugin.onMethodCall(methodCall, result);
    Mockito.verify(result).notImplemented();
  }

  @Test
  public void test_loganInitFileNull() {
    // test file is null.
    Context context = Mockito.mock(Context.class);
    Mockito.when(context.getApplicationContext()).thenReturn(context);
    Mockito.when(context.getExternalFilesDir(null)).thenReturn(null);
    FlutterLoganPlugin flutterLoganPlugin = new FlutterLoganPlugin(context);
    Map<String, Object> args = new HashMap<>();
    args.put("maxFileLen", 10 * 1024L);
    args.put("aesKey", "0123456789ABCDEF");
    args.put("aesIv", "0123456789ABCDEF");
    MethodCall methodCall = new MethodCall("init", args);
    Result result = Mockito.mock(Result.class);
    flutterLoganPlugin.onMethodCall(methodCall, result);
    Mockito.verify(result).success(false);
  }

  @Test
  public void test_loganInitAesKey() {
    Context context = Mockito.mock(Context.class);
    Mockito.when(context.getApplicationContext()).thenReturn(context);
    FlutterLoganPlugin flutterLoganPlugin = new FlutterLoganPlugin(context);
    Map<String, Object> args = new HashMap<>();
    args.put("maxFileLen", 10 * 1024L);
    MethodCall methodCall = new MethodCall("init", args);
    Result result = Mockito.mock(Result.class);
    flutterLoganPlugin.onMethodCall(methodCall, result);
    Mockito.verify(result).success(false);

    // aes key err.
    args.put("aesIv", "0123456789ABCDEF");
    Mockito.reset(result);
    flutterLoganPlugin.onMethodCall(methodCall, result);
    Mockito.verify(result).success(false);
  }

  private FlutterLoganPlugin initOrTestFlutterLoganPlugin() {
    Context context = Mockito.mock(Context.class);
    Mockito.when(context.getApplicationContext()).thenReturn(context);
    long time = System.currentTimeMillis();
    Mockito.when(context.getExternalFilesDir(null)).thenReturn(new File("sdcard_" + time));
    Mockito.when(context.getFilesDir()).thenReturn(new File("sdcard_" + time));
    FlutterLoganPlugin flutterLoganPlugin = new FlutterLoganPlugin(context);
    Map<String, Object> args = new HashMap<>();
    args.put("maxFileLen", 10 * 1024L);
    args.put("aesKey", "0123456789ABCDEF");
    args.put("aesIv", "0123456789ABCDEF");
    MethodCall methodCall = new MethodCall("init", args);
    Result result = Mockito.mock(Result.class);
    flutterLoganPlugin.onMethodCall(methodCall, result);
    Mockito.verify(result).success(true);
    return flutterLoganPlugin;
  }

  @Test
  public void test_loganInitSuccess() {
    initOrTestFlutterLoganPlugin();
  }

  @Test
  public void test_log() {
    FlutterLoganPlugin flutterLoganPlugin = initOrTestFlutterLoganPlugin();
    Map<String, Object> args = new HashMap<>();
    args.put("log", "test log log");
    args.put("type", 1);
    MethodCall methodCall = new MethodCall("log", args);
    Result result = Mockito.mock(Result.class);
    flutterLoganPlugin.onMethodCall(methodCall, result);
    Mockito.verify(result).success(null);
  }

  @Test
  public void test_flush() {
    FlutterLoganPlugin flutterLoganPlugin = initOrTestFlutterLoganPlugin();
    MethodCall methodCall = new MethodCall("flush", null);
    Result result = Mockito.mock(Result.class);
    flutterLoganPlugin.onMethodCall(methodCall, result);
    Mockito.verify(result).success(null);
  }

  @Test
  public void test_getUploadPath() {
    FlutterLoganPlugin flutterLoganPlugin = initOrTestFlutterLoganPlugin();
    MethodCall methodCall = new MethodCall("getUploadPath", null);
    Result result = Mockito.mock(Result.class);
    flutterLoganPlugin.onMethodCall(methodCall, result);
    Mockito.verify(result).success("");
    flutterLoganPlugin = initOrTestFlutterLoganPlugin();
    Mockito.reset(result);

    Map<String, Object> args = new HashMap<>();
    args.put("date", "2020-1-2");
    methodCall = new MethodCall("getUploadPath", args);
    flutterLoganPlugin.onMethodCall(methodCall, result);
    Mockito.verify(result).success("");
  }

  @Test
  public void test_uploadToServer() {
    FlutterLoganPlugin flutterLoganPlugin = initOrTestFlutterLoganPlugin();
    MethodCall methodCall = new MethodCall("upload", null);
    Result result = Mockito.mock(Result.class);
    flutterLoganPlugin.onMethodCall(methodCall, result);
    Mockito.verify(result).success(false);
    Mockito.reset(result);

    Map<String, Object> args = new HashMap<>();
    args.put("serverUrl", "http://192.168.1.1/upload");
    methodCall = new MethodCall("upload", args);
    flutterLoganPlugin.onMethodCall(methodCall, result);
    result.success(false);

    args = new HashMap<>();
    args.put("serverUrl", "http://192.168.1.1/upload");
    args.put("date", "2020-1-2");
    Map<String, String> headers = new HashMap<>();
    args.put("params", headers);
    methodCall = new MethodCall("upload", args);
    flutterLoganPlugin.onMethodCall(methodCall, result);
  }

  @Test
  public void test_cleanAllLog() {
    Context context = Mockito.mock(Context.class);
    Mockito.when(context.getApplicationContext()).thenReturn(context);
    FlutterLoganPlugin flutterLoganPlugin = new FlutterLoganPlugin(context);
    MethodCall methodCall = new MethodCall("cleanAllLogs", null);
    Result result = Mockito.mock(Result.class);
    flutterLoganPlugin.onMethodCall(methodCall, result);
    Mockito.verify(result).success(null);

    flutterLoganPlugin = initOrTestFlutterLoganPlugin();
    Mockito.reset(result);
    flutterLoganPlugin.onMethodCall(methodCall, result);
    Mockito.verify(result).success(null);
  }

  public static class ImmediateExecutor implements Executor {
    @Override
    public void execute(Runnable runnable) {
      runnable.run();
    }
  }
}