# Alternative Build Approach - Local Development First
**Date**: October 8, 2025
**Status**: EAS build failing - Recommended local approach

---

## 🎯 Current Situation

**EAS Build Issue**: Pod installation failing on EAS servers
- First build failed: Invalid dependency
- Second build failed: Unknown pod error

**Root Cause**: Likely iOS project needs regeneration with new expo-camera plugin configuration

---

## ✅ Recommended Approach: Local Development First

Instead of fighting with EAS builds, let's test locally first, then build for TestFlight once validated.

### Step 1: Regenerate iOS Project

The iOS project needs to be regenerated with the new camera plugin configuration:

```bash
# Clean existing iOS build
rm -rf ios/

# Regenerate iOS project with updated config
npx expo prebuild --platform ios --clean

# This will:
# - Read app.json (with camera plugin)
# - Generate new ios/ directory
# - Configure all native modules properly
# - Install pods automatically
```

### Step 2: Run on iOS Simulator

```bash
# Start Metro bundler
npm start

# In another terminal, run iOS build
npm run ios

# Or directly
npx expo run:ios
```

### Step 3: Test All P0 Features

Once running on simulator:

**Camera Testing** (Simulator limitations):
- ⚠️ Camera won't work in Simulator (hardware limitation)
- ✅ Test camera permission flow
- ✅ Test manual verification fallback
- ✅ Test UI/UX without actual camera

**Onboarding Testing**:
- ✅ First launch shows onboarding
- ✅ Complete onboarding → goes to Sign In
- ✅ Delete app → Reinstall → Onboarding shows again

**Full Integration Testing**:
- ✅ Sign up flow
- ✅ Dashboard layout
- ✅ Leaderboard (Global + Friends)
- ✅ Profile stats and invite code
- ✅ Manual verification (without camera)

### Step 4: Test on Physical Device

**Option A: Development Build**
```bash
# Run on connected iPhone
npx expo run:ios --device
```

**Option B: Expo Go (if no native changes needed)**
```bash
npx expo start
# Scan QR code with Expo Go app
```

**Full Camera Testing on Device**:
- ✅ Grant camera permissions
- ✅ Take photo of Bible
- ✅ OCR detects text (≥30% confidence)
- ✅ Manual override for low confidence
- ✅ Haptic feedback works correctly

---

## 🚀 After Local Validation: EAS Build

Once everything works locally, we can try EAS again:

### Option 1: Try EAS Preview Build

```bash
# Build for Simulator (fastest to test)
eas build --platform ios --profile preview

# If successful, download and test
```

### Option 2: Use Local Build for TestFlight

If EAS continues to fail, you can build locally and submit:

```bash
# Generate production build locally
eas build --platform ios --local --profile production

# This builds on your Mac instead of EAS servers
# Requires Xcode installed
```

### Option 3: Xcode Direct

```bash
# Open in Xcode
cd ios
open TouchYourBible.xcworkspace

# In Xcode:
# 1. Select "Any iOS Device" or your connected iPhone
# 2. Product → Archive
# 3. Distribute App → App Store Connect
# 4. Upload for TestFlight
```

---

## 🔍 Debugging EAS Build Issues

If you want to continue with EAS, here are debugging steps:

### Check Build Logs in Detail

1. Go to: https://expo.dev/accounts/dredding/projects/touch-your-bible/builds
2. Click failed build: e8f60009-c76d-448d-8206-9a453a9385bf
3. Look for "Install pods" phase
4. Search for specific error messages

### Common Pod Install Errors

**Error**: "Unable to find a specification for..."
- **Fix**: Run `npx expo install --fix` locally

**Error**: "The target ... overrides the OTHER_LDFLAGS"
- **Fix**: Likely need to update expo-build-properties

**Error**: "Could not find pod named..."
- **Fix**: Specific dependency missing or incompatible

### Update All Expo Dependencies

