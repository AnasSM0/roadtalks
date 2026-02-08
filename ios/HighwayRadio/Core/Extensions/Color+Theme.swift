//
//  Color+Theme.swift
//  HighwayRadio
//
//  Theme colors following Frontend_Guidelines.MD
//

import SwiftUI

extension Color {
    // MARK: - Theme Colors (from Frontend_Guidelines.MD)
    
    static let backgroundColor = Color(hex: "#0B101B")
    static let primaryColor = Color(hex: "#2563EB")
    static let activeVoiceColor = Color(hex: "#22C55E")
    static let dangerColor = Color(hex: "#EF4444")
    static let textPrimary = Color(hex: "#FFFFFF")
    static let textSecondary = Color(hex: "#94A3B8")
    
    // MARK: - Hex Initializer
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
