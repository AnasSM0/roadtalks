//
//  DriveView.swift
//  HighwayRadio
//
//  Active call with PTT button
//

import SwiftUI

struct DriveView: View {
    @ObservedObject var viewModel: DriveViewModel
    let driver: Driver
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        ZStack {
            Color.backgroundColor.ignoresSafeArea()
            
            VStack(spacing: Constants.Spacing.xlarge) {
                // Header
                VStack(spacing: Constants.Spacing.small) {
                    Text(driver.plate)
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(.textPrimary)
                    
                    if viewModel.isInCall {
                        Text(viewModel.durationFormatted)
                            .font(.title3)
                            .fontWeight(.medium)
                            .foregroundColor(.textSecondary)
                            .monospacedDigit()
                    }
                }
                .padding(.top, Constants.Spacing.xlarge)
                
                Spacer()
                
                // PTT Button
                ZStack {
                    Circle()
                        .fill(viewModel.isTransmitting ? Color.activeVoiceColor : Color.primaryColor)
                        .frame(width: Constants.Size.pttButtonSize, height: Constants.Size.pttButtonSize)
                        .scaleEffect(viewModel.isTransmitting ? 1.1 : 1.0)
                        .animation(.spring(response: 0.3), value: viewModel.isTransmitting)
                    
                    VStack(spacing: Constants.Spacing.small) {
                        Image(systemName: viewModel.isTransmitting ? "mic.fill" : "mic.circle.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.white)
                        
                        Text(viewModel.isTransmitting ? "TRANSMITTING" : "HOLD TO TALK")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                    }
                }
                .gesture(
                    DragGesture(minimumDistance: 0)
                        .onChanged { _ in
                            if !viewModel.isTransmitting {
                                viewModel.startTransmitting()
                            }
                        }
                        .onEnded { _ in
                            viewModel.stopTransmitting()
                        }
                )
                
                Spacer()
                
                // End Call Button
                DangerButton(title: "End Call") {
                    viewModel.endCall()
                    dismiss()
                }
                .padding(.horizontal)
                .padding(.bottom, Constants.Spacing.xlarge)
            }
        }
        .interactiveDismissDisabled()
        .onDisappear {
            if viewModel.isInCall {
                viewModel.endCall()
            }
        }
    }
}

// Primary Button Component
struct PrimaryButton: View {
    let title: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.headline)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: Constants.Size.buttonHeight)
                .background(Color.primaryColor)
                .cornerRadius(Constants.Size.cornerRadius)
        }
    }
}

// Danger Button Component
struct DangerButton: View {
    let title: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.headline)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: Constants.Size.buttonHeight)
                .background(Color.dangerColor)
                .cornerRadius(Constants.Size.cornerRadius)
        }
    }
}
