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

import 'dart:async';
import 'dart:core';

import 'package:flutter/services.dart';

class FlutterLogan {
  static const MethodChannel _channel = const MethodChannel('flutter_logan');

  static Future<bool> init(
      String aseKey, String aesIv, int maxFileLen) async {
    final bool result = await _channel.invokeMethod('init',{'aesKey': aseKey, 'aesIv': aesIv, 'maxFileLen': maxFileLen});
    return result;
  }

  static Future<void> log(int type, String log) async {
    await _channel.invokeMethod('log', {'type': type, 'log': log});
  }

  static Future<String> getUploadPath(String date) async {
    final String result =
        await _channel.invokeMethod('getUploadPath', {'date': date});
    return result;
  }

  static Future<bool> upload(String serverUrl, String date, String appId, String unionId, String deviceId) async {
    final bool result = await _channel.invokeMethod('upload',{'date': date, 'serverUrl': serverUrl, 'appId': appId, 'unionId': unionId, 'deviceId': deviceId});
    return result;
  }

  static Future<void> flush() async {
    await _channel.invokeMethod('flush');
  }

  static Future<void> cleanAllLogs() async {
    await _channel.invokeMethod('cleanAllLogs');
  }
}
