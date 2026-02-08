//
//  WebRTCService.swift
//  HighwayRadio
//
//  Complete WebRTC peer connection service for voice calls
//

import Foundation
import WebRTC
import Combine
import Supabase

@MainActor
class WebRTCService: NSObject, ObservableObject {
    @Published var connectionState: ConnectionState = .disconnected
    @Published var isTransmitting = false
    
    enum ConnectionState {
        case disconnected
        case connecting
        case connected
        case failed
    }
    
    // MARK: - WebRTC Components
    private var peerConnectionFactory: RTCPeerConnectionFactory!
    private var peerConnection: RTCPeerConnection?
    private var localAudioTrack: RTCAudioTrack?
    private var audioSource: RTCAudioSource?
    
    // MARK: - Signaling
    private var voiceSessionId: UUID?
    private var signalingChannel: RealtimeChannel?
    private var isCaller = false
    private let supabase = SupabaseConfig.client
    
    // MARK: - ICE Servers
    private let iceServers = [
        RTCIceServer(urlStrings: ["stun:stun.l.google.com:19302"]),
        RTCIceServer(urlStrings: ["stun:stun1.l.google.com:19302"]),
        RTCIceServer(urlStrings: ["stun:stun2.l.google.com:19302"])
    ]
    
    // MARK: - Initialization
    override init() {
        super.init()
        setupWebRTC()
    }
    
    private func setupWebRTC() {
        // Initialize peer connection factory
        RTCInitializeSSL()
        
        let videoEncoderFactory = RTCDefaultVideoEncoderFactory()
        let videoDecoderFactory = RTCDefaultVideoDecoderFactory()
        
        peerConnectionFactory = RTCPeerConnectionFactory(
            encoderFactory: videoEncoderFactory,
            decoderFactory: videoDecoderFactory
        )
        
        print("✅ WebRTC factory initialized")
    }
    
    // MARK: - Call Management
    
    func startCall(to sessionId: UUID) async throws {
        voiceSessionId = sessionId
        isCaller = true
        
        // Setup signaling
        try await setupSignaling(sessionId: sessionId)
        
        // Create peer connection
        createPeerConnection()
        
        // Add local audio track
        addLocalAudioTrack()
        
        // Create offer
        connectionState = .connecting
        try await createOffer()
        
        print("✅ WebRTC call started as caller")
    }
    
    func answerCall(sessionId: UUID) async throws {
        voiceSessionId = sessionId
        isCaller = false
        
        // Setup signaling
        try await setupSignaling(sessionId: sessionId)
        
        // Create peer connection
        createPeerConnection()
        
        // Add local audio track
        addLocalAudioTrack()
        
        connectionState = .connecting
        print("✅ WebRTC ready to answer call")
    }
    
    func endCall() {
        // Close peer connection
        peerConnection?.close()
        peerConnection = nil
        
        // Stop local audio
        localAudioTrack?.isEnabled = false
        localAudioTrack = nil
        audioSource = nil
        
        // Leave signaling channel
        Task {
            await signalingChannel?.unsubscribe()
            signalingChannel = nil
        }
        
        connectionState = .disconnected
        isTransmitting = false
        voiceSessionId = nil
        
        print("✅ WebRTC call ended")
    }
    
    // MARK: - Peer Connection Setup
    
    private func createPeerConnection() {
        let config = RTCConfiguration()
        config.iceServers = iceServers
        config.sdpSemantics = .unifiedPlan
        config.continualGatheringPolicy = .gatherContinually
        
        let constraints = RTCMediaConstraints(
            mandatoryConstraints: nil,
            optionalConstraints: ["DtlsSrtpKeyAgreement": "true"]
        )
        
        peerConnection = peerConnectionFactory.peerConnection(
            with: config,
            constraints: constraints,
            delegate: self
        )
        
        print("✅ Peer connection created")
    }
    
