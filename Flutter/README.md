# flutter_logan
This is a plugin privide an ability to use Logan in Flutter like native.It use MethodChannel to call method implement by Logan.so the native part of Logan is required.But there is no need to worry,Logan is a lightweight log system,it will not significantly make your package volume larger.

### Getting Started
How to use?
It is important to call **init** befor use Logan, you cant call **init** either in Flutter(**FlutterLogan.init**) or in native(**loganInit**).

### Init
**important!!! you must replace this key and iv by your own.change key and iv at new version is more secure. we will provide a more secure way to protect your logs in the future.**
```Dart
	String result = 'Failed to init log';
    try {
      final bool back = await FlutterLogan.init(
          '0123456789012345', '0123456789012345', 1024 * 1024 * 10);
      if (back) {
        result = 'Init log succeed';
      }
    } on PlatformException {
      result = 'Failed to init log';
    }
```

### Usage
Write a log:
```Dart
	String result = 'Write log succeed';
    try {
      await FlutterLogan.log(10, 'this is log string');
    } on PlatformException {
      result = 'Failed to write log';
    }
```
If you want to write log to file immediately, you need to call flush function:
```Dart
 	String result = 'Flush log succeed';
    try {
      await FlutterLogan.flush();
    } on PlatformException {
      result = 'Failed to flush log';
    }
```
you can use this method to upload your logs directly into your server. we also provide logan server source code ,you can find it in Logan open souce Repository.
```Dart
	String result = 'Failed upload to server';
    try {
      final today = DateTime.now();
      final date = "${today.year.toString()}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}";
      final bool back = await FlutterLogan.upload(
          'http://127.0.0.1:3000/logupload',
          date,
          'FlutterTestAppId',
          'FlutterTestUnionId',
          'FlutterTestDeviceId'
          );
      if (back) {
        result = 'Upload to server succeed';
      }
    } on PlatformException {
      result = 'Failed upload to server';
    }
```
Logan provides a method for obtaining log files and performs preprocessing operations on the logs that need to be uploaded. Log  can be uploaded by implementing the network upload function.
```Dart
 	String result;
    try {
      final today = DateTime.now();
      final date = "${today.year.toString()}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}";
      final String path = await FlutterLogan.getUploadPath(date);
      if (path != null) {
        result = 'upload path = ' + path;
      } else {
        result = 'Failed to get upload path';
      }
    } on PlatformException {
      result = 'Failed to get upload path';
    }
	// implement your own method to upload
	....
```
Use this method to delete all logs
```Dart
	String result = 'Clean log succeed';
    try {
      await FlutterLogan.cleanAllLogs();
    } on PlatformException {
      result = 'Failed to clean log';
    }
```