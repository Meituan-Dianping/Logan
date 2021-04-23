import 'dart:async';

import 'package:flutter/services.dart';
import 'package:flutter_logan/flutter_logan.dart';
import 'package:flutter/material.dart';

void main() => runApp(MyApp());

class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  String _showText = 'you should init log first';

  @override
  initState() {
    initLog();
    super.initState();
  }

  Future<void> initLog() async {
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
    if (!mounted) return;
    setState(() {
      _showText = result;
    });
  }

  Future<void> log() async {
    String result = 'Write log succeed';
    try {
      await FlutterLogan.log(10, 'this is log string');
    } on PlatformException {
      result = 'Failed to write log';
    }
    if (!mounted) return;
    setState(() {
      _showText = result;
    });
  }

  Future<void> getUploadPath() async {
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
    if (!mounted) return;
    setState(() {
      _showText = result;
    });
  }

  Future<void> flush() async {
    String result = 'Flush log succeed';
    try {
      await FlutterLogan.flush();
    } on PlatformException {
      result = 'Failed to flush log';
    }
    if (!mounted) return;
    setState(() {
      _showText = result;
    });
  }

  Future<void> cleanAllLog() async {
    String result = 'Clean log succeed';
    try {
      await FlutterLogan.cleanAllLogs();
    } on PlatformException {
      result = 'Failed to clean log';
    }
    if (!mounted) return;
    setState(() {
      _showText = result;
    });
  }

  Future<void> uploadToServer() async {
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
    if (!mounted) return;
    setState(() {
      _showText = result;
    });
  }

  Widget buttonWidge(String title, Function event) {
    Color color = Theme.of(context).primaryColor;
    return new Column(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        new FlatButton(
          onPressed: event,
          child: Text(title),
          color: color,
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    Widget buttonSection = new Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            buttonWidge('flush', flush),
            buttonWidge('cleanAllLog', cleanAllLog),
          ],
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            buttonWidge('log', log),
            buttonWidge('getUploadUrl', getUploadPath),
            buttonWidge('uploadToServer', uploadToServer),
          ],
        ),
      ],
    );

    return MaterialApp(
      home: Scaffold(
          appBar: AppBar(
            title: const Text('Plugin example app'),
          ),
          body: Column(
            children: [
              new Container(
                margin: const EdgeInsets.only(top: 30.0),
                child: buttonSection,
              ),
              new Container(
                margin: const EdgeInsets.only(top: 30.0,left: 10,right: 10),
                child: new Text(_showText),
              )
            ],
          )),
    );
  }
}
