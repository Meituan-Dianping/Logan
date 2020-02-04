### Prerequisites

If you want to build the source, make sure your NDK version is not higher than **16.1.4479499**.

### Installation

Add the following content in the project `build.gradle` file:

```groovy
compile 'com.dianping.android.sdk:logan:1.2.2'
```

### Usage

**You must init Logan before you use it**. For example:

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

After you init Logan, you can use Logan to write a log. Like this:

```java
Logan.w("test logan", 1);
```

Logan.w method has two parameters:

- **String log**: What you want to write;
- **int type**: Log type. This is very important, best practices below content will show you how to using log type parameter.

If you want to write log to file immediately, you need to call flush function:

```java
Logan.f();
```

If you want to see all of the log file information, you need to call getAllFilesInfo function:

```java
Map<String, Long> map = Logan.getAllFilesInfo();
```

- key: Log file date;
- value: Log file size(Bytes).

#### Upload

this upload method is recommend, you can use this method upload your logs directly into your server. we also provide logan server source code ,you can find it in Logan open souce Repository.
```java
final String url = "https://openlogan.inf.test.sankuai.com/logan/upload.json";
Logan.s(url, loganTodaysDate(), "testAppId", "testUnionid", "testdDviceId", "testBuildVersion", "testAppVersion", new SendLogCallback() {
    @Override
    public void onLogSendCompleted(int statusCode, byte[] data) {
        final String resultData = data != null ? new String(data) : "";
        Log.d(TAG, "upload result, httpCode: " + statusCode + ", details: " + resultData);
    }
});
```

Logan internal provides logging upload mechanism, in view of the need to upload the log to do the preprocessing. If you want to upload log file, you need to implement a SendLogRunnable:

```java
public class RealSendLogRunnable extends SendLogRunnable {

    @Override
    public void sendLog(File logFile) {
      // logFile: After the pretreatment is going to upload the log file
      // Must Call finish after send log
      finish();
      if (logFile.getName().contains(".copy")) {
				logFile.delete();
			}
    }
}
```

**NOTE: You must call finish method after send log**. As written in the code above

Finally you need to call Logan.s method:

```java
Logan.s(date, mSendLogRunnable);
```

One of the first parameter is date array(yyyy-MM-dd).

### Permission

If you upload log file to server, you need INTERNET permission.

If you write log to SD card or read log info from SD card, you need WRITE_EXTERNAL_STORAGE and READ_EXTERNAL_STORAGE permission
