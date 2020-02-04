### Prerequisites

如果你想编译源代码，请确保NDK版本不高于**16.1.4479499**。

### Installation

在项目的`build.gradle`文件中添加：

```groovy
compile 'com.dianping.android.sdk:logan:1.2.3'
```

### Usage

在使用之前，必须初始化Logan，例如：

```java
LoganConfig config = new LoganConfig.Builder()
        .setCachePath(getApplicationContext().getFilesDir().getAbsolutePath())
        .setPath(getApplicationContext().getExternalFilesDir(null).getAbsolutePath()
                + File.separator + "logan_v1")
        .setEncryptKey16("0123456789012345".getBytes())
        .setEncryptIV16("0123456789012345".getBytes())
        .build();
Logan.init(config);
```

初始化之后，就可以愉快的写日志了，例如这样写一条日志：

```java
Logan.w("test logan", 1);
```

Logan.w方法有两个参数，详解如下：

- **String log**：写入的日志内容；
- **int type**：写入的日志类型，这非常重要，在下文的最佳实践内容会详细讲述如何优雅利用日志类型参数。

如果你想立即写入日志文件，需要调用flush方法：

```java
Logan.f();
```

如果你想查看所有日志文件的信息，需要调用getAllFilesInfo方法：

```java
Map<String, Long> map = Logan.getAllFilesInfo();
```

其中key为日期，value为日志文件大小（Bytes）。

#### Upload

推荐使用这个接口上传数据，我们开源了Logan后台日志解析和展示的部分，只要部署好服务器就可以用这个接口直接上报日志到后端。
```java
final String url = "https://openlogan.inf.test.sankuai.com/logan/upload.json";
Logan.s(url, loganTodaysDate(), "testAppId", "testUnionid", "testdDviceId", "testBuildVersion", "testAppVersion", new SendLogCallback() {
    @Override
    public void onLogSendCompleted(int statusCode, byte[] data) {
        final String resultData = data != null ? new String(data) : "";
        Log.d(TAG, "日志上传结果, http状态码: " + statusCode + ", 详细: " + resultData);
    }
});
```

Logan内部提供了日志上传机制，对需要上传的日志做了预处理操作。如果你需要上传日志功能，首先需要实现一个自己的SendLogRunnable：

```java
public class RealSendLogRunnable extends SendLogRunnable {

    @Override
    public void sendLog(File logFile) {
      // logFile为预处理过后即将要上传的日志文件
      // 在此方法最后必须调用finish方法
      finish();
      if (logFile.getName().contains(".copy")) {
				logFile.delete();
			}
    }
}
```

**注意：在sendLog方法的最后必须调用finish方法**。如上面代码所示。

最后需要调用Logan的send方法：

```java
Logan.s(date, mSendLogRunnable);
```

其中第一个参数为日期数组（yyyy-MM-dd）。

### Permission

如果你需要上传日志到服务器，需要申请 INTERNET 权限。

如果你需要写日志到外部存储，或者从外部存储读取日志信息，则需要 WRITE_EXTERNAL_STORAGE 权限或者 READ_EXTERNAL_STORAGE 权限。
