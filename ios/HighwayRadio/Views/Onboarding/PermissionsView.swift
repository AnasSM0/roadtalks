//
//  PermissionsView.swift
//  HighwayRadio
//
//  Initial permissions request screen
//

import SwiftUI

struct PermissionsView: View {
    @EnvironmentObject var viewModel: OnboardingViewModel
    @State private var showingError = false
    @State private var errorMessage = ""
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.backgroundColor.ignoresSafeArea()
                
                VStack(spacing: Constants.Spacing.large) {
                    Spacer()
                    
                    // Title
                    VStack(spacing: Constants.Spacing.small) {
                        Image(systemName: "antenna.radiowaves.left.and.right")
                            .font(.system(size: 60))
                            .foregroundColor(.primaryColor)
                        
                        Text("Highway Radio")
                            .font(.largeTitle)
                            .fontWeight(.semibold)
                            .foregroundColor(.textPrimary)
                        
                        Text("Voice communication for drivers")
                            .font(.subheadline)
                            .foregroundColor(.textSecondary)
                    }
                    
                    Spacer()
                    
                    // Permissions
                    VStack(spacing: Constants.Spacing.medium) {
                        PermissionRow(
                            icon: "mic.fill",
                            title: "Microphone",
                            subtitle: "For voice communication",
                            isGranted: viewModel.microphoneGranted
                        )
                        
                        PermissionRow(
                            icon: "location.fill",
                            title: "Location",
                            subtitle: "To discover nearby drivers",
                            isGranted: viewModel.locationGranted
                        )
                    }
                    
                    // Disclaimer
                    Toggle(isOn: $viewModel.disclaimerAccepted) {
                        Text("I agree to use this app only when safely parked or with hands-free accessories")
                            .font(.caption)
                            .foregroundColor(.textSecondary)
                    }
                    .toggleStyle(CheckboxToggleStyle())
                    .padding(.horizontal)
                    
                    Spacer()
                    
                    // Continue Button
                    PrimaryButton(title: "Request Permissions") {
                        Task {
                            await viewModel.requestPermissions()
                            viewModel.checkLocationPermission()
                        }
                    }
                    .disabled(viewModel.canContinueFromPermissions)
                    .opacity(viewModel.canContinueFromPermissions ? 0.5 : 1)
                    .padding(.horizontal)
                    
                    // Continue to Plate Entry
                    if viewModel.canContinueFromPermissions {
                        NavigationLink {
                            LicensePlateEntryView()
                                .environmentObject(viewModel)
                        } label: {
                            Text("Continue")
                                .font(.headline)
                                .foregroundColor(.primaryColor)
                                .frame(maxWidth: .infinity)
                                .frame(height: Constants.Size.buttonHeight)
                        }
                        .padding(.horizontal)
                    }
                }
                .padding()
            }
        }
    }
}

// MARK: - Permission Row
struct PermissionRow: View {
    let icon: String
    let title: String
    let subtitle: String
    let isGranted: Bool
    
    var body: some View {
        HStack(spacing: Constants.Spacing.medium) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(.primaryColor)
                .frame(width: 40)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                    .foregroundColor(.textPrimary)
                Text(subtitle)
                    .font(.caption)
                    .foregroundColor(.textSecondary)
            }
            
            Spacer()
            
            Image(systemName: isGranted ? "checkmark.circle.fill" : "circle")
                .foregroundColor(isGranted ? .activeVoiceColor : .textSecondary)
        }
        .padding()
        .background(Color.white.opacity(0.05))
        .cornerRadius(Constants.Size.cornerRadius)
        .padding(.horizontal)
    }
}

// MARK: - Checkbox Toggle Style
struct CheckboxToggleStyle: ToggleStyle {
    func makeBody(configuration: Configuration) -> some View {
        HStack(alignment: .top, spacing: Constants.Spacing.small) {
            Image(systemName: configuration.isOn ? "checkmark.square.fill" : "square")
                .foregroundColor(configuration.isOn ? .primaryColor : .textSecondary)
                .onTapGesture {
                    configuration.isOn.toggle()
                }
            configuration.label
        }
    }
}
