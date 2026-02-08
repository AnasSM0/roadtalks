//
//  LicensePlateEntryView.swift
//  HighwayRadio
//
//  License plate entry screen
//

import SwiftUI

struct LicensePlateEntryView: View {
    @EnvironmentObject var viewModel: OnboardingViewModel
    @State private var isLoading = false
    @State private var showingError = false
    @State private var errorMessage = ""
    
    let vehicleTypes = ["Car", "Truck", "Motorcycle", "SUV"]
    
    var body: some View {
        ZStack {
            Color.backgroundColor.ignoresSafeArea()
            
            VStack(spacing: Constants.Spacing.xlarge) {
                Spacer()
                
                // Title
                VStack(spacing: Constants.Spacing.small) {
                    Text("Enter License Plate")
                        .font(.largeTitle)
                        .fontWeight(.semibold)
                        .foregroundColor(.textPrimary)
                    
                    Text("This will be your temporary identity")
                        .font(.subheadline)
                        .foregroundColor(.textSecondary)
                }
                
                // Plate Input
                TextField("ABC123", text: $viewModel.currentPlate)
                    .font(.system(size: 32, weight: .bold, design: .monospaced))
                    .foregroundColor(.textPrimary)
                    .multilineTextAlignment(.center)
                    .textInputAutocapitalization(.characters)
                    .keyboardType(.asciiCapable)
                    .padding()
                    .background(Color.white.opacity(0.1))
                    .cornerRadius(Constants.Size.cornerRadius)
                    .padding(.horizontal, Constants.Spacing.xlarge)
                
                // Validation
                if !viewModel.currentPlate.isEmpty {
                    HStack(spacing: Constants.Spacing.small) {
                        Image(systemName: viewModel.isPlateValid ? "checkmark.circle.fill" : "xmark.circle.fill")
                            .foregroundColor(viewModel.isPlateValid ? .activeVoiceColor : .dangerColor)
                        Text(viewModel.isPlateValid ? "Valid format" : "2-10 characters, letters/numbers only")
                            .font(.caption)
                            .foregroundColor(.textSecondary)
                    }
                }
                
                // Vehicle Type (Optional)
                VStack(alignment: .leading, spacing: Constants.Spacing.small) {
                    Text("Vehicle Type (Optional)")
                        .font(.subheadline)
                        .foregroundColor(.textSecondary)
                        .padding(.horizontal, Constants.Spacing.xlarge)
                    
                    Picker("Vehicle Type", selection: $viewModel.selectedVehicleType) {
                        Text("Not specified").tag(nil as String?)
                        ForEach(vehicleTypes, id: \.self) { type in
                            Text(type).tag(type as String?)
                        }
                    }
                    .pickerStyle(.segmented)
                    .padding(.horizontal, Constants.Spacing.xlarge)
                }
                
                Spacer()
                
                // Start Button
                PrimaryButton(title: isLoading ? "Starting..." : "Start Session") {
                    startSession()
                }
                .disabled(!viewModel.isPlateValid || isLoading)
                .padding(.horizontal)
            }
            .padding()
        }
        .navigationBarTitleDisplayMode(.inline)
        .alert("Error", isPresented: $showingError) {
            Button("OK") { }
        } message: {
            Text(errorMessage)
        }
    }
    
    private func startSession() {
        isLoading = true
        Task {
            do {
                try await viewModel.startSession()
            } catch {
                errorMessage = error.localizedDescription
                showingError = true
            }
            isLoading = false
        }
    }
}
