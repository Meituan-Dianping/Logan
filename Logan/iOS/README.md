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