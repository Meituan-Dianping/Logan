# Logan

[![license](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat)](https://raw.githubusercontent.com/Meituan-Dianping/Logan/master/LICENSE)
[![Release Version](https://img.shields.io/github/release/Meituan-Dianping/Logan.svg?maxAge=2592000?style=flat-square)](https://github.com/Meituan-Dianping/Logan/releases)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Meituan-Dianping/Logan/pulls)
[![Platform Support](https://img.shields.io/badge/Platform-%20iOS%20%7C%20Android%20-brightgreen.svg)](https://github.com/Meituan-Dianping/Logan/wiki)

Logan 是美团点评集团推出的大前端日志系统。名称是Log和An的组合，代表个体日志服务，同时也是金刚狼大叔的大名。

# Overview

* Android SDK - [Android SDK](https://github.com/Meituan-Dianping/Logan/tree/master/Example/Logan-Android)

* iOS SDK - [iOS SDK](https://github.com/Meituan-Dianping/Logan/tree/master/Logan/iOS)

* Web SDK - [Web SDK](https://github.com/Meituan-Dianping/Logan/tree/master/Logan/WebSDK)

* Website - [Website](https://github.com/Meituan-Dianping/Logan/tree/master/Logan/LoganSite)

* Server - [Server](https://github.com/Meituan-Dianping/Logan/tree/master/Logan/Server)

![Logan](./img/logan_arch.png)

**Logan 承载着各种日志的聚合、存储、分析，作为基础日志库，Logan 已经接入了集团众多日志类型，例如端到端日志、用户行为日志、代码级日志、崩溃日志、H5代码级日志、H5监控日志等等。**

# Getting started

## Android SDK

### Prerequisites

如果你想编译源代码，请确保NDK版本不高于**16.1.4479499**。

### Installation

在项目的`build.gradle`文件中添加：

```groovy
compile 'com.dianping.android.sdk:logan:1.2.4'
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

注意：type值1已被logan内部占用，建议业务方的日志类型使用新的type值。

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

### R8 / ProGuard
```
-keep class com.dianping.logan.CLoganProtocol {
    native <methods>;
}
```

## iOS & macOS SDK

### Installation

Logan支持以CocoaPods方式将Logan库引入到项目中。

#### Podfile

在Xcode项目中引入Logan，`podfile`添加Logan。

```ruby
source 'https://github.com/CocoaPods/Specs.git'
platform :ios, '8.0'

target 'TargetName' do
pod 'Logan', '~> 1.2.5'
end
```

然后运行以下命令：

```bash
$ pod install
```

### Logan Init

在使用之前，必须初始化Logan，例如：

```objc
#import "Logan.h"
//重要，在实际使用时要用自己的key和iv替换这里的key和iv。最好在App每次发布新版本的时候更新key和iv。后面我们会开源更加安全的加密方案，让日志存储更加安全。
NSData *keydata = [@"0123456789012345" dataUsingEncoding:NSUTF8StringEncoding]; 
NSData *ivdata = [@"0123456789012345" dataUsingEncoding:NSUTF8StringEncoding];
uint64_t file_max = 10 * 1024 * 1024;
// logan初始化，传入16位key，16位iv，写入文件最大大小(byte)
loganInit(keydata, ivdata, file_max);

#if DEBUG
loganUseASL(YES);
#endif
```

### Usage

写入一条日志：
```objc
logan(1, @"this is a test");
```

方法有两个参数，详解如下：

- **String log**：写入的日志内容；
- **int type**：写入的日志类型，这非常重要，在下文的最佳实践内容会详细讲述如何优雅利用日志类型参数。

如果你想立即写入日志文件，需要调用flush方法：

```c
loganFlush();
```

如果你想查看所有日志文件的信息，需要调用getAllFilesInfo方法：

```objc
NSDictionary *map = loganAllFilesInfo();
```

其中key为日期，value为日志文件大小（Bytes）。

#### Upload
推荐使用这个接口上传数据，我们开源了Logan后台日志解析和展示的部分，只要部署好服务器就可以用这个接口直接上报日志到后端。
```objc
    loganUpload(@"https://openlogan.inf.test.sankuai.com/logan/upload.json", loganTodaysDate(), @"testAppId", @"testUnionId",@"testDeviceId", ^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
        if(error){
            NSLog(@"%@",error);
        }else{
            NSLog(@"upload succeed");
        }
    });
```
Logan提供了获取日志文件方法，对需要上传的日志做了预处理操作。实现网络上传功能就可以日志上传。
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

在Logan面世之前，日志系统是相对分散的。

![Before_Logan](./img/before_logan.png)

简单来说，传统的思路是通过搜集散落在各系统的日志拼凑出问题出现的场景，而新的思路是从用户产生的所有日志中聚合分析，寻找出现问题的场景。

Logan核心体系由四大模块构成：

- 日志输入
- 日志存储
- 后端系统
- 前端系统

![Logan_Process](./img/logan_process.png)

新的个案分析流程如下：

![Logan_Case](./img/logan_case.png)

# Article

[美团点评移动端基础日志库 — Logan](https://tech.meituan.com/Logan.html)

[Logan：美团点评的开源移动端基础日志库](https://tech.meituan.com/logan_open_source.html)

# Feature

未来我们会提供基于Logan大数据的数据平台，包含机器学习、疑难日志解决方案、大数据特征分析等高级功能。

最后，我们希望提供更加完整的一体化个案分析生态系统。

![Logan_System](./img/logan_system.png)

| Module | Open Source | Processing | Planning |
| :------: | :--: | :-----: | :-: |
| iOS & macOS  |   √  |        |    |
| Android | √ |  |  |
| Web | √ |  |  |
| Back End | √ |  |  |
| Front End | √ |  |  |
| Mini Programs |  | √ |  |

# Contributing

**关于贡献PRs和issue的更多信息，请参考[贡献指南](./CONTRIBUTING.md)**

# Authors

## 客户端

* **白帆** - [baitian0521](https://github.com/baitian0521)

* **曹立成** - [Richard-Cao](https://github.com/Richard-Cao)

* **姜腾** - [jiangteng](https://github.com/jiangteng)

* **杨向南** - [yangxiangnan](https://github.com/yangxiangnan)

* **马小军** - [Mr-xiaojun](https://github.com/Mr-xiaojun)

* **罗恒** - [luoheng158](https://github.com/luoheng158)


## Web端

* **孙懿** - [sylvia1106](https://github.com/sylvia1106)

* **余若晟** - [Retrospection](https://github.com/Retrospection)


## 服务端

* **贺院超** - [he-yuanchao](https://github.com/he-yuanchao)

* **罗志林** - [zlLuo](https://github.com/zlLuo)


[贡献者列表](https://github.com/Meituan-Dianping/Logan/graphs/contributors)

# License

Logan项目采用MIT许可协议 - 详细内容请查看[LICENSE](https://github.com/Meituan-Dianping/Logan/blob/master/LICENSE)。

# Acknowledgments

- [mbedtls](https://github.com/ARMmbed/mbedtls)
- [cJSON](https://github.com/DaveGamble/cJSON)
