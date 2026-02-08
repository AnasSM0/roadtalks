//
//  MainTabView.swift
//  HighwayRadio
//
//  Main tab bar navigation
//

import SwiftUI

struct MainTabView: View {
    @StateObject private var locationService = LocationService()
    @StateObject private var audioService = AudioService()
    @StateObject private var radarViewModel: RadarViewModel
    @State private var selectedTab = 0
    
    init() {
        let locationSvc = LocationService()
        _locationService = StateObject(wrappedValue: locationSvc)
        _audioService = StateObject(wrappedValue: AudioService())
        _radarViewModel = StateObject(wrappedValue: RadarViewModel(locationService: locationSvc))
    }
    
    var body: some View {
        TabView(selection: $selectedTab) {
            RadarView(viewModel: radarViewModel, locationService: locationService, audioService: audioService)
                .tabItem {
                    Label("Radar", systemImage: "location.circle.fill")
                }
                .tag(0)
            
            Text("Settings")
                .tabItem {
                    Label("Settings", systemImage: "gearshape.fill")
                }
                .tag(1)
        }
        .preferredColorScheme(.dark)
        .onAppear {
            locationService.startUpdating()
            radarViewModel.startUpdating()
        }
    }
}
