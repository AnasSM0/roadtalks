//
//  DriverDetailView.swift
//  HighwayRadio
//
//  Driver detail and connect screen
//

import SwiftUI

struct DriverDetailView: View {
    let driver: Driver
    let locationService: LocationService
    let audioService: AudioService
    
    @StateObject private var driveViewModel: DriveViewModel
    @State private var showingDriveView = false
    @State private var showingError = false
    @State private var errorMessage = ""
    @Environment(\.dismiss) private var dismiss
    
    init(driver: Driver, locationService: LocationService, audioService: AudioService) {
        self.driver = driver
        self.locationService = locationService
        self.audioService = audioService
        _driveViewModel = StateObject(wrappedValue: DriveViewModel(audioService: audioService, locationService: locationService))
    }
    
    var body: some View {
        ZStack {
            Color.backgroundColor.ignoresSafeArea()
            
            VStack(spacing: Constants.Spacing.xlarge) {
                Spacer()
                
                // Plate
                Text(driver.plate)
                    .font(.system(size: 48, weight: .bold, design: .monospaced))
                    .foregroundColor(.textPrimary)
                
                // Details
                VStack(spacing: Constants.Spacing.medium) {
                    DetailRow(icon: driver.direction.icon, text: driver.directionText)
                    
                    if let vehicleType = driver.vehicleType {
                        DetailRow(icon: "car.fill", text: vehicleType)
                    }
                }
                
                Spacer()
                
                // Safety Warning
                if !audioService.canUsePTT {
                    warningBanner
                }
                
                // Connect Button
                PrimaryButton(title: "Connect") {
                    initiateCall()
                }
                .disabled(!audioService.canUsePTT || !locationService.canInitiateCalls())
                .padding(.horizontal)
            }
            .padding()
        }
        .fullScreenCover(isPresented: $showingDriveView) {
            DriveView(viewModel: driveViewModel, driver: driver)
        }
        .alert("Error", isPresented: $showingError) {
            Button("OK") { }
        } message: {
            Text(errorMessage)
        }
    }
    
    private var warningBanner: some View {
        HStack {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundColor(.dangerColor)
            Text("Connect headphones or Bluetooth for hands-free use")
                .font(.caption)
                .foregroundColor(.textSecondary)
        }
        .padding()
        .background(Color.dangerColor.opacity(0.1))
        .cornerRadius(Constants.Size.cornerRadius)
        .padding(.horizontal)
    }
    
    private func initiateCall() {
        Task {
            do {
                try await driveViewModel.initiateCall(to: driver)
                showingDriveView = true
            } catch {
                errorMessage = error.localizedDescription
                showingError = true
            }
        }
     }
}

struct DetailRow: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(.primaryColor)
                .frame(width: 30)
            Text(text)
                .font(.headline)
                .foregroundColor(.textPrimary)
        }
    }
}
