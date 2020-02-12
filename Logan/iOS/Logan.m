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

#import "Logan.h"
#import <sys/time.h>
#include <sys/mount.h>
#include "clogan_core.h"

#if TARGET_OS_IPHONE
#import <UIKit/UIKit.h>
#else
#import <Cocoa/Cocoa.h>
#endif

BOOL LOGANUSEASL = NO;
NSData *__AES_KEY;
NSData *__AES_IV;
uint64_t __max_file;
uint32_t __max_reversed_date;


@interface Logan : NSObject {
    NSTimeInterval _lastCheckFreeSpace;
}
@property (nonatomic, copy) NSString *lastLogDate;

#if OS_OBJECT_USE_OBJC
@property (nonatomic, strong) dispatch_queue_t loganQueue;
#else
@property (nonatomic, assign) dispatch_queue_t loganQueue;
#endif

+ (instancetype)logan;

- (void)writeLog:(NSString *)log logType:(NSUInteger)type;
- (void)clearLogs;
+ (NSDictionary *)allFilesInfo;
+ (NSString *)currentDate;
- (void)flush;
- (void)filePathForDate:(NSString *)date block:(LoganFilePathBlock)filePathBlock;
+ (void)uploadFileToServer:(NSString *)urlStr date:(NSString *)date appId:(NSString *)appId unionId:(NSString *)unionId deviceId:(NSString *)deviceId resultBlock:(LoganUploadResultBlock)resultBlock;
@end

void loganInit(NSData *_Nonnull aes_key16, NSData *_Nonnull aes_iv16, uint64_t max_file) {
    __AES_KEY = aes_key16;
    __AES_IV = aes_iv16;
    __max_file = max_file;
    if (__max_reversed_date == 0) {
        __max_reversed_date = 7;
    }
    
}

void loganSetMaxReversedDate(int max_reversed_date) {
    if (max_reversed_date > 0) {
        __max_reversed_date = max_reversed_date;
    }
    
}
void logan(NSUInteger type, NSString *_Nonnull log) {
    [[Logan logan] writeLog:log logType:type];
}

void loganUseASL(BOOL b) {
    LOGANUSEASL = b;
}

void loganPrintClibLog(BOOL b) {
    clogan_debug(!!b);
}

void loganClearAllLogs(void) {
    [[Logan logan] clearLogs];
}

NSDictionary *_Nullable loganAllFilesInfo(void) {
    return [Logan allFilesInfo];
}

void loganUploadFilePath(NSString *_Nonnull date, LoganFilePathBlock _Nonnull filePathBlock) {
    [[Logan logan] filePathForDate:date block:filePathBlock];
}

void loganUpload(NSString * _Nonnull url, NSString * _Nonnull date,NSString * _Nullable appId, NSString *_Nullable unionId,NSString *_Nullable deviceId, LoganUploadResultBlock _Nullable resultBlock){
	[Logan uploadFileToServer:url date:date appId:appId unionId:unionId deviceId:deviceId resultBlock:resultBlock];
}

void loganFlush(void) {
    [[Logan logan] flush];
}

NSString *_Nonnull loganTodaysDate(void) {
    return [Logan currentDate];
}


@implementation Logan
+ (instancetype)logan {
    static Logan *instance = nil;
    static dispatch_once_t pred;
    dispatch_once(&pred, ^{
        instance = [[Logan alloc] init];
    });
    return instance;
}

- (nonnull instancetype)init {
    if (self = [super init]) {
        _loganQueue = dispatch_queue_create("com.dianping.logan", DISPATCH_QUEUE_SERIAL);
        dispatch_async(self.loganQueue, ^{
            [self initAndOpenCLib];
            [self addNotification];
            [self reTemFile];
            [Logan deleteOutdatedFiles];
        });
    }
    return self;
}

