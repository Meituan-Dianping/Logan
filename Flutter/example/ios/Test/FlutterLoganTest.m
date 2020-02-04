//
//  FlutterLoganTest.m
//  Runner_test
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
			FlutterMethodCall *call = [FlutterMethodCall methodCallWithMethodName:@"init" arguments:@{
				@"aesKey": @"0123456789012345",
				@"aesIv": @"0123456789012345",
				@"MaxFileLen": @(1024*1024*10)}];
			[plugin handleMethodCall:call result:^(id  _Nullable result) {
				
			}];
		});
		it(@"log", ^{
			FlutterMethodCall *call = [FlutterMethodCall methodCallWithMethodName:@"log" arguments:@{
				@"type": @10,
				@"log": @"this is a test log"}];
			[plugin handleMethodCall:call result:^(id  _Nullable result) {
				
			}];
		});
		it(@"flush", ^{
			FlutterMethodCall *call = [FlutterMethodCall methodCallWithMethodName:@"flush" arguments:@{}];
			[plugin handleMethodCall:call result:^(id  _Nullable result) {
				
			}];
		});
		it(@"getUploadPath", ^{
			FlutterMethodCall *call = [FlutterMethodCall methodCallWithMethodName:@"getUploadPath" arguments:@{}];
			[plugin handleMethodCall:call result:^(id  _Nullable result) {
				
			}];
		});
		it(@"upload", ^{
			FlutterMethodCall *call = [FlutterMethodCall methodCallWithMethodName:@"upload" arguments:@{
				@"date" : @"2019-12-20",
				@"url" : @"test/url",
				@"appId" : @"FlutterTestAppId",
				@"unionId" : @"FlutterTestAppId",
				@"deviceId" : @"FlutterTestAppId";
			}];
			[plugin handleMethodCall:call result:^(id  _Nullable result) {
				
			}];
		});
		it(@"cleanLogs", ^{
			FlutterMethodCall *call = [FlutterMethodCall methodCallWithMethodName:@"cleanAllLogs" arguments:@{}];
			[plugin handleMethodCall:call result:^(id  _Nullable result) {
				
			}];
		});
	
	});
});


SPEC_END
