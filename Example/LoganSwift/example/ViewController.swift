//
//  ViewController.swift
//  example
//
//  Created by Hanguang on 2019/1/7.
//  Copyright © 2019 hanguang. All rights reserved.
//

import UIKit
import LoganSwift

class ViewController: UIViewController {

    private var count: Int = -1
    
    override func viewDidLoad() {
        super.viewDidLoad()
    }

    @IBOutlet weak var filesInfo: UITextView!
    @IBOutlet weak var ipTextField: UITextField!
    
    
    @IBAction func logTest(_ sender: UIButton) {
        for _ in 0..<10 {
            count += 1
            eventLog(1, label: "click button \(count)")
        }
    }
    
    @IBAction func allFilesInfo(_ sender: UIButton) {
        let files = Logan.allFilesInfo()
        let log: NSMutableString = NSMutableString()
        for (k, v) in files {
            log.appendFormat("文件日期 %@，大小 %d byte\n", k, v)
        }
        
        filesInfo.text = log as String
    }
    
    @IBAction func uploadFile(_ sender: UIButton) {
        Logan.filePath(Logan.currentDate) { [unowned self] (filePath) in
            guard !filePath.isEmpty else { return }
            let path = "http://\(self.ipTextField.text!):3000/logupload"
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

