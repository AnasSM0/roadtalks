//
//  AppDelegate.swift
//  HighwayRadio
//
//  App lifecycle management
//

import UIKit

class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil
    ) -> Bool {
        // Configure audio session for VoIP
        configureAudioSession()
        
        return true
    }
    
    func applicationWillResignActive(_ application: UIApplication) {
        // App is about to become inactive (e.g., backgrounded)
        // Trigger disconnect if in active call
        NotificationCenter.default.post(name: .appWillResignActive, object: nil)
    }
    
    private func configureAudioSession() {
        do {
            let audioSession = AVAudioSession.sharedInstance()
            try audioSession.setCategory(.playAndRecord, mode: .voiceChat, options: [])
            try audioSession.setActive(false) // Activate only when call starts
        } catch {
            print("Failed to configure audio session: \(error)")
        }
    }
}

// MARK: - Notifications
extension Notification.Name {
    static let appWillResignActive = Notification.Name("appWillResignActive")
}

import AVFoundation
