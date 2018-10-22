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

#import "AppDelegate.h"
#import "Logan.h"

typedef enum : NSUInteger {
    LoganTypeAction = 1,  //用户行为日志
    LoganTypeNetwork = 2, //网络级日志
} LoganType;


@interface AppDelegate ()

@property (weak) IBOutlet NSWindow *window;

@property (nonatomic, assign) int count;
@property (weak) IBOutlet NSTextField *filesInfo;
@property (weak) IBOutlet NSTextField *ipText;

@end

@implementation AppDelegate

- (void)applicationDidFinishLaunching:(NSNotification *)aNotification {
    // Insert code here to initialize your application
    
    NSData *keydata = [@"0123456789012345" dataUsingEncoding:NSUTF8StringEncoding];
    NSData *ivdata = [@"0123456789012345" dataUsingEncoding:NSUTF8StringEncoding];
    uint64_t file_max = 10 * 1024 * 1024;
    // logan初始化，传入16位key，16位iv，写入文件最大大小(byte)
    loganInit(keydata, ivdata, file_max);
    // 将日志输出至控制台
    loganUseASL(YES);
}


- (void)applicationWillTerminate:(NSNotification *)aNotification {
    // Insert code here to tear down your application
}

- (IBAction)lllog:(id)sender {
    for (int i = 0; i < 10; i++) {
        //行为日志
        [self eventLogType:1 forLabel:[NSString stringWithFormat:@"click button %d", _count++]];
    }
}

- (IBAction)allFilesInfo:(id)sender {
    NSDictionary *files = loganAllFilesInfo();
    
    NSMutableString *str = [[NSMutableString alloc] init];
    for (NSString *k in files.allKeys) {
        [str appendFormat:@"文件日期 %@，大小 %@byte\n", k, [files objectForKey:k]];
    }
    
    self.filesInfo.stringValue = str;
}

- (IBAction)uploadFile:(id)sender {
    loganUploadFilePath(loganTodaysDate(), ^(NSString *_Nullable filePatch) {
        if (filePatch == nil) {
            return;
        }
        NSString *urlStr = [NSString stringWithFormat:@"http://%@:3000/logupload", self.ipText.stringValue ?: @"127.0.0.1"];
        NSURL *url = [NSURL URLWithString:urlStr];
        NSMutableURLRequest *req = [[NSMutableURLRequest alloc] initWithURL:url cachePolicy:NSURLRequestReloadIgnoringCacheData timeoutInterval:60];
        [req setHTTPMethod:@"POST"];
        [req addValue:@"binary/octet-stream" forHTTPHeaderField:@"Content-Type"];
        NSURL *fileUrl = [NSURL fileURLWithPath:filePatch];
        NSURLSessionUploadTask *task = [[NSURLSession sharedSession] uploadTaskWithRequest:req fromFile:fileUrl completionHandler:^(NSData *_Nullable data, NSURLResponse *_Nullable response, NSError *_Nullable error) {
            if (error == nil) {
                NSLog(@"上传完成");
            } else {
                NSLog(@"上传失败 error:%@", error);
            }
        }];
        [task resume];
    });
}

/**
 用户行为日志
 
 @param eventType 事件类型
 @param label 描述
 */
- (void)eventLogType:(NSInteger)eventType forLabel:(NSString *)label {
    NSMutableString *s = [NSMutableString string];
    [s appendFormat:@"%d\t", (int)eventType];
    [s appendFormat:@"%@\t", label];
    logan(LoganTypeAction, s);
}


@end
