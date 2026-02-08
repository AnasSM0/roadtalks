//
//  OnboardingViewModel.swift
//  HighwayRadio
//
//  Manages permissions and license plate entry flow
//

import Foundation
import AVFoundation
import CoreLocation

@MainActor
@Observable
class OnboardingViewModel {
    // MARK: - Published State
    var microphoneGranted = false
    var locationGranted = false
    var disclaimerAccepted = false
    var isOnboardingComplete = false
    var currentPlate = ""
    var selectedVehicleType: String? = nil
    
    // MARK: - Services
    private let locationService = LocationService()
    private let supabaseService = SupabaseService()
    
    var canContinueFromPermissions: Bool {
        microphoneGranted && locationGranted && disclaimerAccepted
    }
    
    var isPlateValid: Bool {
        let regex = try? NSRegularExpression(pattern: Constants.Validation.plateRegex)
        let uppercased = currentPlate.uppercased()
        let range = NSRange(uppercased.startIndex..., in: uppercased)
        return regex?.firstMatch(in: uppercased, range: range) != nil
    }
    
    // MARK: - Permission Requests
    
    func requestPermissions() async {
        // Request microphone
        let micStatus = await AVCaptureDevice.requestAccess(for: .audio)
        microphoneGranted = micStatus
        
        // Request location
        locationService.requestPermission()
        
        // Create anonymous Supabase user
        do {
            try await SupabaseConfig.signInAnonymously()
            print("✅ Anonymous auth complete")
        } catch {
            print("❌ Anonymous auth failed: \(error)")
        }
    }
    
    func checkLocationPermission() {
        locationGranted = locationService.authorizationStatus == .authorizedWhenInUse ||
                         locationService.authorizationStatus == .authorizedAlways
    }
    
    // MARK: - Session Creation
    
    func startSession() async throws {
        guard isPlateValid else {
            throw OnboardingError.invalidPlate
        }
        
        guard let location = locationService.currentLocation else {
            // Start location updates if not already running
            locationService.startUpdating()
            try await Task.sleep(nanoseconds: 2_000_000_000) // Wait 2s for location
            guard let location = locationService.currentLocation else {
                throw OnboardingError.locationUnavailable
            }
            _ = try await createSession(location: location)
            return
        }
        
        _ = try await createSession(location: location)
    }
    
    private func createSession(location: CLLocation) async throws -> Session {
        let session = try await supabaseService.createSession(
            plate: currentPlate.uppercased(),
            vehicleType: selectedVehicleType,
            location: location,
            heading: locationService.currentHeading
        )
        
        // Save plate to UserDefaults
        UserDefaults.standard.set(currentPlate.uppercased(), forKey: "userPlate")
        
        isOnboardingComplete = true
        return session
    }
}

// MARK: - Errors
enum OnboardingError: LocalizedError {
    case invalidPlate
    case locationUnavailable
    case sessionCreationFailed
    
    var errorDescription: String? {
        switch self {
        case .invalidPlate:
            return "Invalid license plate format. Use 2-10 letters/numbers."
        case .locationUnavailable:
            return "Location not available. Please enable location services."
        case .sessionCreationFailed:
            return "Failed to create session. Please try again."
        }
    }
}
