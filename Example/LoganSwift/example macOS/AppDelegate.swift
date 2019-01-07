//
//  AppDelegate.swift
//  example macOS
//
//  Created by Hanguang on 2019/1/7.
//  Copyright © 2019 hanguang. All rights reserved.
//

import Cocoa
import LoganSwift

let Logan = LoganImpl(context: LoganEncryptionHandler())

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate {

    func applicationDidFinishLaunching(_ aNotification: Notification) {
        Logan.useASL(true)
    }
    
    @IBOutlet weak var window: NSWindow!

    @IBOutlet weak var filesInfo: NSTextField!
    @IBOutlet weak var ipTextField: NSTextField!
    
    private var count: Int = -1
    
    @IBAction func logTest(_ sender: NSButton) {
        for _ in 0..<10 {
            count += 1
            eventLog(1, label: "click button \(count)")
        }
    }
    
    @IBAction func allFilesInfo(_ sender: NSButton) {
        let files = Logan.allFilesInfo()
        let log: NSMutableString = NSMutableString()
        for (k, v) in files {
            log.appendFormat("文件日期 %@，大小 %d byte\n", k, v)
        }
        
        filesInfo.stringValue = log as String
    }
    
    @IBAction func uploadFile(_ sender: NSButton) {
        Logan.filePath(Logan.currentDate) { [unowned self] (filePath) in
            guard !filePath.isEmpty else { return }
            let path = "http://\(self.ipTextField.stringValue):3000/logupload"
            let url = URL(string: path)!
            var request = URLRequest.init(url: url, cachePolicy: .reloadIgnoringCacheData, timeoutInterval: 15)
            request.httpMethod = "POST"
            request.addValue("binary/octet-stream", forHTTPHeaderField: "Content-Type")
            
            let fileUrl = URL(fileURLWithPath: filePath)
            let task = URLSession.shared.uploadTask(with: request, fromFile: fileUrl, completionHandler: { (data, urlResponse, error) in
                switch (data, urlResponse, error) {
                case (_, _, let error?):
                    print("upload failed: \(error)")
                case (let data?, let urlResponse as HTTPURLResponse, _):
                    print("upload success: data: \(data), response: \(urlResponse)")
                default:
                    print("upload failed)")
                }
            })
            
            task.resume()
        }
    }
    
    func eventLog(_ type: Int, label: String) {
        let log = "\(type)" + "    " + label
        Logan.log(1, log)
    }

}

