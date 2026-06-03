import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bobvarkey.strokediagnosticcompass',
  appName: 'Stroke Diagnostic Compass',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'always',
    // Info.plist overrides for privacy descriptions
    // These must match actual data collection in PrivacyScreen
    infoPlist: {
      NSFaceIDUsageDescription: 'Used to authenticate and secure clinical data access.',
      NSPhotoLibraryUsageDescription: 'Used to import patient documents and lab reports (optional).',
      NSCameraUsageDescription: 'Used to capture documents for OCR import (optional).',
    },
  },
  android: {
    // AndroidManifest.xml additions
    // These must match actual data collection
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f1219',  // matches --background
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;