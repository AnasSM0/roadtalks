# Highway Radio - Testing Guide

Complete testing protocol for 2-device validation.

---

## Test Environment Setup

### Required Hardware
- ✅ 2 iPhones (iOS 16.0+)
- ✅ 2 Bluetooth headsets OR wired headphones
- ✅ Both devices on cellular/WiFi

### Test Locations
- **Indoor**: Office/home (for basic functionality)
- **Outdoor**: Parking lot or road (for real-world testing)
- **Distance**: Start close (10m), gradually increase to 1km

---

## Pre-Test Checklist

### Backend
- [ ] Supabase project deployed
- [ ] Edge Functions responding (test with curl)
- [ ] Realtime enabled for sessions + voice_sessions
- [ ] Anonymous auth enabled

### iOS Apps
- [ ] Both devices have app installed
- [ ] Supabase credentials configured
- [ ] Info.plist permissions set
- [ ] Apps build without errors

### Permissions (Each Device)
- [ ] Microphone permission granted
- [ ] Location permission granted ("While Using")
- [ ] Bluetooth headset connected

---

## Test Protocol

### Phase 1: Onboarding & Permissions

#### Test 1.1: Permissions Flow (Device 1)
1. Launch app (fresh install)
2. **Expected**: Permissions screen shows
3. Tap "Request Permissions"
4. **Expected**: iOS permission dialogs appear
5. Grant microphone
6. Grant location ("While Using the App")
7. **Expected**: Both show ✅ checkmark
8. Check disclaimer checkbox
9. **Expected**: "Continue" button appears
10. Tap "Continue"

✅ **Pass Criteria**: All permissions granted, navigation proceeds

#### Test 1.2: License Plate Entry (Device 1)
1. Enter plate: `TEST01`
2. **Expected**: Validation shows "Valid format"
3. Select vehicle type: "Car" (optional)
4. Tap "Start Session"
5. **Expected**: Loading spinner shows
6. **Expected**: App navigates to main screen (Radar tab)

✅ **Pass Criteria**: Session created, no errors

#### Test 1.3: Repeat for Device 2
- Enter plate: `TEST02`
- Select vehicle type: "Truck"
- Start session

✅ **Pass Criteria**: Both devices active with different plates

---

### Phase 2: Proximity Detection

#### Test 2.1: Discovery (Close Range)
**Setup**: Devices 10 meters apart, both stationary

1. On Device 1: Open "Radar" tab
2. Wait 5 seconds (auto-refresh)
3. **Expected**: `TEST02` appears in driver list
4. **Expected**: Shows distance (~10m)
5. **Expected**: Shows direction (ahead/behind)

✅ **Pass Criteria**: Device discovers other within 5 seconds

#### Test 2.2: Direction Calculation
**Setup**: Device 2 in front of Device 1 (same direction)

1. On Device 1: Check direction for TEST02
2. **Expected**: Shows "Ahead"
3. Swap positions (Device 2 behind Device 1)
4. Refresh radar
5. **Expected**: Shows "Behind"

✅ **Pass Criteria**: Direction updates correctly

#### Test 2.3: Distance Accuracy
**Setup**: Measure actual distance with phone GPS or tape

Test distances:
- 10m: Expected ±5m accuracy
- 50m: Expected ±10m accuracy
- 100m: Expected ±20m accuracy
- 500m: Expected ±50m accuracy
- 1000m (1km): Expected ±100m accuracy

✅ **Pass Criteria**: Distance within expected margin

#### Test 2.4: Max Range Test
**Setup**: Move devices to 1.5km apart

1. Check Radar on Device 1
2. **Expected**: TEST02 does NOT appear (>1km limit)
3. Move to 900m apart
4. **Expected**: TEST02 appears

✅ **Pass Criteria**: 1km radius enforced

---

### Phase 3: Safety Features

#### Test 3.1: Bluetooth Requirement
1. On Device 1: Disconnect Bluetooth headset
2. Tap on TEST02 driver
3. **Expected**: Warning banner shows
   - "Connect headphones or Bluetooth for hands-free use"
4. **Expected**: "Connect" button is disabled (grayed out)
5. Connect Bluetooth headset
6. **Expected**: Warning disappears
7. **Expected**: "Connect" button enabled

✅ **Pass Criteria**: PTT blocked without headset

#### Test 3.2: Speed Restriction
**Setup**: Simulate driving >80 km/h (use car or location spoofing)

1. Start driving (real or simulated) at 85 km/h
2. Try to initiate call
3. **Expected**: Error message
   - "Slow down to connect (max 80 km/h)"
4. Slow to 75 km/h
5. Try again
6. **Expected**: Call initiates successfully

✅ **Pass Criteria**: Calls blocked above 80 km/h

⚠️ **Safety Note**: Test this in safe environment only

---

### Phase 4: Voice Call (After WebRTC Implementation)

#### Test 4.1: Call Initiation
1. Device 1: Tap on TEST02 driver
2. **Expected**: Driver  detail screen shows
3. Tap "Connect"
4. **Expected**: Loading, then Drive Mode screen appears
5. **Expected**: Shows "TEST02" at top
6. **Expected**: Timer starts at 00:00
7. Device 2: **Expected**: Incoming call notification/screen