    private func addLocalAudioTrack() {
        let constraints = RTCMediaConstraints(
            mandatoryConstraints: [
                "googEchoCancellation": "true",
                "googAutoGainControl": "true",
                "googNoiseSuppression": "true",
                "googHighpassFilter": "true"
            ],
            optionalConstraints: nil
        )
        
        audioSource = peerConnectionFactory.audioSource(with: constraints)
        localAudioTrack = peerConnectionFactory.audioTrack(with: audioSource!, trackId: "audio0")
        
        // Start muted (PTT pattern)
        localAudioTrack?.isEnabled = false
        
        // Add to peer connection
        peerConnection?.add(localAudioTrack!, streamIds: ["stream0"])
        
        print("✅ Local audio track added (muted)")
    }
    
    // MARK: - Signaling via Supabase Realtime
    
    private func setupSignaling(sessionId: UUID) async throws {
        let channelName = "signaling:\(sessionId.uuidString)"
        
        signalingChannel = await supabase.channel(channelName)
        
        // Listen for signaling messages
        await signalingChannel?.on("broadcast", filter: .init(event: "signaling")) { [weak self] message in
            Task { @MainActor [weak self] in
                await self?.handleSignalingMessage(message.payload)
            }
        }
        
        try await signalingChannel?.subscribe()
        
        print("✅ Signaling channel subscribed: \(channelName)")
    }
    
    private func sendSignalingMessage(type: String, data: [String: Any]) async {
        guard let channel = signalingChannel else { return }
        
        var payload = data
        payload["type"] = type
        payload["sender"] = isCaller ? "caller" : "receiver"
        
        await channel.send(
            event: "signaling",
            payload: payload
        )
    }
    
    private func handleSignalingMessage(_ payload: JSONObject) async {
        guard let type = payload["type"] as? String else { return }
        let sender = payload["sender"] as? String ?? ""
        
        // Ignore own messages
        if (isCaller && sender == "caller") || (!isCaller && sender == "receiver") {
            return
        }
        
        switch type {
        case "offer":
            await handleOffer(payload)
        case "answer":
            await handleAnswer(payload)
        case "ice_candidate":
            await handleIceCandidate(payload)
        default:
            break
        }
    }
    
    // MARK: - SDP Handling
    
    private func createOffer() async throws {
        let constraints = RTCMediaConstraints(
            mandatoryConstraints: [
                "OfferToReceiveAudio": "true",
                "OfferToReceiveVideo": "false"
            ],
            optionalConstraints: nil
        )
        
        guard let pc = peerConnection else { return }
        
        let offer = try await pc.offer(for: constraints)
        try await pc.setLocalDescription(offer)
        
        // Send offer via signaling
        await sendSignalingMessage(
            type: "offer",
            data: [
                "sdp": offer.sdp,
                "type": offer.type.stringValue
            ]
        )
        
        print("✅ Offer created and sent")
    }
    
    private func handleOffer(_ payload: JSONObject) async {
        guard let sdpString = payload["sdp"] as? String,
              let typeString = payload["type"] as? String,
              let pc = peerConnection else { return }
        
        let sdp = RTCSessionDescription(
            type: .offer,
            sdp: sdpString
        )
        
        do {
            try await pc.setRemoteDescription(sdp)
            print("✅ Remote offer set")
            
            // Create answer
            let constraints = RTCMediaConstraints(
                mandatoryConstraints: [
                    "OfferToReceiveAudio": "true",
                    "OfferToReceiveVideo": "false"
                ],
                optionalConstraints: nil
            )
            
            let answer = try await pc.answer(for: constraints)
            try await pc.setLocalDescription(answer)
            
            // Send answer
            await sendSignalingMessage(
                type: "answer",
                data: [
                    "sdp": answer.sdp,
                    "type": answer.type.stringValue
                ]
            )
            
            print("✅ Answer created and sent")
        } catch {
            print("❌ Error handling offer: \(error)")
        }
    }
    
    private func handleAnswer(_ payload: JSONObject) async {
        guard let sdpString = payload["sdp"] as? String,
              let pc = peerConnection else { return }
        
        let sdp = RTCSessionDescription(
            type: .answer,
            sdp: sdpString
        )
        
        do {
            try await pc.setRemoteDescription(sdp)
            print("✅ Remote answer set")
        } catch {
            print("❌ Error handling answer: \(error)")
        }
    }
    
