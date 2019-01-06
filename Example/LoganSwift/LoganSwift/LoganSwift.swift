//
//  LoganSwift.swift
//  LoganSwift
//
//  Created by Hanguang on 2019/1/5.
//  Copyright © 2019 hanguang. All rights reserved.
//

import Foundation
import Clogan

private let loganLogDirectory: String = {
    let path = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true).first! as NSString
    return path.appendingPathComponent("LoganLoggerv3") as String
}()

private var LOGANUSEASL = false;

private let AES_KEY: String = "0123456789012345"
private let AES_IV: String = "0123456789012345"
private let max_file: Int32 = 10 * 1024 * 1024

public protocol LoganEncryptionProvider {
    var aesKey: String { get }
    var aesIv: String { get }
    var fileSize: Int32 { get }
}

public extension LoganEncryptionProvider {
    var aesKey: String {
        return AES_KEY
    }
    
    var aesIv: String {
        return AES_IV
    }
    
    var fileSize: Int32 {
        return max_file
    }
}

public typealias FileInfo = (String, Int32)

final public class LoganImpl: LoganEncryptionProvider {
    private let loganQueue: DispatchQueue = DispatchQueue(label: "com.dianping.logan", qos: .utility)
    private var lastCheckFreeSpace: TimeInterval = 0
    private var lastLogDate: String = ""
    
    public func log(_ text: String, _ type: UInt) {
        
    }
    
    public func clearLogs() {
        
    }
    
    public func allFilesInfo() -> LoganSwift.FileInfo {
        return ("", 0)
    }
    
    public var currentDate: String {
        return ""
    }
    
    public func flash() {
        
    }
    
    public func filePath(date: String, _ closure: @escaping ()->(String)) {
        
    }
    
    public init() {
        loganQueue.async { [unowned self] in
            self.openClib()
//            [self addNotification];
//            [self reTemFile];
        }
    }
    
    public func useASL(_ b: Bool) {
        LOGANUSEASL = b
    }
    
    public func printClibLog(_ b: Bool) {
        let result: Int32 = b ? 1 : 0
        clogan_debug(result)
    }
    
    private func openClib() {
        let path = (loganLogDirectory as NSString).utf8String
        clogan_init(path, path, fileSize, aesKey.unsafePointerInt8, aesIv.unsafePointerInt8)
        clogan_open((currentDate as NSString).utf8String)
    }
    
}

extension String {
    var unsafePointerInt8: UnsafePointer<Int8> {
        let data = self.data(using: .utf8)! as NSData
        return data.bytes.bindMemory(to: Int8.self, capacity: data.length)
    }
}

