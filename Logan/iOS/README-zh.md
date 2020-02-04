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