//
//  LoganSwift.swift
//  LoganSwift
//
//  Created by Hanguang on 2019/1/5.
//  Copyright © 2019 hanguang. All rights reserved.
//

#if os(iOS)
import UIKit
#elseif os(macOS)
import AppKit
#endif

import Clogan

// MARK: - Public
/// Encryption context, such as key, iv and file size
public protocol LoganEncryptionContext {
    var aesKey: String { get }
    var aesIv: String { get }
    var fileSize: Int32 { get }
}

public extension LoganEncryptionContext {
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

public typealias FileInfo = [String: UInt64]

final public class LoganImpl {
    
    public init(context: LoganEncryptionContext) {
        loganQueue = DispatchQueue(label: "com.dianping.logan", qos: .utility)
        loganQueue.setSpecific(key: QueueSpecificKey, value: specific)
        self.context = context
        
        async { [unowned self] in
            self.openClib()
            self.addObserver()
            self.removeTempFile()
        }
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
    
    public var context: LoganEncryptionContext
    public var currentDate: String {
        return dateFormatter.string(from: Date())
    }
    
    // MARK: -
    private var specific = NSObject()
    private let loganQueue: DispatchQueue
    private var lastCheckFreeSpace: TimeInterval = 0
    private var lastLogDate: String = ""
    //    private var dtime: time_t = -1
}

/// public methods
extension LoganImpl {
    public func useASL(_ b: Bool) {
        LOGANUSEASL = b
    }
    
    public func printClibLog(_ b: Bool) {
        let result: Int32 = b ? 1 : 0
        clogan_debug(result)
    }
    
    public func log(_ type: Int, _ what: @autoclosure () -> String) {
        let text = what()
        guard !text.isEmpty else {
            return
        }
        
        let localTime = Date().timeIntervalSince1970*1000
        let threadNumber = self.threadNumber()
        let isMain = Thread.current.isMainThread
        let threadName = Thread.current.name != nil ? (Thread.current.name! as NSString) : ("" as NSString)
        
        let log = UnsafeMutablePointer<Int8>(mutating: (text as NSString).utf8String)
        let thread_name = UnsafeMutablePointer<Int8>(mutating: threadName.utf8String)
        
        if LOGANUSEASL {
            printLog(text, type: type)
        }
        
        guard hasFreeSpace() else {
            return
        }
        
        async { [unowned self] in
            let today = self.currentDate
            if !self.lastLogDate.isEmpty && self.lastLogDate != today {
                clogan_flush()
                clogan_open((today as NSString).utf8String)
            }
            self.lastLogDate = today
            
            clogan_write(Int32(type), log, Int64(localTime), thread_name, Int64(threadNumber), isMain ? 1 : 0)
        }
    }
    
    public func clearLogs() {
        async { [unowned self] in
            let paths = self.logFiles()
            for path in paths {
                do {
                    try FileManager.default.removeItem(atPath: (loganLogDirectory as NSString).appendingPathComponent(path))
                } catch let error {
                    print(error)
                }
            }
        }
    }
    
    public func allFilesInfo() -> LoganSwift.FileInfo {
        let paths = logFiles()
        let dateFormatString = "yyyy-MM-dd"
        var infoDic: FileInfo = [:]
        for path in paths {
            let path = path as NSString
            guard path.pathExtension.isEmpty else {
                continue
            }
            
            let dateString = path.substring(to: dateFormatString.count)
            let gzFileSize = fileSize(logFilePath(dateString))
            infoDic[dateString] = gzFileSize
        }
        
        return infoDic
    }
    
    public func flash() {
        async {
            clogan_flush()
        }
    }
    
