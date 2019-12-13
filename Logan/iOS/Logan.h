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

#import <Foundation/Foundation.h>

extern void loganUseASL(BOOL b);

typedef void (^LoganUploadResultBlock)(NSData *_Nullable data, NSURLResponse *_Nullable response, NSError *_Nullable error);

/**
 返回文件路径
 
 @param filePatch filePath nil时表示文件不存在
 */
typedef void (^LoganFilePathBlock)(NSString *_Nullable filePath);

/**
 logan初始化
 
 @param aes_key16 16位aes加密key
 @param aes_iv16  16位aes加密iv
 @param max_file  日志文件最大大小，超过该大小后日志将不再被写入，单位：byte。
 */
extern void loganInit(NSData *_Nonnull aes_key16, NSData *_Nonnull aes_iv16, uint64_t max_file);

/**
 设置本地保存最大文件天数

 @param max_reversed_date 超过该文件天数的文件会被Logan删除，默认7天
 */
extern void loganSetMaxReversedDate(int max_reversed_date);
/**
 记录Logan日志
 
 @param type 日志类型
 @param log  日志字符串
 
 @brief
 用例：
 logan(1, @"this is a test");
 */
extern void logan(NSUInteger type, NSString *_Nonnull log);

/**
 将日志全部输出到控制台的开关，默认NO
 
 @param b 开关
 */
extern void loganUseASL(BOOL b);

/**
 立即写入日志文件
 */
extern void loganFlush(void);

/**
 日志信息输出开关，默认NO
 
 @param b 开关
 */
extern void loganPrintClibLog(BOOL b);

/**
 清除本地所有日志
 */
extern void loganClearAllLogs(void);

/**
 返回本地所有文件名及大小(单位byte)
 
 @return @{@"2018-11-21":@"110"}
 */
extern NSDictionary *_Nullable loganAllFilesInfo(void);

/**
 根据日期获取上传日志的文件路径，异步方式！
 
 @param date 日志日期 格式："2018-11-21"
 @param filePathBlock 回调返回文件路径，在主线程中回调
 */
extern void loganUploadFilePath(NSString *_Nonnull date, LoganFilePathBlock _Nonnull filePathBlock);

/**
 上传指定日期的日志
 
 @param url 接受日志的服务器完整url
 @param date 日志日期 格式："2018-11-21"
 @param appId 当前应用的唯一标识,在多App时区分日志来源App
 @param unionId 当前用户的唯一标识,用来区分日志来源用户
 @param resultBlock 服务器返回结果
 */
extern void loganUpload(NSString * _Nonnull url, NSString * _Nonnull date,NSString * _Nullable appId, NSString *_Nullable unionId,NSString *_Nullable deviceId, LoganUploadResultBlock _Nullable resultBlock);

/**
 返回今天日期
 
 @return @"2018-11-21"
 */
extern NSString *_Nonnull loganTodaysDate(void);
