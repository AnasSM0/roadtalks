//
//  AudioService.swift
//  HighwayRadio
//
//  Audio session management + Bluetooth/headphone detection
//

import AVFoundation
import Combine

@MainActor
class AudioService: ObservableObject {
    @Published var isHeadsetConnected = false
    @Published var canUsePTT = false
    
    private let audioSession = AVAudioSession.sharedInstance()
    
    init() {
        checkHeadsetConnection()
        setupNotifications()
    }
    
    func setupAudioSession() throws {
        try audioSession.setCategory(.playAndRecord, mode: .voiceChat, options: [])
        try audioSession.setActive(true)
    }
    
    func deactivateAudioSession() {
        try? audioSession.setActive(false)
    }
    
    func checkHeadsetConnection() {
        let route = audioSession.currentRoute
        var headsetConnected = false
        
        for output in route.outputs {
            switch output.portType {
            case .bluetoothA2DP, .bluetoothHFP, .bluetoothLE, .headphones:
                headsetConnected = true
            default:
                break
            }
        }
        
        isHeadsetConnected = headsetConnected
        canUsePTT = headsetConnected
        
        print(headsetConnected ? "🎧 Headset connected" : "⚠️ No headset - PTT disabled")
    }
    
    private func setupNotifications() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(audioRouteChanged),
            name: AVAudioSession.routeChangeNotification,
            object: nil
        )
    }
    
    @objc private func audioRouteChanged(notification: Notification) {
        Task { @MainActor in
            checkHeadsetConnection()
        }
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}
