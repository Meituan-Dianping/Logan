//
//  AppDelegate.swift
//  example
//
//  Created by Hanguang on 2019/1/7.
//  Copyright © 2019 hanguang. All rights reserved.
//

import UIKit
import LoganSwift

let Logan = LoganImpl(context: LoganEncryptionHandler())

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        Logan.useASL(true)
        return true
    }
}

