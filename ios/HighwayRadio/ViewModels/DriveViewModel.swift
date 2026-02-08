//
//  DriveViewModel.swift
//  HighwayRadio
//
//  Manages active call and PTT logic
//

import Foundation
import Combine
import Combine

@MainActor
@Observable
class DriveViewModel {
    // MARK: - Published State
    var isTransmitting = false
    var isInCall = false
    var connectedDriver: Driver?
    var connectionDuration: TimeInterval = 0
    var errorMessage: String?
    
    // MARK: - Services
    private let audioService: AudioService
    private let webRTCService: WebRTCService
    private let supabaseService = SupabaseService()
    private let locationService: LocationService
    private let realtimeService: RealtimeService
    
    private var durationTimer: Timer?
    private var currentVoiceSession: VoiceSession?
    private var cancellables = Set<AnyCancellable>()
    
    init(audioService: AudioService, locationService: LocationService) {
        self.audioService = audioService
        self.webRTCService = WebRTCService()
        self.locationService = locationService
        self.realtimeService = RealtimeService()
        
        // Observe WebRTC connection state
        webRTCService.$connectionState
            .sink { [weak self] state in
                if state == .failed {
                    self?.errorMessage = "Connection lost"
                    self?.endCall()
                }
            }
            .store(in: &cancellables)
        
        // Monitor for incoming calls
        Task {
            try? await realtimeService.startMonitoringVoiceSessions()
        }
    }
    
    init(audioService: AudioService, locationService: LocationService) {
        self.audioService = audioService
        self.webRTCService = WebRTCService()
        self.locationService = locationService
    }
    
    // MARK: - Call Management
    
    func initiateCall(to driver: Driver) async throws {
        guard audioService.canUsePTT else {
            throw CallError.noHeadset
        }
        
        guard locationService.canInitiateCalls() else {
            throw CallError.speedTooHigh
        }
        
        // Create voice session
        let session = try await supabaseService.createVoiceSession(receiverPlate: driver.plate)
        currentVoiceSession = session
        
        // Setup audio
        try audioService.setupAudioSession()
        
        // Start WebRTC call
        try await webRTCService.startCall(to: session.id)
        
        // Update state
        isInCall = true
        connectedDriver = driver
        startDurationTimer()
        
        print("✅ Call initiated to \(driver.plate)")
    }
    
    func endCall() {
        webRTCService.endCall()
        audioService.deactivateAudioSession()
        
        isInCall = false
        isTransmitting = false
        connectedDriver = nil
        connection Duration = 0
        durationTimer?.invalidate()
        
        // Update voice session status
        if let sessionId = currentVoiceSession?.id {
            Task {
                try? await supabaseService.updateVoiceSessionStatus(sessionId: sessionId, status: .ended)
            }
        }
        
        currentVoiceSession = nil
        
        print("✅ Call ended")
    }
    
    // MARK: - PTT Control
    
    func startTransmitting() {
        guard isInCall else { return }
        guard audioService.canUsePTT else { return }
        
        HapticManager.shared.impact(style: .medium)
        webRTCService.startTransmitting()
        isTransmitting = true
    }
    
    func stopTransmitting() {
        HapticManager.shared.impact(style: .light)
        webRTCService.stopTransmitting()
        isTransmitting = false
    }
    
    // MARK: - Duration Timer
    
    private func startDurationTimer() {
        connectionDuration = 0
        durationTimer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            self?.connectionDuration += 1
        }
    }
    
    var durationFormatted: String {
        let minutes = Int(connectionDuration) / 60
        let seconds = Int(connectionDuration) % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }
    
    deinit {
        durationTimer?.invalidate()
    }
}

// MARK: - Errors
enum CallError: LocalizedError {
    case noHeadset
    case speedTooHigh
    case connectionFailed
    
    var errorDescription: String? {
        switch self {
        case .noHeadset:
            return "Connect headphones or Bluetooth for hands-free use"
        case .speedTooHigh:
            return "Slow down to connect (max 80 km/h)"
        case .connectionFailed:
            return "Failed to connect. Try again."
        }
    }
}
