# TestFlight Setup Guide for Touch Your Bible

This guide will walk you through setting up TestFlight testing for your Touch Your Bible app.

## Prerequisites

1. **Apple Developer Account**: You need an active Apple Developer Program membership ($99/year)
2. **Expo Account**: Sign up at [expo.dev](https://expo.dev) if you haven't already
3. **App Store Connect Access**: Your Apple Developer account should have access to App Store Connect

## Step 1: EAS Authentication

First, you need to log in to EAS. Run this command in your terminal:

```bash
eas login
```

You'll be prompted to enter your Expo account credentials.

## Step 2: Configure Your Project

The project is already configured with:
- ✅ EAS configuration file (`eas.json`)
- ✅ Updated app configuration with proper iOS settings
- ✅ Camera permissions configured
- ✅ Bundle identifier: `com.touchyourbible.app`

## Step 3: Create Your App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "My Apps" → "+" → "New App"
3. Fill in the details:
   - **Platform**: iOS
   - **Name**: Touch Your Bible
   - **Primary Language**: English
   - **Bundle ID**: com.touchyourbible.app
   - **SKU**: touch-your-bible-2024 (or any unique identifier)

## Step 4: Build for TestFlight

Run the following command to build your app for TestFlight:

```bash
eas build --platform ios --profile testflight
```

This will:
- Create a production build optimized for iOS
- Upload it to EAS servers
- Generate an `.ipa` file ready for TestFlight

## Step 5: Submit to TestFlight

After the build completes, submit it to TestFlight:

```bash
eas submit --platform ios --latest
```

You'll need to provide:
- Your Apple ID email
- Your App Store Connect app ID
- Your Apple Team ID

## Step 6: Configure TestFlight

1. Go to App Store Connect → Your App → TestFlight
2. Wait for processing (can take 10-60 minutes)
3. Add test information:
   - **What to Test**: Brief description of what testers should focus on
   - **Test Notes**: Detailed instructions for testers
4. Add internal testers (your team) or external testers (up to 10,000)

## Step 7: Invite Testers

### Internal Testing (Immediate)
- Add team members with App Store Connect access
- They can test immediately after you add them

### External Testing (Requires Apple Review)
- Add up to 10,000 external testers
- Requires Apple's review (usually 24-48 hours)
- Testers receive email invitations

## Testing Checklist

Before submitting to TestFlight, ensure:

- [ ] App builds successfully with `eas build`
- [ ] All camera functionality works
- [ ] Authentication flows work
- [ ] Navigation between screens works
- [ ] Firebase integration works
- [ ] No crashes or major bugs
- [ ] App icons and splash screens display correctly

## Common Issues and Solutions

### Build Failures
```bash
# Clear cache and rebuild
eas build --platform ios --profile testflight --clear-cache
```

### Permission Issues
- Ensure all required permissions are in `app.config.ts`
- Check that camera permissions are properly configured

### Bundle ID Conflicts
- Ensure your bundle ID is unique
- Check App Store Connect for existing apps with same bundle ID

## Useful Commands

```bash
# Check build status
eas build:list

# View build logs
eas build:view [BUILD_ID]

# Update app configuration
eas build:configure

# Submit latest build
eas submit --platform ios --latest

# Check submission status
eas submit:list
```

## Next Steps After TestFlight

1. **Gather feedback from testers**
2. **Fix any reported issues**
3. **Iterate and rebuild as needed**
4. **Prepare for App Store submission**

## Support

- [EAS Documentation](https://docs.expo.dev/build/introduction/)
- [TestFlight Documentation](https://developer.apple.com/testflight/)
- [Expo Discord](https://discord.gg/expo) for community support

---

**Note**: The first TestFlight build may take longer to process. Subsequent builds are usually faster.
