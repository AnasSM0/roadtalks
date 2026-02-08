//
//  HighwayRadioApp.swift
//  HighwayRadio
//
//  Main app entry point
//

import SwiftUI

@main
struct HighwayRadioApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @StateObject private var onboardingViewModel = OnboardingViewModel()
    
    var body: some Scene {
        WindowGroup {
            Group {
                if onboardingViewModel.isOnboardingComplete {
                    MainTabView()
                        .environmentObject(onboardingViewModel)
                } else {
                    PermissionsView()
                        .environmentObject(onboardingViewModel)
                }
            }
            .preferredColorScheme(.dark) // Force dark mode
        }
    }
}
