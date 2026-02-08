//
//  SupabaseConfig.swift
//  HighwayRadio
//
//  Supabase client configuration and anonymous auth
//

import Foundation
import Supabase

struct SupabaseConfig {
    // MARK: - Configuration
    // TODO: Replace with your actual Supabase credentials
    static let url = URL(string: "YOUR_SUPABASE_URL_HERE")!
    static let anonKey = "YOUR_SUPABASE_ANON_KEY_HERE"
    
    // MARK: - Client
    static let client = SupabaseClient(
        supabaseURL: url,
        supabaseKey: anonKey
    )
    
    // MARK: - Anonymous Auth
    @MainActor
    static func signInAnonymously() async throws {
        let session = try await client.auth.signInAnonymously()
        print("✅ Anonymous user created: \(session.user.id)")
    }
    
    static func getCurrentUserId() -> UUID? {
        return client.auth.currentUser?.id
    }
    
    static func isAuthenticated() -> Bool {
        return client.auth.currentUser != nil
    }
    
    @MainActor
    static func signOut() async throws {
        try await client.auth.signOut()
        print("✅ User signed out")
    }
}