    public func filePath(_ atDate: String, _ closure: @escaping (String) -> ()) {
        guard !atDate.isEmpty else {
            closure("")
            return
        }
        
        var filePath: String? = nil
        
        let paths = logFiles()
        if paths.contains(atDate) {
            let path = logFilePath(atDate)
            if FileManager.default.fileExists(atPath: path) {
                filePath = path
            }
        }
        
        guard let uploadFilePath = filePath else {
            closure("")
            return
        }
        
        if atDate == currentDate {
            async { [unowned self] in
                self.todayFilePath(closure)
            }
        } else {
            DispatchQueue.main.async {
                closure(uploadFilePath)
            }
        }
    }
}

/// print log
extension LoganImpl {
    private func printLog(_ what: @autoclosure () -> String, type: Int) {
        let string = what()
        
        //        if (dtime == -1) {
        //            var rawTime = time_t()
        //            time(&rawTime)
        //            var timeinfo = tm()
        //            localtime_r(&rawTime, &timeinfo)
        //            dtime = timeinfo.tm_gmtoff
        //        }
        //        struct timeval time;
        //        gettimeofday(&time, NULL);
        //        int secOfDay = (time.tv_sec + dtime) % (3600 * 24);
        //        int hour = secOfDay / 3600;
        //        int minute = secOfDay % 3600 / 60;
        //        int second = secOfDay % 60;
        //        int millis = time.tv_usec / 1000;
        
        var rawTime = time_t()
        time(&rawTime)
        var timeinfo = tm()
        localtime_r(&rawTime, &timeinfo)
        
        var curTime = timeval()
        gettimeofday(&curTime, nil)
        let milliseconds = curTime.tv_usec / 1000
        
        let content = String(format: "%02d:%02d:%02d.%03d [%d] %@",
                             arguments: [Int(timeinfo.tm_hour), Int(timeinfo.tm_min), Int(timeinfo.tm_sec), Int(milliseconds), type, string])
        print(content)
    }
}



/// Logan queue
extension LoganImpl {
    private func isCurrent() -> Bool {
        if DispatchQueue.getSpecific(key: QueueSpecificKey) === self.specific {
            return true
        } else {
            return false
        }
    }
    
    private func async(_ f: @escaping () -> Void) {
        if self.isCurrent() {
            f()
        } else {
            loganQueue.async(execute: f)
        }
    }
    
    private func sync(_ f: () -> Void) {
        if self.isCurrent() {
            f()
        } else {
            loganQueue.sync(execute: f)
        }
    }
    
    private func threadNumber() -> Int {
        let description = Thread.current.description as NSString
        let beginRange = description.range(of: "{")
        let endRange = description.range(of: "}")
        
        guard beginRange.location != NSNotFound && endRange.location != NSNotFound else {
            return -1
        }
        
        let length = endRange.location-beginRange.location-1
        guard length > 0 else {
            return -1
        }
        
        let keyRange = NSRange(location: beginRange.location+1, length: length)
        guard keyRange.location != NSNotFound else {
            return -1
        }
        
        if description.length > (keyRange.location+keyRange.length) {
            let keyPairs = description.substring(with: keyRange)
            let keyValuePairs = keyPairs.components(separatedBy: ",")
            for keyValuePair in keyValuePairs {
                let components = keyValuePair.components(separatedBy: "=")
                if !components.isEmpty {
                    var key = components.first!
                    key = key.trimmingCharacters(in: .whitespaces)
                    if (key == "num" || key == "number") && components.count > 1 {
                        return Int(components[1]) ?? -1
                    }
                }
            }
        }
        
        return -1
    }
}

/// file
extension LoganImpl {
    private func todayFilePath(_ closure: @escaping (String) -> ()) {
        flash()
        
        let date = currentDate
        var uploadFilePath = self.uploadFilePath(date)
        let filePath = logFilePath(date)
        
        do {
            try FileManager.default.removeItem(atPath: uploadFilePath)
        } catch let error {
            print(error)
        }
        
        do {
            try FileManager.default.copyItem(atPath: filePath, toPath: uploadFilePath)
        } catch let error {
            print(error)
            uploadFilePath = ""
        }
        
        DispatchQueue.main.async {
            closure(uploadFilePath)
        }
    }
    
    private func logFilePath(_ date: String) -> String {
        return (loganLogDirectory as NSString).appendingPathComponent(date)
    }
    
    private func uploadFilePath(_ date: String) -> String {
        return (loganLogDirectory as NSString).appendingPathComponent(date+".temp")
    }
    
    private func logFiles() -> [String] {
        guard let paths = try? FileManager.default.contentsOfDirectory(atPath: loganLogDirectory).filter({ (string) -> Bool in
            return string.contains("-")
        }).sorted() else {
            return []
        }
        return paths
    }
    
    private func hasFreeSpace() -> Bool {
        let now = Date().timeIntervalSince1970
        if now > lastCheckFreeSpace+60 {
            lastCheckFreeSpace = now
            if freeDiskSpaceInBytes() <= 5*1024*1024 {
                return false
            }
        }
        return true
    }
    
