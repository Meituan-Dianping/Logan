# Logan

[![license](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat)](https://raw.githubusercontent.com/Meituan-Dianping/Logan/master/LICENSE)
[![Release Version](https://img.shields.io/github/release/Meituan-Dianping/Logan.svg?maxAge=2592000?style=flat-square)](https://github.com/Meituan-Dianping/Logan/releases)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Meituan-Dianping/Logan/pulls)
[![Platform Support](https://img.shields.io/badge/Platform-%20iOS%20%7C%20Android%20%7C%20Web%20-brightgreen.svg)](https://github.com/Meituan-Dianping/Logan/wiki)

Logan is a front-end logging system, which can run in multi environment like Android, iOS, Web etc.

[中文说明](./README-zh.md)

# Overview

* Android SDK - [Android SDK](https://github.com/Meituan-Dianping/Logan/tree/master/Example/Logan-Android)

* iOS SDK - [iOS SDK](https://github.com/Meituan-Dianping/Logan/tree/master/Logan/iOS)

* Web SDK - [Web SDK](https://github.com/Meituan-Dianping/Logan/tree/master/Logan/WebSDK)

* Website - [Website](https://github.com/Meituan-Dianping/Logan/tree/master/Logan/LoganSite)

* Server - [Server](https://github.com/Meituan-Dianping/Logan/tree/master/Logan/Server)

![Logan](./img/logan_arch.png)


# Getting started

## Android SDK

### Prerequisites

If you want to build the source, make sure your NDK version is not higher than **16.1.4479499**.

### Installation

Add the following content in the project `build.gradle` file:

```groovy
compile 'com.dianping.android.sdk:logan:1.2.3'
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

## iOS & macOS SDK

### Installation

Logan supports CocoaPods methods for installing the library in a project.

#### Podfile

Import Logan in Xcode project, add Logan in podfile.

```ruby
source 'https://github.com/CocoaPods/Specs.git'
platform :ios, '8.0'

target 'TargetName' do
pod 'Logan', '~> 1.2.5'
end
```

Then run the following command:

```bash
$ pod install
```

### Logan Init

You must init Logan before you use it:

```objc
#import "Logan.h"

// important!!! you must replace this key and iv by your own.change key and iv at new version is more secure. we will provide a more secure way to protect your logs in the future.
NSData *keydata = [@"0123456789012345" dataUsingEncoding:NSUTF8StringEncoding]; 
NSData *ivdata = [@"0123456789012345" dataUsingEncoding:NSUTF8StringEncoding];
uint64_t file_max = 10 * 1024 * 1024;
// logan init，incoming 16-bit key，16-bit iv，largest written to the file size(byte)
loganInit(keydata, ivdata, file_max);

#if DEBUG
loganUseASL(YES);
#endif
```

### Usage
Write a log:
```objc
logan(1, @"this is a test");
```
logan method has two parameters:
- **String log**：What you want to write;
- **int type**：Log type. This is very important, best practices below content will show you how to using log type parameter.

If you want to write log to file immediately, you need to call flush function:

```c
loganFlush();
```
If you want to see all of the log file information, you need to call loganAllFilesInfo function:

```objc
NSDictionary *map = loganAllFilesInfo();
```

* key Log file date;
* value: Log file size(Bytes).

#### Upload

this upload method is recommend, you can use this method upload your logs directly into your server. we also provide logan server source code ,you can find it in Logan open souce Repository.
```objc
	loganUpload(@"https://openlogan.inf.test.sankuai.com/logan/upload.json", loganTodaysDate(), @"testAppId", @"testUnionId",@"testDeviceId", ^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
		if(error){
			NSLog(@"%@",error);
		}else{
			NSLog(@"upload succeed");
		}
	});
```
Logan provides a method for obtaining log files and performs preprocessing operations on the logs that need to be uploaded. Log  can be uploaded by implementing the network upload function.
```objc
    loganUploadFilePath(loganTodaysDate(), ^(NSString *_Nullable filePatch) {
        if (filePatch == nil) {
            return;
        }
        NSString *urlStr = @"http://127.0.0.1:3000/logupload";
        NSURL *url = [NSURL URLWithString:urlStr];
        NSMutableURLRequest *req = [[NSMutableURLRequest alloc] initWithURL:url cachePolicy:NSURLRequestReloadIgnoringCacheData timeoutInterval:60];
        [req setHTTPMethod:@"POST"];
        [req addValue:@"binary/octet-stream" forHTTPHeaderField:@"Content-Type"];
        NSURL *fileUrl = [NSURL fileURLWithPath:filePatch];
        NSURLSessionUploadTask *task = [[NSURLSession sharedSession] uploadTaskWithRequest:req fromFile:fileUrl completionHandler:^(NSData *_Nullable data, NSURLResponse *_Nullable response, NSError *_Nullable error) {
            if (error == nil) {
                NSLog(@"upload success");
            } else {
                NSLog(@"upload failed. error:%@", error);
            }
        }];
        [task resume];
    });
```

## Web SDK

[Web SDK ReadMe](https://github.com/Meituan-Dianping/Logan/tree/master/Logan/WebSDK)

## Website

[Website ReadMe](https://github.com/Meituan-Dianping/Logan/tree/master/Logan/LoganSite)

## Server

[Server ReadMe](https://github.com/Meituan-Dianping/Logan/tree/master/Logan/Server)

## Demo

[How to use demo](https://github.com/Meituan-Dianping/Logan/wiki/How-to-use-demo)

[Log protocol](https://github.com/Meituan-Dianping/Logan/wiki/Log-protocol)

# Best Practices

Before Logan available, log report system is relatively scattered.

![Before_Logan](./img/before_logan.png)

To put it simply, the traditional idea is to piece together the problems that appear in the logs of each system, but the new idea is to aggregate and analyze all the logs generated by the user to find the scenes with problems.

The Logan core system consists of four modules:

- Input
- Storage
- BackEnd
- FrontEnd

![Logan_Process](./img/logan_process.png)

The new case analysis process is as follows:

![Logan_Case](./img/logan_case.png)

# Article

[A lightweight case logging system based on mobile platform developed by Meituan-Dianping — Logan](https://tech.meituan.com/Logan.html)

[Logan: Open Source](https://tech.meituan.com/logan_open_source.html)

# Feature

In the future, we will provide a data platform based on Logan big data, including advanced functions such as machine learning, troubleshooting log solution, and big data feature analysis.

Finally, we hope to provide a more complete integrated case analysis ecosystem.

![Logan_System](./img/logan_system.png)

| Module | Open Source | Processing | Planning |
| :------: | :--: | :-----: | :-: |
| iOS & macOS |   √  |        |    |
| Android | √ |  |  |
| Web | √ |  |  |
| Back End | √ |  |  |
| Front End | √ |  |  |
| Mini Programs |  | √ |  |

# Contributing

**For more information about contributing PRs and issues, see our [Contribution Guidelines](./CONTRIBUTING.md).**

# Authors

## Mobile

* **White Bai** - [baitian0521](https://github.com/baitian0521)

* **Richard Cao** - [Richard-Cao](https://github.com/Richard-Cao)

* **jiangteng** - [jiangteng](https://github.com/jiangteng)

* **yangxiangnan** - [yangxiangnan](https://github.com/yangxiangnan)

* **Mr-xiaojun** - [Mr-xiaojun](https://github.com/Mr-xiaojun)

* **luoheng** - [luoheng158](https://github.com/luoheng158)


## Web

* **Sylvia** - [sylvia1106](https://github.com/sylvia1106)

* **Retrospection** - [Retrospection](https://github.com/Retrospection)


## Server

* **yuanchao.he** - [he-yuanchao](https://github.com/he-yuanchao)

* **zhilin.luo** - [zlLuo](https://github.com/zlLuo)

See also the list of [contributors](https://github.com/Meituan-Dianping/Logan/graphs/contributors) who participated in this project.

# License

Logan is licensed under the MIT License - see the [LICENSE](https://github.com/Meituan-Dianping/Logan/blob/master/LICENSE) file for details.

# Acknowledgments

- [mbedtls](https://github.com/ARMmbed/mbedtls)
- [cJSON](https://github.com/DaveGamble/cJSON)