✅ **Pass Criteria**: Call setup completes, both screens update

#### Test 4.2: PTT Transmission
1. Device 1: Press and hold PTT button
2. **Expected**: Button turns green
3. **Expected**: Haptic feedback on press
4. **Expected**: Shows "TRANSMITTING"
5. Speak: "Test message"
6. Release PTT button
7. **Expected**: Button returns to blue
8. **Expected**: Haptic feedback on release
9. Device 2: **Expected**: Hears "Test message"

✅ **Pass Criteria**: Audio transmitted successfully

#### Test 4.3: Bidirectional Communication
1. Device 2: Press PTT, speak "Acknowledged"
2. Release
3. Device 1: **Expected**: Hears "Acknowledged"
4. Repeat 5 times alternating

✅ **Pass Criteria**: Clear audio both directions

#### Test 4.4: Call Duration
1. Stay in call for 60 seconds
2. **Expected**: Timer shows 01:00
3. Continue to 2 minutes
4. **Expected**: Timer shows 02:00

✅ **Pass Criteria**: Timer accurate

#### Test 4.5: Call Termination
1. Device 1: Tap "End Call"
2. **Expected**: Returns to Radar screen
3. Device 2: **Expected**: Call ends automatically
4. Both devices: Check Radar refreshes

✅ **Pass Criteria**: Clean disconnect both sides

---

### Phase 5: Edge Cases

#### Test 5.1: Background App
1. Device 1: Start call with Device 2
2. Device 1: Press home button (app backgrounds)
3. **Expected**: Audio continues (background mode)
4. Device 1: Return to app
5. **Expected**: Call still active

✅ **Pass Criteria**: Call persists in background

#### Test 5.2: Lost Connection
1. Start call between devices
2. Turn off WiFi/cellular on Device 1
3. Wait 30 seconds
4. **Expected**: Call ends, shows error
5. Restore connection
6. **Expected**: Can initiate new call

✅ **Pass Criteria**: Graceful handling of network loss

#### Test 5.3: Distance Breach During Call
1. Start call at 100m distance
2. Move Device 2 to 1.5km away
3. **Expected**: Call auto-disconnects
4. **Expected**: Reason shown (distance exceeded)

✅ **Pass Criteria**: Auto-disconnect on distance breach

#### Test 5.4: Multiple Drivers
**Setup**: Add 3rd device if available

1. Device 1: Check Radar
2. **Expected**: Both TEST02 and TEST03 visible
3. **Expected**: Sorted by distance (closest first)
4. **Expected**: Each shows correct distance/direction

✅ **Pass Criteria**: Handles multiple nearby drivers

#### Test 5.5: Stale Session Cleanup
1. Device 1: Force quit app (swipe up in app switcher)
2. Wait 35 seconds
3. Device 2: Refresh Radar
4. **Expected**: TEST01 disappears (stale after 30s)
5. Device 1: Relaunch app
6. **Expected**: Must re-enter plate

✅ **Pass Criteria**: Automatic cleanup of inactive sessions

---

## Performance Benchmarks

### Latency Targets (After WebRTC Implementation)

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| PTT Press to Audio Start | <200ms | <500ms | >500ms |
| Audio End-to-End | <300ms | <800ms | >800ms |
| Radar Refresh | <2s | <5s | >5s |
| Call Connect Time | <3s | <6s | >6s |

### Battery Usage
- **Normal use** (1hr): <10% battery drain
- **Active call** (30min): <20% battery drain

---

## Bug Reporting Template

If issues found:

```
**Issue**: Brief description
**Device**: iPhone model + iOS version
**Steps to Reproduce**:
1. Step one
2. Step two
3. Step three

**Expected**: What should happen
**Actual**: What actually happened
**Frequency**: Always / Sometimes / Rare
**Logs**: Any console errors (attach screenshot)
```

---

## Test Results Template

```
### Test Session: [Date]

**Backend**: Supabase project URL
**Devices**:
- Device 1: iPhone [model], iOS [version], Plate: [plate]
- Device 2: iPhone [model], iOS [version], Plate: [plate]

**Phase 1 - Onboarding**: ✅ Pass / ❌ Fail
- Comments:

**Phase 2 - Proximity**: ✅ Pass / ❌ Fail
- Max range achieved: [distance]
- Accuracy: ±[meters]

**Phase 3 - Safety**: ✅ Pass / ❌ Fail
- Bluetooth check: ✅ Pass / ❌ Fail
- Speed check: ✅ Pass / ❌ Fail

**Phase 4 - Voice**: ✅ Pass / ❌ Fail (pending WebRTC)
- Audio quality: Clear / Choppy / Failed
- Latency: [ms]

**Phase 5 - Edge Cases**: ✅ Pass / ❌ Fail
- Issues found: [count]

**Overall Result**: ✅ Ready / ⚠️ Needs work / ❌ Blocked
```

---

## Next Steps After Testing

### If All Tests Pass ✅
1. Document any observations
2. Consider production WebRTC implementation
3. Plan for App Store submission

### If Tests Fail ❌
1. Document exact failure scenario
2. Check backend logs (Supabase Dashboard → Logs)
3. Review RLS policies
4. Verify Edge Functions deployed correctly
5. Check iOS app configuration

---

**Good luck testing! 🧪**