    // MARK: - ICE Candidate Handling
    
    private func handleIceCandidate(_ payload: JSONObject) async {
        guard let candidateString = payload["candidate"] as? String,
              let sdpMLineIndex = payload["sdpMLineIndex"] as? Int,
              let sdpMid = payload["sdpMid"] as? String,
              let pc = peerConnection else { return }
        
        let candidate = RTCIceCandidate(
            sdp: candidateString,
            sdpMLineIndex: Int32(sdpMLineIndex),
            sdpMid: sdpMid
        )
        
        pc.add(candidate)
        print("✅ ICE candidate added")
    }
    
    // MARK: - PTT Control
    
    func startTransmitting() {
        guard connectionState == .connected else {
            print("⚠️ Cannot transmit - not connected")
            return
        }
        
        localAudioTrack?.isEnabled = true
        isTransmitting = true
        print("🎤 Started transmitting")
    }
    
    func stopTransmitting() {
        localAudioTrack?.isEnabled = false
        isTransmitting = false
        print("🎤 Stopped transmitting")
    }
    
    deinit {
        endCall()
        RTCCleanupSSL()
    }
}

// MARK: - RTCPeerConnectionDelegate
extension WebRTCService: RTCPeerConnectionDelegate {
    nonisolated func peerConnection(_ peerConnection: RTCPeerConnection, didChange stateChanged: RTCSignalingState) {
        print("📡 Signaling state: \(stateChanged.rawValue)")
    }
    
    nonisolated func peerConnection(_ peerConnection: RTCPeerConnection, didAdd stream: RTCMediaStream) {
        print("✅ Remote stream added")
        
        if let audioTrack = stream.audioTracks.first {
            audioTrack.isEnabled = true
            print("✅ Remote audio track enabled")
        }
    }
    
    nonisolated func peerConnection(_ peerConnection: RTCPeerConnection, didRemove stream: RTCMediaStream) {
        print("⚠️ Remote stream removed")
    }
    
    nonisolated func peerConnectionShouldNegotiate(_ peerConnection: RTCPeerConnection) {
        print("📡 Should negotiate")
    }
    
    nonisolated func peerConnection(_ peerConnection: RTCPeerConnection, didChange newState: RTCIceConnectionState) {
        Task { @MainActor in
            print("📡 ICE connection state: \(newState.rawValue)")
            
            switch newState {
            case .connected:
                self.connectionState = .connected
            case .disconnected, .failed, .closed:
                self.connectionState = .failed
            default:
                break
            }
        }
    }
    
    nonisolated func peerConnection(_ peerConnection: RTCPeerConnection, didChange newState: RTCIceGatheringState) {
        print("📡 ICE gathering state: \(newState.rawValue)")
    }
    
    nonisolated func peerConnection(_ peerConnection: RTCPeerConnection, didGenerate candidate: RTCIceCandidate) {
        Task { @MainActor in
            // Send ICE candidate via signaling
            await self.sendSignalingMessage(
                type: "ice_candidate",
                data: [
                    "candidate": candidate.sdp,
                    "sdpMLineIndex": candidate.sdpMLineIndex,
                    "sdpMid": candidate.sdpMid ?? ""
                ]
            )
            print("✅ ICE candidate sent")
        }
    }
    
    nonisolated func peerConnection(_ peerConnection: RTCPeerConnection, didRemove candidates: [RTCIceCandidate]) {
        print("⚠️ ICE candidates removed")
    }
    
    nonisolated func peerConnection(_ peerConnection: RTCPeerConnection, didOpen dataChannel: RTCDataChannel) {
        print("📡 Data channel opened")
    }
}

// MARK: - RTCSessionDescription Extension
extension RTCSdpType {
    var stringValue: String {
        switch self {
        case .offer: return "offer"
        case .prAnswer: return "pranswer"
        case .answer: return "answer"
        case .rollback: return "rollback"
        @unknown default: return "unknown"
        }
    }
}
