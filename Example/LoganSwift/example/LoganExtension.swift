//
//  LoganExtension.swift
//  example
//
//  Created by Hanguang on 2019/1/7.
//  Copyright © 2019 hanguang. All rights reserved.
//

import LoganSwift

struct LoganEncryptionHandler: LoganEncryptionContext {}

extension LoganEncryptionContext {
    var aesKey: String {
        return "1234567890abcdef"
    }
    
    var aesIv: String {
        return "1234567890abcdef"
    }
}
