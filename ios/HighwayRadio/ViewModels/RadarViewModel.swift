//
//  RadarViewModel.swift
//  HighwayRadio
//
//  Manages nearby driver discovery
//

import Foundation
import Combine

@MainActor
@Observable
class RadarViewModel {
    // MARK: - Published State
    var nearbyDrivers: [Driver] = []
    var isLoading = false
    var errorMessage: String?
    
    // MARK: - Services
    private let locationService: LocationService
    private let supabaseService = SupabaseService()
    private var updateTimer: Timer?
    
    init(locationService: LocationService) {
        self.locationService = locationService
    }
    
    func startUpdating() {
        // Fetch immediately
        Task {
            await fetchNearbyDrivers()
        }
        
        // Then update every 5 seconds
        updateTimer = Timer.scheduledTimer(withTimeInterval: 5, repeats: true) { [weak self] _ in
            Task { @MainActor [weak self] in
                await self?.fetchNearbyDrivers()
            }
        }
    }
    
    func stopUpdating() {
        updateTimer?.invalidate()
        updateTimer = nil
    }
    
    func fetchNearbyDrivers() async {
        guard let location = locationService.currentLocation else {
            errorMessage = "Location not available"
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        do {
            nearbyDrivers = try await supabaseService.getNearbyDrivers(
                location: location,
                radius: Constants.Proximity.defaultRadius
            )
            print("📡 Found \(nearbyDrivers.count) nearby drivers")
        } catch {
            errorMessage = "Failed to fetch nearby drivers: \(error.localizedDescription)"
            print("❌ \(errorMessage ?? "")")
        }
        
        isLoading = false
    }
    
    deinit {
        stopUpdating()
    }
}
