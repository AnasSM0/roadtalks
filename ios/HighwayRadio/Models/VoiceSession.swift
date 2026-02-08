//
//  VoiceSession.swift
//  HighwayRadio
//
//  Voice call session model
//

import Foundation

struct VoiceSession: Codable, Identifiable {
    let id: UUID
    let callerUserId: UUID
    let receiverUserId: UUID
    let callerPlate: String
    let receiverPlate: String
    var status: Status
    let createdAt: Date
    let expiresAt: Date?
    var endedAt: Date?
    
    enum Status: String, Codable {
        case pending
        case active
        case ended
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case callerUserId = "caller_user_id"
        case receiverUserId = "receiver_user_id"
        case callerPlate = "caller_plate"
        case receiverPlate = "receiver_plate"
        case status
        case createdAt = "created_at"
        case expiresAt = "expires_at"
        case endedAt = "ended_at"
    }
    
    func isCaller(userId: UUID) -> Bool {
        return callerUserId == userId
    }
    
    func otherUserPlate(userId: UUID) -> String {
        return isCaller(userId: userId) ? receiverPlate : callerPlate
    }
    
    var isExpired: Bool {
        guard let expiresAt = expiresAt else { return false }
        return Date() > expiresAt
    }
}