- (void)initAndOpenCLib {
    NSAssert(__AES_KEY, @"aes_key is nil!!!,Please use llogInit() to set the key.");
    NSAssert(__AES_IV, @"aes_iv is nil!!!,Please use llogInit() to set the iv.");
    const char *path = [Logan loganLogDirectory].UTF8String;
    
    const char *aeskey = (const char *)[__AES_KEY bytes];
    const char *aesiv = (const char *)[__AES_IV bytes];
    clogan_init(path, path, (int)__max_file, aeskey, aesiv);
    NSString *today = [Logan currentDate];
    clogan_open((char *)today.UTF8String);
    __AES_KEY = nil;
    __AES_IV = nil;
}

- (void)writeLog:(NSString *)log logType:(NSUInteger)type {
    if (log.length == 0) {
        return;
    }
    
    NSTimeInterval localTime = [[NSDate date] timeIntervalSince1970] * 1000;
    NSString *threadName = [[NSThread currentThread] name];
    NSInteger threadNum = 1;
    BOOL threadIsMain = [[NSThread currentThread] isMainThread];
    if (!threadIsMain) {
        threadNum = [self getThreadNum];
    }
    char *threadNameC = threadName ? (char *)threadName.UTF8String : "";
    if (LOGANUSEASL) {
        [self printfLog:log type:type];
    }
    
    if (![self hasFreeSpece]) {
        return;
    }
    
    dispatch_async(self.loganQueue, ^{
        NSString *today = [Logan currentDate];
        if (self.lastLogDate && ![self.lastLogDate isEqualToString:today]) {
                // 日期变化，立即写入日志文件
            clogan_flush();
            clogan_open((char *)today.UTF8String);
        }
        self.lastLogDate = today;
        clogan_write((int)type, (char *)log.UTF8String, (long long)localTime, threadNameC, (long long)threadNum, (int)threadIsMain);
    });
}

- (void)flush {
    dispatch_async(self.loganQueue, ^{
        [self flushInQueue];
    });
}

- (void)flushInQueue {
    clogan_flush();
}

- (void)clearLogs {
    dispatch_async(self.loganQueue, ^{
        NSArray *array = [Logan localFilesArray];
        NSError *error = nil;
        BOOL ret;
        for (NSString *name in array) {
            NSString *path = [[Logan loganLogDirectory] stringByAppendingPathComponent:name];
            ret = [[NSFileManager defaultManager] removeItemAtPath:path error:&error];
        }
    });
}

- (BOOL)hasFreeSpece {
    NSTimeInterval now = [[NSDate date] timeIntervalSince1970];
    if (now > (_lastCheckFreeSpace + 60)) {
        _lastCheckFreeSpace = now;
            // 每隔至少1分钟，检查一下剩余空间
        long long freeDiskSpace = [self freeDiskSpaceInBytes];
        if (freeDiskSpace <= 5 * 1024 * 1024) {
                // 剩余空间不足5m时，不再写入
            return NO;
        }
    }
    return YES;
}

- (long long)freeDiskSpaceInBytes {
    struct statfs buf;
    long long freespace = -1;
    if (statfs("/var", &buf) >= 0) {
        freespace = (long long)(buf.f_bsize * buf.f_bfree);
    }
    return freespace;
}

