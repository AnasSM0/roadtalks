# Highway Radio iOS App

Complete iOS implementation for Highway Radio MVP - a walkie-talkie style voice communication app for highway drivers.

## Requirements

- iOS 16.0+
- Xcode 15.0+
- Swift 5.9+
- Active Apple Developer account (for device testing)

## Architecture

- **UI Framework**: SwiftUI
- **Navigation**: NavigationStack
- **State Management**: @Observable, @State, Combine
- **Backend**: Supabase (Auth, Database, Realtime)
- **Voice**: WebRTC (audio-only)
- **Location**: CoreLocation (foreground only)
- **Design**: Dark mode only, SF Pro font

## Project Structure

```
HighwayRadio/
├── App/
│   ├── HighwayRadioApp.swift          # App entry point
│   └── AppDelegate.swift              # App lifecycle management
├── Core/
│   ├── Config/
│   │   └── SupabaseConfig.swift       # Supabase configuration + auth
│   ├── Extensions/
│   │   ├── Color+Theme.swift          # Theme colors
│   │   └── View+Extensions.swift      # View helpers
│   └── Utilities/
│       ├── HapticManager.swift        # Haptic feedback
│       └── Constants.swift            # App constants
├── Models/
│   ├── Session.swift                  # Driver session model
│   ├── Driver.swift                   # Nearby driver model
│   └── VoiceSession.swift             # Voice call model
├── Services/
│   ├── SupabaseService.swift          # Database & Realtime
│   ├── WebRTCService.swift            # WebRTC peer connection
│   ├── LocationService.swift          # CoreLocation wrapper
│   └── AudioService.swift             # Audio session + headset check
├── ViewModels/
│   ├── OnboardingViewModel.swift      # Permissions + plate entry
│   ├── RadarViewModel.swift           # Nearby drivers
│   ├── DriveViewModel.swift           # Active call + PTT
│   └── SettingsViewModel.swift        # Settings screen
└── Views/
    ├── Onboarding/
    │   ├── PermissionsView.swift      # Permissions request
    │   └── LicensePlateEntryView.swift # Plate entry
    ├── Main/
    │   ├── MainTabView.swift          # Tab navigation
    │   ├── RadarView.swift            # Nearby drivers list
    │   ├── DriverDetailView.swift     # Driver detail + connect
    │   ├── DriveView.swift            # Active call + PTT button
    │   └── SettingsView.swift         # Settings
    └── Components/
        ├── PrimaryButton.swift        # Primary button component
        ├── DangerButton.swift         # Danger button component
        ├── DriverCard.swift           # Driver list card
        └── WaveformView.swift         # Audio waveform animation
```

## Setup Instructions

### 1. Create Xcode Project

1. Open Xcode 15+
2. Create new **iOS App**:
   - Product Name: `HighwayRadio`
   - Team: Your Apple Developer account
   - Organization Identifier: `com.yourcompany.highwayradio`
   - Interface: **SwiftUI**
   - Language: **Swift**
   - Minimum Deployment: **iOS 16.0**

### 2. Add Swift Package Dependencies

Add these packages via File → Add Package Dependencies:

**Supabase Swift**:
- URL: `https://github.com/supabase/supabase-swift`
- Version: Latest stable (2.x)

**WebRTC**:
- URL: `https://github.com/stasel/WebRTC`
- Version: 120.0.0+

### 3. Configure Info.plist

Add required permissions:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>HighwayRadio needs microphone access for voice communication with nearby drivers.</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>HighwayRadio needs your location to discover nearby drivers.</string>

<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
</array>
```

### 4. Add Files from `ios/` Directory

Copy all Swift files from this repository into your Xcode project following the structure above.

### 5. Configure Supabase Credentials

Edit `Core/Config/SupabaseConfig.swift`:

```swift
static let url = URL(string: "YOUR_SUPABASE_URL")!
static let anonKey = "YOUR_SUPABASE_ANON_KEY"
```

Get these from Supabase Dashboard → Settings → API

### 6. Set App Icon & Assets

- Add app icon to Assets.xcassets (1024x1024)
- Theme colors are predefined in `Color+Theme.swift`

## Building & Running

### Simulator (Limited)
⚠️ **WebRTC does not work on iOS Simulator**

You can test UI and navigation, but voice features require real devices.

### Physical Device (Recommended)

1. Connect iPhone via cable
2. Select your device in Xcode
3. Click Run (Cmd + R)
4. Trust developer certificate on device

### Testing with 2 Devices

For full MVP testing, you need 2 physical iPhones:
1. Build to Device 1
2. Build to Device 2
3. Use different license plates
4. Test proximity detection and voice calls

## Key Features Implemented

### Safety Compliance ✅
- Bluetooth/headphone requirement enforced
- PTT button disabled without headset
- Speed-based call restrictions (>80 km/h)
- Dark mode only (less distracting)
- Large touch targets (48pt+)
- No text input while driving

### Core Functionality ✅
- Anonymous Supabase authentication
- License plate-based identity
- 1km proximity detection (PostGIS)
- Ahead/Behind direction calculation
- Push-to-talk voice (WebRTC)
- Auto-disconnect on distance breach
- Real-time presence updates

## Environment

All code assumes:
- Dark mode only (enforced)
- Portrait orientation
- Safe area insets handled
- Haptic feedback enabled

## Troubleshooting

### "Supabase module not found"
- Verify Swift packages are added
- Clean build folder (Cmd + Shift + K)
- Rebuild project

### "WebRTC build errors"
- Ensure using physical device (not simulator)
- Check WebRTC package version

### "Location not updating"
- Check Info.plist permissions
- Verify location permission granted in Settings

### "Microphone permission denied"
- Check Info.plist has microphone description
- Reset permissions: Settings → General → Reset → Reset Location & Privacy

## App Store Submission Notes

Before submission:
- [ ] All safety disclaimers in place
- [ ] Bluetooth/headphone check working
- [ ] Privacy policy URL configured
- [ ] App description emphasizes "hands-free only"
- [ ] Screenshots show headset connected

## License

MIT

---

**Ready to build! Follow setup instructions above.**
