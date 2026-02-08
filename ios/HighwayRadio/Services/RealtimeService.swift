//
//  RealtimeService.swift
//  HighwayRadio
//
//  Supabase Realtime presence and voice session monitoring
//

import Foundation
import Supabase
import Combine

@MainActor
class RealtimeService: ObservableObject {
    @Published var incomingCall: VoiceSession?
    
    private let supabase = SupabaseConfig.client
    private var voiceSessionChannel: RealtimeChannel?
    
    // MARK: - Voice Session Monitoring
    
    func startMonitoringVoiceSessions() async throws {
        guard let userId = SupabaseConfig.getCurrentUserId() else { return }
        
        // Subscribe to voice_sessions table changes
        voiceSessionChannel = await supabase.channel("voice_sessions")
        
        // Listen for INSERT events (incoming calls)
        await voiceSessionChannel?.on("postgres_changes", filter: .init(
            event: .insert,
            schema: "public",
            table: "voice_sessions",
            filter: "receiver_user_id=eq.\(userId.uuidString)"
        )) { [weak self] message in
            Task { @MainActor [weak self] in
                await self?.handleIncomingCall(message.payload)
            }
        }
        
        // Listen for UPDATE events (call status changes)
        await voiceSessionChannel?.on("postgres_changes", filter: .init(
            event: .update,
            schema: "public",
            table: "voice_sessions",
            filter: "receiver_user_id=eq.\(userId.uuidString)"
        )) { [weak self] message in
            Task { @MainActor [weak self] in
                await self?.handleCallUpdate(message.payload)
            }
        }
        
        try await voiceSessionChannel?.subscribe()
        
        print("✅ Monitoring voice sessions for incoming calls")
    }
    
    func stopMonitoring() {
        Task {
            await voiceSessionChannel?.unsubscribe()
            voiceSessionChannel = nil
        }
    }
    
    private func handleIncomingCall(_ payload: JSONObject) async {
        // Parse voice session from payload
        guard let record = payload["record"] as? JSONObject,
              let data = try? JSONSerialization.data(withJSONObject: record),
              let session = try? JSONDecoder().decode(VoiceSession.self, from: data) else {
            return
        }
        
        // Set incoming call (triggers UI alert)
        incomingCall = session
        
        print("📞 Incoming call from: \(session.callerPlate)")
    }
    
    private func handleCallUpdate(_ payload: JSONObject) async {
        guard let record = payload["record"] as? JSONObject,
              let status = record["status"] as? String else {
            return
        }
        
        print("📞 Call status updated: \(status)")
        
        // If call ended, clear incoming call
        if status == "ended" {
            incomingCall = nil
        }
    }
}
