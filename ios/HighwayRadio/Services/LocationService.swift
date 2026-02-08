//
//  LocationService.swift
//  HighwayRadio
//
//  CoreLocation wrapper for location updates
//

import CoreLocation
import Combine

@MainActor
class LocationService: NSObject, ObservableObject {
    @Published var currentLocation: CLLocation?
    @Published var authorizationStatus: CLAuthorizationStatus = .not

Determined
    @Published var isUpdatingLocation = false
    
    private let locationManager = CLLocationManager()
    private var updateTimer: Timer?
    
    override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBestForNavigation
        locationManager.distanceFilter = 10 // meters
        locationManager.allowsBackgroundLocationUpdates = false // Foreground only
        authorizationStatus = locationManager.authorizationStatus
    }
    
    func requestPermission() {
        locationManager.requestWhenInUseAuthorization()
    }
    
    func startUpdating() {
        guard authorizationStatus == .authorizedWhenInUse || authorizationStatus == .authorizedAlways else {
            print("❌ Location permission not granted")
            return
        }
        
        locationManager.startUpdatingLocation()
        locationManager.startUpdatingHeading()
        isUpdatingLocation = true
    }
    
    func stopUpdating() {
        locationManager.stopUpdatingLocation()
        locationManager.stopUpdatingHeading()
        isUpdatingLocation = false
    }
    
    var currentSpeed: Double? {
        return currentLocation?.speed
    }
    
    var currentSpeedKmh: Double? {
        guard let speed = currentSpeed, speed >= 0 else { return nil }
        return speed * Constants.Speed.mpsToKmh
    }
    
    var currentHeading: Double? {
        return locationManager.heading?.trueHeading
    }
    
    func canInitiateCalls() -> Bool {
        guard let speedKmh = currentSpeedKmh else { return true }
        return speedKmh <= Constants.Speed.maxSpeedForCalls
    }
}

// MARK: - CLLocationManagerDelegate
extension LocationService: CLLocationManagerDelegate {
    nonisolated func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        Task { @MainActor in
            guard let location = locations.last else { return }
            self.currentLocation = location
        }
    }
    
    nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        Task { @MainActor in
            self.authorizationStatus = manager.authorizationStatus
            print("📍 Location authorization: \(manager.authorizationStatus.rawValue)")
        }
    }
    
    nonisolated func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("❌ Location error: \(error.localizedDescription)")
    }
}