- (NSInteger)getThreadNum {
    NSString *description = [[NSThread currentThread] description];
    NSRange beginRange = [description rangeOfString:@"{"];
    NSRange endRange = [description rangeOfString:@"}"];
    
    if (beginRange.location == NSNotFound || endRange.location == NSNotFound) return -1;
    
    NSInteger length = endRange.location - beginRange.location - 1;
    if (length < 1) {
        return -1;
    }
    
    NSRange keyRange = NSMakeRange(beginRange.location + 1, length);
    
    if (keyRange.location == NSNotFound) {
        return -1;
    }
    
    if (description.length > (keyRange.location + keyRange.length)) {
        NSString *keyPairs = [description substringWithRange:keyRange];
        NSArray *keyValuePairs = [keyPairs componentsSeparatedByString:@","];
        for (NSString *keyValuePair in keyValuePairs) {
            NSArray *components = [keyValuePair componentsSeparatedByString:@"="];
            if (components.count) {
                NSString *key = components[0];
                key = [key stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
                if (([key isEqualToString:@"num"] || [key isEqualToString:@"number"]) && components.count > 1) {
                    return [components[1] integerValue];
                }
            }
        }
    }
    return -1;
}

- (void)printfLog:(NSString *)log type:(NSUInteger)type {
    static time_t dtime = -1;
    if (dtime == -1) {
        time_t tm;
        time(&tm);
        struct tm *t_tm;
        t_tm = localtime(&tm);
        dtime = t_tm->tm_gmtoff;
    }
    struct timeval time;
    gettimeofday(&time, NULL);
    int secOfDay = (time.tv_sec + dtime) % (3600 * 24);
    int hour = secOfDay / 3600;
    int minute = secOfDay % 3600 / 60;
    int second = secOfDay % 60;
    int millis = time.tv_usec / 1000;
    NSString *str = [[NSString alloc] initWithFormat:@"%02d:%02d:%02d.%03d [%lu] %@\n", hour, minute, second, millis, (unsigned long)type, log];
    const char *buf = [str cStringUsingEncoding:NSUTF8StringEncoding];
    printf("%s", buf);
}
#pragma mark - notification
- (void)addNotification {
    // App Extension
    if ( [[[NSBundle mainBundle] bundlePath] hasSuffix:@".appex"] ) {
        return ;
    }
#if TARGET_OS_IPHONE
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(appWillEnterForeground) name:UIApplicationWillEnterForegroundNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(appDidEnterBackground) name:UIApplicationDidEnterBackgroundNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(appWillTerminate) name:UIApplicationWillTerminateNotification object:nil];
#else
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(appWillEnterForeground) name:NSApplicationWillBecomeActiveNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(appDidEnterBackground) name:NSApplicationDidResignActiveNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(appWillTerminate) name:NSApplicationWillTerminateNotification object:nil];
#endif

}

- (void)appWillResignActive {
    [self flush];
}

- (void)appDidEnterBackground {
    [self flush];
}

- (void)appWillEnterForeground {
    [self flush];
}

- (void)appWillTerminate {
    [self flush];
}

- (void)filePathForDate:(NSString *)date block:(LoganFilePathBlock)filePathBlock {
    NSString *uploadFilePath = nil;
    NSString *filePath = nil;
    if (date.length) {
        NSArray *allFiles = [Logan localFilesArray];
        if ([allFiles containsObject:date]) {
            filePath = [Logan logFilePath:date];
            if ([[NSFileManager defaultManager] fileExistsAtPath:filePath]) {
                uploadFilePath = filePath;
            }
        }
    }
    
    if (uploadFilePath.length) {
        if ([date isEqualToString:[Logan currentDate]]) {
            dispatch_async(self.loganQueue, ^{
                [self todayFilePatch:filePathBlock];
            });
            return;
        }
    }
    dispatch_async(dispatch_get_main_queue(), ^{
        filePathBlock(uploadFilePath);
    });
}

- (void)todayFilePatch:(LoganFilePathBlock)filePathBlock {
    [self flushInQueue];
    NSString *uploadFilePath = [Logan uploadFilePath:[Logan currentDate]];
    NSString *filePath = [Logan logFilePath:[Logan currentDate]];
    NSError *error;
    [[NSFileManager defaultManager] removeItemAtPath:uploadFilePath error:&error];
    if (![[NSFileManager defaultManager] copyItemAtPath:filePath toPath:uploadFilePath error:&error]) {
        uploadFilePath = nil;
    }
    
    dispatch_async(dispatch_get_main_queue(), ^{
        filePathBlock(uploadFilePath);
    });
}

