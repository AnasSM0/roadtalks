//
//  Session.swift
//  HighwayRadio
//
//  Driver session model
//

import Foundation

struct Session: Codable, Identifiable {
    let id: UUID
    let userId: UUID
    let plate: String
    let vehicleType: String?
    let location: Location
    let speed: Double? // meters per second
    let heading: Double? // degrees (0-360)
    let lastSeen: Date
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case plate
        case vehicleType = "vehicle_type"
        case location
        case speed
        case heading
        case lastSeen = "last_seen"
        case createdAt = "created_at"
    }
    
    // MARK: - Location Helper
    struct Location: Codable {
        let latitude: Double
        let longitude: Double
        
        init(latitude: Double, longitude: Double) {
            self.latitude = latitude
            self.longitude = longitude
        }
        
        // Custom decoding for PostGIS geography type
        init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            // PostGIS returns GeoJSON-like structure
            if let coordinates = try? container.decode([Double].self, forKey: .coordinates) {
                self.longitude = coordinates[0]
                self.latitude = coordinates[1]
            } else {
                self.latitude = try container.decode(Double.self, forKey: .latitude)
                self.longitude = try container.decode(Double.self, forKey: .longitude)
            }
        }
        
        enum CodingKeys: String, CodingKey {
            case latitude
            case longitude
            case coordinates
        }
    }
    
    var speedKmh: Double? {
        guard let speed = speed else { return nil }
        return speed * Constants.Speed.mpsToKmh
    }
}
