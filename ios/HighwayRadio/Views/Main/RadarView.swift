//
//  RadarView.swift
//  HighwayRadio
//
//  Nearby drivers list
//

import SwiftUI

struct RadarView: View {
    @ObservedObject var viewModel: RadarViewModel
    let locationService: LocationService
    let audioService: AudioService
    
    @State private var selectedDriver: Driver?
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.backgroundColor.ignoresSafeArea()
                
                if viewModel.nearbyDrivers.isEmpty {
                    emptyState
                } else {
                    driversList
                }
            }
            .navigationTitle("Nearby Drivers")
            .navigationBarTitleDisplayMode(.large)
            .sheet(item: $selectedDriver) { driver in
                DriverDetailView(
                    driver: driver,
                    locationService: locationService,
                    audioService: audioService
                )
            }
        }
    }
    
    private var emptyState: some View {
        VStack(spacing: Constants.Spacing.large) {
            Image(systemName: "antenna.radiowaves.left.and.right")
                .font(.system(size: 60))
                .foregroundColor(.textSecondary)
            
            Text("No drivers nearby")
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundColor(.textPrimary)
            
            Text("Drive to discover others within 1km")
                .font(.subheadline)
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)
        }
        .padding()
    }
    
    private var driversList: some View {
        ScrollView {
            LazyVStack(spacing: Constants.Spacing.medium) {
                ForEach(viewModel.nearbyDrivers) { driver in
                    DriverCard(driver: driver)
                        .onTapGesture {
                            selectedDriver = driver
                        }
                }
            }
            .padding()
        }
    }
}

// Simple driver card component
struct DriverCard: View {
    let driver: Driver
    
    var body: some View {
        HStack(spacing: Constants.Spacing.medium) {
            // Direction icon
            Image(systemName: driver.direction.icon)
                .font(.title)
                .foregroundColor(.primaryColor)
                .frame(width: 44, height: 44)
            
            // Driver info
            VStack(alignment: .leading, spacing: 4) {
                Text(driver.plate)
                    .font(.headline)
                    .foregroundColor(.textPrimary)
                
                Text(driver.directionText)
                    .font(.subheadline)
                    .foregroundColor(.textSecondary)
                
                if let vehicleType = driver.vehicleType {
                    Text(vehicleType)
                        .font(.caption)
                        .foregroundColor(.textSecondary)
                }
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .foregroundColor(.textSecondary)
        }
        .padding()
        .background(Color.white.opacity(0.05))
        .cornerRadius(Constants.Size.cornerRadius)
    }
}
