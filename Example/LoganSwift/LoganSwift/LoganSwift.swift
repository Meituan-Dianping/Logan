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

final public class LoganImpl: LoganEncryptionContext {
    
    public func log(_ what: @autoclosure () -> String, _ type: Int32) {
        let text = what()
        guard !text.isEmpty else {
            return
        }
        
        let localTime = Date().timeIntervalSince1970*1000
        let threadName = Thread.current.name as NSString?
        let threadNumber = getThreadNumber()
        let isMain = Thread.current.isMainThread
        let threadNameC = threadName != nil ? (threadName! as NSString) : ("" as NSString)
        
        if LOGANUSEASL {
            printLog(text, type: type)
        }
        
        guard hasFreeSpace() else {
            return
        }
        
        async { [weak self] in
            guard let `self` = self else { return }
            let today = self.currentDate
            if !self.lastLogDate.isEmpty && self.lastLogDate != today {
                clogan_flush()
                clogan_open((today as NSString).utf8String)
            }
            self.lastLogDate = today
            let t = UnsafeMutablePointer<Int8>.init(mutating: (text as NSString).utf8String)
            let c = UnsafeMutablePointer<Int8>.init(mutating: threadNameC.utf8String)
            clogan_write(type, t, Int64(localTime), c, Int64(threadNumber), isMain ? 1 : 0)
        }
    }
    
    public func clearLogs() {
        async { [weak self] in
            guard let `self` = self else { return }
            let paths = self.localFilesArray()
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
        let paths = localFilesArray()
        let dateFormatString = "yyyy-MM-dd"
        var infoDic: FileInfo = [:]
        for path in paths {
            let path = path as NSString
            guard !path.pathExtension.isEmpty else {
                continue
            }
            
            let dateString = path.substring(to: dateFormatString.count)
            let gzFileSize = fileSize(path: logFilePath(dateString))
            infoDic[dateString] = gzFileSize
        }
        
        return infoDic
    }
    
    private func fileSize(path: String) -> UInt64 {
        guard !path.isEmpty,
            FileManager.default.fileExists(atPath: path),
            let fileInfo = try? FileManager.default.attributesOfItem(atPath: path),
            let size = fileInfo[.size] as? UInt64
            else {
                return 0
        }
        
        return size
        
    }
    
    public var currentDate: String {
        return dateFormatter.string(from: Date())
    }
    
    public func flash() {
        async {
            clogan_flush()
        }
    }
    
    public func filePath(date: String, _ closure: @escaping (String) -> ()) {
        guard !date.isEmpty else {
            closure("")
            return
        }
        
        var filePath: String? = nil
        
        let paths = localFilesArray()
        if paths.contains(date) {
            let path = logFilePath(date)
            if FileManager.default.fileExists(atPath: path) {
                filePath = path
            }
        }
        
        guard let uploadFilePath = filePath else {
            closure("")
            return
        }
        
        async { [weak self] in
            guard let `self` = self else { return }
            if date == self.currentDate {
                self.todayFilePath(closure)
            } else {
                closure(uploadFilePath)
            }
        }
    }
    
    private func todayFilePath(_ closure: (String) -> ()) {
        flash()
        
        var uploadFilePath = self.uploadFilePath(currentDate)
        let filePath = logFilePath(currentDate)
        
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
        
        closure(uploadFilePath)
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }
    
    private func logFilePath(_ date: String) -> String {
        return (loganLogDirectory as NSString).appendingPathComponent(date)
    }

    public init() {
        loganQueue = DispatchQueue(label: "com.dianping.logan", qos: .utility)
        loganQueue.setSpecific(key: QueueSpecificKey, value: specific)
        
        async { [unowned self] in
            self.openClib()
            self.addNotification()
            self.removeTempFile()
        }
    }
    
    public func isCurrent() -> Bool {
        if DispatchQueue.getSpecific(key: QueueSpecificKey) === self.specific {
            return true
        } else {
            return false
        }
    }
    
    public func async(_ f: @escaping () -> Void) {
        if self.isCurrent() {
            f()
        } else {
            loganQueue.async(execute: f)
        }
    }
    
    public func sync(_ f: () -> Void) {
        if self.isCurrent() {
            f()
        } else {
            loganQueue.sync(execute: f)
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
    
    private func addNotification() {
        if Bundle.main.bundlePath.hasSuffix(".appex") {
            return
        }
        
        #if os(iOS)
        NotificationCenter.default.addObserver(self, selector: #selector(appWillEnterForeground), name: UIApplication.willEnterForegroundNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(appDidEnterBackground), name: UIApplication.didEnterBackgroundNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(appWillTerminate), name: UIApplication.willTerminateNotification, object: nil)
        #elseif os(macOS)
        NotificationCenter.default.addObserver(self, selector: #selector(appWillEnterForeground), name: NSApplication.willEnterForegroundNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(appDidEnterBackground), name: NSApplication.didEnterBackgroundNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(appWillTerminate), name: NSApplication.willTerminateNotification, object: nil)
        #endif
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
    
    private func removeTempFile() {
        let paths = localFilesArray()
        for path in paths {
            if path.hasSuffix(".temp") {
                do {
                    try FileManager.default.removeItem(atPath: path)
                } catch let error {
                    print(error)
                }
            }
        }
    }
    
    private func uploadFilePath(_ date: String) -> String {
        return (loganLogDirectory as NSString).appendingPathComponent(date+".temp")
    }
    
    private func localFilesArray() -> [String] {
        guard let paths = try? FileManager.default.contentsOfDirectory(atPath: loganLogDirectory).filter({ (string) -> Bool in
            return string.contains("-")
        }).sorted() else {
            return []
        }
        return paths
    }
    
    
    private func getThreadNumber() -> Int {
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
    
    // MARK: -
    private var specific = NSObject()
    private let loganQueue: DispatchQueue
    private var lastCheckFreeSpace: TimeInterval = 0
    private var lastLogDate: String = ""
    //    private var dtime: time_t = -1
    
    private func printLog(_ what: @autoclosure () -> String, type: Int32) {
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
    
    private func hasFreeSpace() -> Bool {
        let now = Date().timeIntervalSince1970
        if now > lastCheckFreeSpace+60 {
            lastCheckFreeSpace = now
            let freeDiskSpace = freeDiskSpaceInBytes()
            if freeDiskSpace <= 5*1024*1024 {
                return false
            }
        }
        return true
    }
    
    private func freeDiskSpaceInBytes() -> Int64 {
        let fileURL = URL(fileURLWithPath: NSHomeDirectory() as String)
        guard let values = try? fileURL.resourceValues(forKeys: [.volumeAvailableCapacityForImportantUsageKey]), let capacity = values.volumeAvailableCapacityForImportantUsage else {
            return -1
        }
        
        return capacity
    }
}

extension String {
    var unsafePointerInt8: UnsafePointer<Int8> {
        let data = self.data(using: .utf8)! as NSData
        return data.bytes.bindMemory(to: Int8.self, capacity: data.length)
    }
}

// MARK: - Private
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

