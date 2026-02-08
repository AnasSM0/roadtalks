//
//  SupabaseService.swift
//  HighwayRadio
//
//  Supabase database and realtime service
//

import Foundation
import Supabase

@MainActor
class SupabaseService: ObservableObject {
    private let client = SupabaseConfig.client
    
    // MARK: - Session Management
    
    func createSession(plate: String, vehicleType: String?, location: CLLocation, heading: Double?) async throws -> Session {
        guard let userId = SupabaseConfig.getCurrentUserId() else {
            throw SupabaseError.notAuthenticated
        }
        
        // Check for existing active session with same plate
        let existingSessions: [Session] = try await client
            .from("sessions")
            .select()
            .eq("plate", value: plate)
            .gte("last_seen", value: Date().addingTimeInterval(-30).ISO8601Format())
            .execute()
            .value
        
        // Delete stale sessions if found
        if !existingSessions.isEmpty {
            for session in existingSessions {
                try? await client
                    .from("sessions")
                    .delete()
                    .eq("id", value: session.id.uuidString)
                    .execute()
            }
        }
        
        // Create new session
        let locationDict: [String: Any] = [
            "type": "Point",
            "coordinates": [location.coordinate.longitude, location.coordinate.latitude]
        ]
        
        struct SessionInsert: Encodable {
            let userId: UUID
            let plate: String
            let vehicleType: String?
            let location: String
            let speed: Double?
            let heading: Double?
            
            enum CodingKeys: String, CodingKey {
                case userId = "user_id"
                case plate
                case vehicleType = "vehicle_type"
                case location
                case speed
                case heading
            }
        }
        
        let locationString = "SRID=4326;POINT(\(location.coordinate.longitude) \(location.coordinate.latitude))"
        
        let insert = SessionInsert(
            userId: userId,
            plate: plate,
            vehicleType: vehicleType,
            location: locationString,
            speed: location.speed >= 0 ? location.speed : nil,
            heading: heading
        )
        
        let session: Session = try await client
            .from("sessions")
            .insert(insert)
            .select()
            .single()
            .execute()
            .value
        
        print("✅ Session created: \(plate)")
        return session
    }
    
    func updateSessionLocation(location: CLLocation, heading: Double?) async throws {
        guard let userId = SupabaseConfig.getCurrentUserId() else { return }
        
        let locationString = "SRID=4326;POINT(\(location.coordinate.longitude) \(location.coordinate.latitude))"
        
        struct SessionUpdate: Encodable {
            let location: String
            let speed: Double?
            let heading: Double?
            let lastSeen: String
            
            enum CodingKeys: String, CodingKey {
                case location
                case speed
                case heading
                case lastSeen = "last_seen"
            }
        }
        
        let update = SessionUpdate(
            location: locationString,
            speed: location.speed >= 0 ? location.speed : nil,
            heading: heading,
            lastSeen: Date().ISO8601Format()
        )
        
        try await client
            .from("sessions")
            .update(update)
            .eq("user_id", value: userId.uuidString)
            .execute()
    }
    
    func deleteSession() async throws {
        guard let userId = SupabaseConfig.getCurrentUserId() else { return }
        
        try await client
            .from("sessions")
            .delete()
            .eq("user_id", value: userId.uuidString)
            .execute()
        
        print("✅ Session deleted")
    }
    
    // MARK: - Nearby Drivers
    
    func getNearbyDrivers(location: CLLocation, radius: Double = Constants.Proximity.defaultRadius) async throws -> [Driver] {
        struct RequestBody: Encodable {
            let lat: Double
            let lng: Double
            let radius: Double
        }
        
        let body = RequestBody(
            lat: location.coordinate.latitude,
            lng: location.coordinate.longitude,
            radius: radius
        )
        
        struct Response: Decodable {
            let drivers: [Driver]
        }
        
        let response: Response = try await client.functions.invoke(
            "get-nearby-drivers",
            options: FunctionInvokeOptions(body: body)
        )
        
        return response.drivers
    }
    
    // MARK: - Voice Sessions
    
    func createVoiceSession(receiverPlate: String) async throws -> VoiceSession {
        struct RequestBody: Encodable {
            let receiverPlate: String
            
            enum CodingKeys: String, CodingKey {
                case receiverPlate = "receiver_plate"
            }
        }
        
        let body = RequestBody(receiverPlate: receiverPlate)
        
        struct Response: Decodable {
            let sessionId: String
            let status: String
            let createdAt: String
            
            enum CodingKeys: String, CodingKey {
                case sessionId = "session_id"
                case status
                case createdAt = "created_at"
            }
        }
        
        let response: Response = try await client.functions.invoke(
            "create-voice-session",
            options: FunctionInvokeOptions(body: body)
        )
        
        // Fetch full voice session
        let session: VoiceSession = try await client
            .from("voice_sessions")
            .select()
            .eq("id", value: response.sessionId)
            .single()
            .execute()
            .value
        
        print("✅ Voice session created: \(response.sessionId)")
        return session
    }
    
    func updateVoiceSessionStatus(sessionId: UUID, status: VoiceSession.Status) async throws {
        struct StatusUpdate: Encodable {
            let status: String
            let endedAt: String?
            
            enum CodingKeys: String, CodingKey {
                case status
                case endedAt = "ended_at"
            }
        }
        
        let update = StatusUpdate(
            status: status.rawValue,
            endedAt: status == .ended ? Date().ISO8601Format() : nil
        )
        
        try await client
            .from("voice_sessions")
            .update(update)
            .eq("id", value: sessionId.uuidString)
            .execute()
        
        print("✅ Voice session status updated: \(status.rawValue)")
    }
}

// MARK: - Errors
enum SupabaseError: LocalizedError {
    case notAuthenticated
    case sessionNotFound
    case createFailed
    
    var errorDescription: String? {
        switch self {
        case .notAuthenticated:
            return "User not authenticated"
        case .sessionNotFound:
            return "Session not found"
        case .createFailed:
            return "Failed to create session"
        }
    }
}

import CoreLocation