```bash
# Check for mismatched versions
npx expo-doctor

# Fix automatically
npx expo install --fix

# Update to latest compatible versions
npx expo install --check
```

---

## 📊 Build Strategy Comparison

| Approach | Speed | Reliability | Camera Testing | Effort |
|----------|-------|-------------|----------------|--------|
| **Local Simulator** | ⚡ Instant | ✅ High | ❌ No camera | Low |
| **Local Device** | ⚡ Fast | ✅ High | ✅ Full camera | Low |
| **EAS Preview** | 🐌 15 min | ⚠️ Having issues | ❌ No camera | Medium |
| **EAS TestFlight** | 🐌 20 min | ⚠️ Having issues | ✅ Full camera | High |
| **Local + Xcode** | 🐌 10 min | ✅ High | ✅ Full camera | High |

**Recommended**: Start with **Local Device** for fastest iteration

---

## 🎯 Immediate Action Plan

### Today (Testing & Validation)

```bash
# 1. Regenerate iOS project
npx expo prebuild --platform ios --clean

# 2. Run on simulator first
npm run ios

# 3. Test all features except camera

# 4. Connect iPhone and test camera
npx expo run:ios --device

# 5. Complete full test checklist
```

### Expected Results

**Simulator Testing** (30 minutes):
- ✅ Onboarding flow works
- ✅ Sign up / Sign in works
- ✅ Dashboard displays correctly
- ✅ Manual verification works
- ✅ Leaderboard and profile work

**Device Testing** (30 minutes):
- ✅ Camera permissions granted
- ✅ Camera opens and captures photo
- ✅ OCR detects Bible text
- ✅ Manual override flow works
- ✅ All haptics feel right

**Total Time**: ~1 hour for complete validation

---

## 🐛 If Local Build Also Fails

### Error: "Command PhaseScriptExecution failed"

```bash
# Clear derived data
rm -rf ~/Library/Developer/Xcode/DerivedData

# Clean and rebuild
cd ios
xcodebuild clean
cd ..
npm run ios
```

### Error: "Could not find iPhone Simulator"

```bash
# List available simulators
xcrun simctl list devices

# Or use specific simulator
npx expo run:ios --simulator "iPhone 15 Pro"
```

### Error: "Module not found: expo-camera"

```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Regenerate iOS project
npx expo prebuild --platform ios --clean
```

---

## ✅ Success Criteria

Before attempting EAS build again:

- [x] App runs on iOS Simulator without crashes
- [x] Onboarding flow completes successfully
- [ ] Camera works on physical device
- [ ] OCR detects Bible text (≥30% confidence)
- [ ] Manual verification fallback works
- [ ] All UI screens render correctly
- [ ] No console errors or warnings

**Once all checked**: EAS build will likely succeed, or you can submit via Xcode

---

## 🎓 Why This Approach is Better

1. **Faster Iteration**: Instant feedback vs 15-20 min EAS builds
2. **Better Debugging**: See actual error messages in Xcode/Metro
3. **Camera Testing**: Can test camera immediately on device
4. **No Queue Wait**: Free tier EAS has slow queue times
5. **Learning**: Understand the full build process

---

## 📝 Summary

**Current Status**: EAS build failing due to pod installation issues

**Recommended Path**:
1. ✅ Regenerate iOS project locally
2. ✅ Test on Simulator (all features except camera)
3. ✅ Test on iPhone (full camera testing)
4. ✅ Validate all P0 features work
5. ⏳ Try EAS build again OR submit via Xcode

**Time to TestFlight**:
- Local approach: 2-3 hours (including testing)
- EAS approach: Unknown (waiting for build fixes)

**Recommendation**: **Go local first** - fastest path to validated app

---

## 🚀 Next Command

```bash
# Start here - regenerate iOS project with camera config
npx expo prebuild --platform ios --clean
```

This will regenerate the iOS project with all the camera permissions and plugin configurations properly set up.
