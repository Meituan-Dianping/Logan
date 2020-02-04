//
//  flutter_logan_exampleTests.m
//  flutter_logan_exampleTests
//
//  Created by M小军 on 2019/12/20.
//  Copyright © 2019 The Chromium Authors. All rights reserved.
//

#import <XCTest/XCTest.h>
#import <Kiwi/Kiwi.h>
#import "FlutterLoganPlugin.h"
#import <Flutter/Flutter.h>

SPEC_BEGIN(FlutterLogan)

describe(@"Flutter Logan test", ^{
	context(@"func test", ^{
		FlutterLoganPlugin *plugin = [FlutterLoganPlugin new];
		
		it(@"init", ^{
			dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
			__block NSNumber *callBack = nil;
			FlutterMethodCall *call = [FlutterMethodCall methodCallWithMethodName:@"init" arguments:@{
				@"aesKey": @"0123456789012345",
				@"aesIv": @"0123456789012345",
				@"MaxFileLen": @(1024*1024*10)}];
			[plugin handleMethodCall:call result:^(id  _Nullable result) {
				callBack = result;
				dispatch_semaphore_signal(semaphore);
			}];
			dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
			[[callBack shouldNot] beNil];
		});
		it(@"log", ^{
			dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
			__block NSNumber *callBack = nil;
			FlutterMethodCall *call = [FlutterMethodCall methodCallWithMethodName:@"log" arguments:@{
				@"type": @10,
				@"log": @"this is a test log"}];
			[plugin handleMethodCall:call result:^(id  _Nullable result) {
				callBack = result;
				dispatch_semaphore_signal(semaphore);
			}];
			dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
			[[callBack should] beNil];
		});
		it(@"flush", ^{
			dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
			__block NSNumber *callBack = nil;
			FlutterMethodCall *call = [FlutterMethodCall methodCallWithMethodName:@"flush" arguments:@{}];
			[plugin handleMethodCall:call result:^(id  _Nullable result) {
				callBack = result;
				dispatch_semaphore_signal(semaphore);
			}];
			dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
			[[callBack should] beNil];
		});
		it(@"getUploadPath", ^{
			__block NSNumber *callBack = nil;
			FlutterMethodCall *call = [FlutterMethodCall methodCallWithMethodName:@"getUploadPath" arguments:@{@"date" : @"2019-12-23"}];
			[plugin handleMethodCall:call result:^(id  _Nullable result) {
				callBack = result;
			}];
			[[callBack shouldNotEventuallyBeforeTimingOutAfter(3)] beNil];
		});
		it(@"upload", ^{
			__block NSNumber *callBack = nil;
			FlutterMethodCall *call = [FlutterMethodCall methodCallWithMethodName:@"upload" arguments:@{
				@"date" : @"2019-12-23",
				@"url" : @"test/url",
				@"appId" : @"FlutterTestAppId",
				@"unionId" : @"FlutterTestAppId",
				@"deviceId" : @"FlutterTestAppId"
			}];
			[plugin handleMethodCall:call result:^(id  _Nullable result) {
				callBack = result;
				NSLog(@"%@ ******** ",result);
			}];
			[[callBack shouldNotEventuallyBeforeTimingOutAfter(3)] beNil];
			
		});
		it(@"cleanLogs", ^{
			dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
			__block NSNumber *callBack = nil;
			FlutterMethodCall *call = [FlutterMethodCall methodCallWithMethodName:@"cleanAllLogs" arguments:@{}];
			[plugin handleMethodCall:call result:^(id  _Nullable result) {
				callBack = result;
				dispatch_semaphore_signal(semaphore);
			}];
			dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
			[[callBack should] beNil];
		});
	
	});
});


SPEC_END