    private func freeDiskSpaceInBytes() -> Int64 {
        var available = false
        #if os(iOS)
        if #available(iOS 11.0, *) {
            available = true
            let fileURL = URL(fileURLWithPath: NSHomeDirectory() as String)
            guard let values = try? fileURL.resourceValues(forKeys: [.volumeAvailableCapacityForImportantUsageKey]),
                let capacity = values.volumeAvailableCapacityForImportantUsage
                else {
                    return -1
            }
            return capacity
        }
        #elseif os(macOS)
        if #available(OSX 10.13, *) {
            available = true
            let fileURL = URL(fileURLWithPath: NSHomeDirectory() as String)
            guard let values = try? fileURL.resourceValues(forKeys: [.volumeAvailableCapacityForImportantUsageKey]),
                let capacity = values.volumeAvailableCapacityForImportantUsage
                else {
                    return -1
            }
            return capacity
        }
        #endif
        if !available {
            let documentDirectory = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true).last!
            guard
                let systemAttributes = try? FileManager.default.attributesOfFileSystem(forPath: documentDirectory),
                let freeSize = systemAttributes[.systemFreeSize] as? NSNumber
                else {
                    return -1
            }
            return freeSize.int64Value
        }
    }
    
    private func fileSize(_ atPath: String) -> UInt64 {
        guard !atPath.isEmpty,
            FileManager.default.fileExists(atPath: atPath),
            let fileInfo = try? FileManager.default.attributesOfItem(atPath: atPath),
            let size = fileInfo[.size] as? UInt64
            else {
                return 0
        }
        return size
    }
}

/// Init methods
extension LoganImpl {
    private func openClib() {
        #if DEBUG
        print("===== logan aeskey: \(context.aesKey), aesiv: \(context.aesIv), fileSize: \(context.fileSize)")
        #endif
        
        let path = (loganLogDirectory as NSString).utf8String
        clogan_init(path, path, context.fileSize, context.aesKey.unsafePointerInt8, context.aesIv.unsafePointerInt8)
        clogan_open((currentDate as NSString).utf8String)
    }
    
    private func addObserver() {
        if Bundle.main.bundlePath.hasSuffix(".appex") {
            return
        }
        
        #if os(iOS)
        NotificationCenter.default.addObserver(self, selector: #selector(appWillEnterForeground), name: UIApplication.willEnterForegroundNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(appDidEnterBackground), name: UIApplication.didEnterBackgroundNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(appWillTerminate), name: UIApplication.willTerminateNotification, object: nil)
        #elseif os(macOS)
        NotificationCenter.default.addObserver(self, selector: #selector(appWillEnterForeground), name: NSApplication.willBecomeActiveNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(appDidEnterBackground), name: NSApplication.didResignActiveNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(appWillTerminate), name: NSApplication.willTerminateNotification, object: nil)
        #endif
    }
    
    private func removeTempFile() {
        let paths = logFiles()
        for path in paths {
            if path.hasSuffix(".temp") {
                let filePath = logFilePath(path)
                do {
                    try FileManager.default.removeItem(atPath: filePath)
                } catch let error {
                    print(error)
                    continue
                }
            }
        }
    }
    
    @objc private func appWillResignActive() {
        flash()
    }
    
    @objc private func appDidEnterBackground() {
        flash()
    }
    
    @objc private func appWillEnterForeground() {
        flash()
    }
    
    @objc private func appWillTerminate() {
        flash()
    }
}

// MARK: - Private global
private let QueueSpecificKey = DispatchSpecificKey<NSObject>()

private let loganLogDirectory: String = {
    let path = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true).first! as NSString
    return path.appendingPathComponent("LoganLoggerv3") as String
}()

private let dateFormatter: DateFormatter = {
    let dateFormatter = DateFormatter()
    dateFormatter.locale = Locale(identifier: "en_US_POSIX")
    dateFormatter.dateFormat = "yyyy-MM-dd"
    return dateFormatter
}()

private var LOGANUSEASL = false;

private let AES_KEY: String = "0123456789012345"
private let AES_IV: String = "0123456789012345"
private let max_file: Int32 = 10 * 1024 * 1024

/// String extension
extension String {
    var unsafePointerInt8: UnsafePointer<Int8>? {
        guard let data = self.data(using: .utf8) as NSData? else {
            return nil
        }
        return data.bytes.bindMemory(to: Int8.self, capacity: data.length)
    }
}
