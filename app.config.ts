import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Touch Your Bible',
  slug: 'touch-your-bible',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.touchyourbible.app',
    config: {
      usesNonExemptEncryption: false
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.touchyourbible.app'
  },
  web: {
    favicon: './assets/favicon.png'
  },
  plugins: [
    [
      'expo-router',
      {
        origin: 'https://touchyourbible.app',
        root: './src/app'
      }
    ],
    'expo-secure-store',
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'static',
          deploymentTarget: '15.1',
        },
        android: {
          compileSdkVersion: 33,
          targetSdkVersion: 33,
          buildToolsVersion: '33.0.0',
        },
      },
    ],
  ],
  scheme: ['touchyourbible', 'com.touchyourbible.app'],
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true
  }
}); 