- (void)reTemFile {
    NSArray *allFiles = [Logan localFilesArray];
    for (NSString *f in allFiles) {
        if ([f hasSuffix:@".temp"]) {
            NSString *filePath = [Logan logFilePath:f];
            [[NSFileManager defaultManager] removeItemAtPath:filePath error:NULL];
        }
    }
}


- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

+ (NSDictionary *)allFilesInfo {
    NSArray *allFiles = [Logan localFilesArray];
    NSString *dateFormatString = @"yyyy-MM-dd";
    NSMutableDictionary *infoDic = [NSMutableDictionary new];
    for (NSString *file in allFiles) {
        if ([file pathExtension].length > 0) {
            continue;
        }
        NSString *dateString = [file substringToIndex:dateFormatString.length];
        unsigned long long gzFileSize = [Logan fileSizeAtPath:[self logFilePath:dateString]];
        NSString *size = [NSString stringWithFormat:@"%llu", gzFileSize];
        [infoDic setObject:size forKey:dateString];
    }
    return infoDic;
}

#pragma mark - file

+ (void)uploadFileToServer:(NSString *)urlStr date:(NSString *)date appId:(NSString *)appId unionId:(NSString *)unionId deviceId:(NSString *)deviceId resultBlock:(LoganUploadResultBlock)resultBlock {
	loganUploadFilePath(date, ^(NSString *_Nullable filePatch) {
		if (filePatch == nil) {
			if(resultBlock){
				dispatch_async(dispatch_get_main_queue(), ^{
					NSError * error = [NSError errorWithDomain:@"come.meituan.logan.error" code:-100 userInfo:@{@"info" : [NSString stringWithFormat:@"can't find file of %@",date]}];
					resultBlock(nil,nil,error);
				});
			}
			return;
		}
		NSURL *url = [NSURL URLWithString:urlStr];
		NSMutableURLRequest *req = [[NSMutableURLRequest alloc] initWithURL:url cachePolicy:NSURLRequestReloadIgnoringCacheData timeoutInterval:60];
		[req setHTTPMethod:@"POST"];
		[req addValue:@"binary/octet-stream" forHTTPHeaderField:@"Content-Type"];
		if(appId.length >0){
			[req addValue:appId forHTTPHeaderField:@"appId"];
		}
		if(unionId.length >0){
			[req addValue:unionId forHTTPHeaderField:@"unionId"];
		}
		NSString *bundleVersion = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleVersion"];
		if (bundleVersion.length > 0) {
			[req addValue:bundleVersion forHTTPHeaderField:@"bundleVersion"];
		}
		
		if(deviceId.length >0){
			[req addValue:deviceId forHTTPHeaderField:@"deviceId"];
		}
		[req addValue:[[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleShortVersionString"] forHTTPHeaderField:@"appVersion"];
		[req addValue:@"2" forHTTPHeaderField:@"deviceType"];
		[req addValue:date forHTTPHeaderField:@"fileDate"];
		
		NSURL *fileUrl = [NSURL fileURLWithPath:filePatch];
		NSURLSessionUploadTask *task = [[NSURLSession sharedSession] uploadTaskWithRequest:req fromFile:fileUrl completionHandler:^(NSData *_Nullable data, NSURLResponse *_Nullable response, NSError *_Nullable error) {
			if(resultBlock){
				dispatch_async(dispatch_get_main_queue(), ^{
					resultBlock(data,response,error);
				});
			}
		}];
		[task resume];
	});
}

+ (void)deleteOutdatedFiles {
    NSArray *allFiles = [Logan localFilesArray];
    __block NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
    NSString *dateFormatString = @"yyyy-MM-dd";
    [formatter setDateFormat:dateFormatString];
    [allFiles enumerateObjectsUsingBlock:^(NSString *_Nonnull dateStr, NSUInteger idx, BOOL *_Nonnull stop) {
            // 检查后缀名
        if ([dateStr pathExtension].length > 0) {
            [self deleteLoganFile:dateStr];
            return;
        }
        
            // 检查文件名长度
        if (dateStr.length != (dateFormatString.length)) {
            [self deleteLoganFile:dateStr];
            return;
        }
            // 文件名转化为日期
        dateStr = [dateStr substringToIndex:dateFormatString.length];
        NSDate *date = [formatter dateFromString:dateStr];
        NSString *todayStr = [Logan currentDate];
        NSDate *todayDate = [formatter dateFromString:todayStr];
        if (!date || [self getDaysFrom:date To:todayDate] >= __max_reversed_date) {
                // 删除过期文件
            [self deleteLoganFile:dateStr];
        }
    }];
}

+ (void)deleteLoganFile:(NSString *)name {
    NSFileManager *fileManager = [NSFileManager defaultManager];
    [fileManager removeItemAtPath:[[self loganLogDirectory] stringByAppendingPathComponent:name] error:nil];
}

+ (NSInteger)getDaysFrom:(NSDate *)serverDate To:(NSDate *)endDate {
    NSCalendar *gregorian = [[NSCalendar alloc]
                             initWithCalendarIdentifier:NSCalendarIdentifierGregorian];
    
    NSDate *fromDate;
    NSDate *toDate;
    [gregorian rangeOfUnit:NSCalendarUnitDay startDate:&fromDate interval:NULL forDate:serverDate];
    [gregorian rangeOfUnit:NSCalendarUnitDay startDate:&toDate interval:NULL forDate:endDate];
    NSDateComponents *dayComponents = [gregorian components:NSCalendarUnitDay fromDate:fromDate toDate:toDate options:0];
    return dayComponents.day;
}

+ (NSString *)uploadFilePath:(NSString *)date {
    return [[self loganLogDirectory] stringByAppendingPathComponent:[NSString stringWithFormat:@"%@.temp", date]];
}
+ (NSString *)logFilePath:(NSString *)date {
    return [[Logan loganLogDirectory] stringByAppendingPathComponent:[Logan logFileName:date]];
}

+ (NSString *)logFileName:(NSString *)date {
    return [NSString stringWithFormat:@"%@", date];
}

+ (unsigned long long)fileSizeAtPath:(NSString *)filePath {
    if (filePath.length == 0) {
        return 0;
    }
    NSFileManager *fileManager = [NSFileManager defaultManager];
    BOOL isExist = [fileManager fileExistsAtPath:filePath];
    if (isExist) {
        return [[fileManager attributesOfItemAtPath:filePath error:nil] fileSize];
    } else {
        return 0;
    }
}

+ (NSArray *)localFilesArray {
    return [[[[NSFileManager defaultManager] contentsOfDirectoryAtPath:[self loganLogDirectory] error:nil] filteredArrayUsingPredicate:[NSPredicate predicateWithFormat:@"SELF CONTAINS[cd] '-'"]] sortedArrayUsingSelector:@selector(compare:)]; //[c]不区分大小写 , [d]不区分发音符号即没有重音符号 , [cd]既不区分大小写，也不区分发音符号。
}

+ (NSString *)currentDate {
    NSString *key = @"LOGAN_CURRENTDATE";
    NSMutableDictionary *dictionary = [[NSThread currentThread] threadDictionary];
    NSDateFormatter *dateFormatter = [dictionary objectForKey:key];
    if (!dateFormatter) {
        dateFormatter = [[NSDateFormatter alloc] init];
        [dictionary setObject:dateFormatter forKey:key];
        [dateFormatter setLocale:[NSLocale localeWithLocaleIdentifier:@"en_US_POSIX"]];
        [dateFormatter setDateFormat:@"yyyy-MM-dd"];
        [dictionary setObject:dateFormatter forKey:key];
    }
    return [dateFormatter stringFromDate:[NSDate new]];
}

+ (NSString *)loganLogDirectory {
    static NSString *dir = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        dir = [[NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0] stringByAppendingPathComponent:@"LoganLoggerv3"];
    });
    return dir;
}
@end
