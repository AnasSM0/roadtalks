//
//  Constants.swift
//  HighwayRadio
//
//  App-wide constants
//

import Foundation

enum Constants {
    // MARK: - Spacing (base unit: 8pt)
    enum Spacing {
        static let small: CGFloat = 8
        static let medium: CGFloat = 16
        static let large: CGFloat = 24
        static let xlarge: CGFloat = 32
    }
    
    // MARK: - Sizing
    enum Size {
        static let buttonHeight: CGFloat = 56
        static let touchTarget: CGFloat = 48
        static let pttButtonSize: CGFloat = 200
        static let cornerRadius: CGFloat = 12
    }
    
    // MARK: - Proximity
    enum Proximity {
        static let defaultRadius: Double = 1000 // meters (1km for MVP)
        static let maxCallDistance: Double = 1000 // meters
    }
    
    // MARK: - Session
    enum Session {
        static let updateInterval: TimeInterval = 4 // seconds
        static let staleThreshold: TimeInterval = 30 // seconds
    }
    
    // MARK: - Speed
    enum Speed {
        static let maxSpeedForCalls: Double = 80 // km/h
        static let mpsToKmh: Double = 3.6 // conversion factor
    }
    
    // MARK: - Voice Session
    enum VoiceSession {
        static let expiryDuration: TimeInterval = 5 * 60 // 5 minutes
    }
    
    // MARK: - Validation
    enum Validation {
        static let plateRegex = "^[A-Z0-9]{2,10}$"
    }
}
