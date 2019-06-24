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

#import <XCTest/XCTest.h>
#import "Logan.h"


@interface LoganTests : XCTestCase

@end


@implementation LoganTests

- (void)setUp {
    [super setUp];
    NSData *keydata = [@"0123456789012345" dataUsingEncoding:NSUTF8StringEncoding];
    NSData *ivdata = [@"0123456789012345" dataUsingEncoding:NSUTF8StringEncoding];
    uint64_t file_max = 10 * 1024 * 1024;
    loganInit(keydata, ivdata, file_max);
    logan(1, @"test");
    loganUseASL(YES);
    loganPrintClibLog(YES);
}

- (void)tearDown {
    [super tearDown];
}

- (void)testWirte {
    logan(1, @"test");
}

- (void)testClear {
    loganClearAllLogs();
}

- (void)testAllFilesInfo {
    NSDictionary *info = loganAllFilesInfo();
    XCTAssertNotNil(info, @"all files info should not be nil");
}

- (void)testTodaysDate {
    XCTAssertNotNil(loganTodaysDate(), @"todays date should not be nil");
}

- (void)testUploadFilePath {
    loganUploadFilePath(loganTodaysDate(), ^(NSString *_Nullable filePatch) {
        XCTAssertNotNil(filePatch, @"file patch should not be nil");
    });
}

- (void)testFlush {
    loganFlush();
}

@end
