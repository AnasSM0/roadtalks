//
//  Driver.swift
//  HighwayRadio
//
//  Nearby driver model (from get-nearby-drivers Edge Function)
//

import Foundation

struct Driver: Identifiable {
    let id = UUID()
    let plate: String
    let vehicleType: String?
    let distance: Double // meters
    let direction: Direction
    let heading: Double?
    let lastSeen: Date
    
    enum Direction: String, Codable {
        case ahead
        case behind
        
        var icon: String {
            switch self {
            case .ahead: return "arrow.up.circle.fill"
            case .behind: return "arrow.down.circle.fill"
            }
        }
        
        var displayText: String {
            switch self {
            case .ahead: return "Ahead"
            case .behind: return "Behind"
            }
        }
    }
    
    var distanceFormatted: String {
        if distance < 1000 {
            return "\(Int(distance))m"
        } else {
            let km = distance / 1000
            return String(format: "%.1fkm", km)
        }
    }
    
    var directionText: String {
        return "\(distanceFormatted) \(direction.displayText.lowercased())"
    }
}

// MARK: - Codable
extension Driver: Codable {
    enum CodingKeys: String, CodingKey {
        case plate
        case vehicleType = "vehicle_type"
        case distance
        case direction
        case heading
        case lastSeen = "last_seen"
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        plate = try container.decode(String.self, forKey: .plate)
        vehicleType = try container.decodeIfPresent(String.self, forKey: .vehicleType)
        distance = try container.decode(Double.self, forKey: .distance)
        direction = try container.decode(Direction.self, forKey: .direction)
        heading = try container.decodeIfPresent(Double.self, forKey: .heading)
        lastSeen = try container.decode(Date.self, forKey: .lastSeen)
    }
}
