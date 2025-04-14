import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { AppUsageServiceImpl } from '../services/AppUsageServiceImpl';
import { appDetectionService } from '../services/AppDetectionServiceImpl';
import { UsageStats, AppUsageError } from '../services/AppUsageService';
import { AppInfo } from '../services/AppDetectionService';

const appUsageService = new AppUsageServiceImpl();
// appDetectionService is already initialized as a singleton

const validateAssumptions = async () => {
  const results: { test: string; passed: boolean; error?: string }[] = [];

  try {
    // Test 1: App Detection
    const installedApps = await appDetectionService.getInstalledApps();
    results.push({
      test: 'App Detection - Get Installed Apps',
      passed: Array.isArray(installedApps) && installedApps.length > 0
    });

    console.log(`Found ${installedApps.length} installed apps:`, 
      installedApps.map(app => app.name).join(', '));

    if (installedApps.length > 0) {
      const testApp = installedApps[0];
      const isInstalled = await appDetectionService.isAppInstalled(testApp.id);
      results.push({
        test: 'App Detection - Check App Installation',
        passed: isInstalled === true
      });
      
      // Only test app running if we found an app
      const isRunning = await appDetectionService.isAppRunning(testApp.id);
      results.push({
        test: 'App Detection - Check App Running',
        passed: isRunning !== undefined
      });
    }

    // Check URL handling for basic system URLs that should always work
    if (Platform.OS === 'ios') {
      try {
        const canOpenSafari = await Linking.canOpenURL('https://apple.com');
        results.push({
          test: 'URL Handling - Can Open Safari URL',
          passed: canOpenSafari
        });
      } catch (error) {
        results.push({
          test: 'URL Handling - Can Open Safari URL',
          passed: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // Test 2: Usage Stats Permission
    let hasPermission = false;
    try {
      const stats = await appUsageService.getUsageStats();
      hasPermission = true;
      results.push({
        test: 'Usage Stats - Permission Check',
        passed: true
      });
      
      // Check data format - should have timestamps
      const hasValidData = stats.length > 0 && stats[0].totalTimeMs > 0;
      results.push({
        test: 'Usage Stats - Data Format',
        passed: hasValidData
      });
    } catch (error: any) {
      if (error.code === 'PERMISSION_DENIED') {
        results.push({
          test: 'Usage Stats - Permission Check',
          passed: false,
          error: 'Permission denied. Please grant usage access permission.'
        });
      } else {
        throw error;
      }
    }

    return results;
  } catch (error) {
    console.error('Error validating assumptions:', error);
    results.push({
      test: 'Error during validation',
      passed: false,
      error: error instanceof Error ? error.message : String(error)
    });
    return results;
  }
};

export const AppUsageTestScreen = () => {
  const [results, setResults] = useState<{ test: string; passed: boolean; error?: string }[]>([]);
  const [installedApps, setInstalledApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [platformDetails, setPlatformDetails] = useState<string>('');

  const runTests = async () => {
    setLoading(true);
    try {
      // Get platform details
      const details = `OS: ${Platform.OS}\nVersion: ${Platform.Version}\nIs iOS 9+: ${parseInt(String(Platform.Version)) >= 9}\n`;
      setPlatformDetails(details);
      
      const testResults = await validateAssumptions();
      setResults(testResults);
      
      // Get installed apps for display
      const apps = await appDetectionService.getInstalledApps();
      setInstalledApps(apps);
    } catch (error) {
      console.error('Error running tests:', error);
      Alert.alert('Error', 'Failed to run tests: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  const requestPermissions = async () => {
    try {
      const granted = await appDetectionService.requestPermissions();
      if (granted) {
        Alert.alert('Success', 'Permissions granted');
        runTests();
      } else {
        Alert.alert('Failed', 'Unable to get permissions');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request permissions: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Test a specific URL scheme
  const testScheme = async (scheme: string) => {
    try {
      const canOpen = await Linking.canOpenURL(scheme);
      Alert.alert(
        `Test URL Scheme: ${scheme}`,
        `Can open: ${canOpen ? 'YES' : 'NO'}`
      );
    } catch (error) {
      Alert.alert(
        `Error Testing Scheme: ${scheme}`,
        error instanceof Error ? error.message : String(error)
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>App Detection Test</Text>
      <Text style={styles.subtitle}>Platform: {Platform.OS}</Text>
      
      {platformDetails ? (
        <View style={styles.platformInfo}>
          <Text style={styles.sectionTitle}>Platform Details:</Text>
          <Text style={styles.platformText}>{platformDetails}</Text>
        </View>
      ) : null}
      
      <TouchableOpacity style={styles.button} onPress={runTests} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Running Tests...' : 'Run Tests'}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={requestPermissions}>
        <Text style={styles.buttonText}>Request Permissions</Text>
      </TouchableOpacity>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.smallButton} onPress={() => testScheme('safari://')}>
          <Text style={styles.buttonText}>Test Safari</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallButton} onPress={() => testScheme('mailto://')}>
          <Text style={styles.buttonText}>Test Mail</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.resultsContainer}>
        <Text style={styles.sectionTitle}>Test Results:</Text>
        {results.map((result, index) => (
          <View key={index} style={styles.resultItem}>
            <Text style={styles.resultText}>
              {result.test}: {result.passed ? '✅' : '❌'}
            </Text>
            {result.error && <Text style={styles.errorText}>{result.error}</Text>}
          </View>
        ))}
      </View>
      
      <View style={styles.appsContainer}>
        <Text style={styles.sectionTitle}>Detected Apps ({installedApps.length}):</Text>
        {installedApps.map((app, index) => (
          <View key={index} style={styles.appItem}>
            <Text style={styles.appName}>{app.name}</Text>
            <Text style={styles.appId}>ID: {app.id}</Text>
            {app.category && <Text style={styles.appCategory}>Category: {app.category}</Text>}
            {app.isRunning !== undefined && (
              <Text style={[styles.appRunning, app.isRunning ? styles.running : styles.notRunning]}>
                {app.isRunning ? 'Running' : 'Not Running'}
              </Text>
            )}
            <TouchableOpacity 
              style={styles.testButton} 
              onPress={() => testScheme(app.id)}
            >
              <Text style={styles.testButtonText}>Test URL</Text>
            </TouchableOpacity>
          </View>
        ))}
        
        {installedApps.length === 0 && (
          <Text style={styles.noApps}>No apps detected</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    color: '#666',
  },
  platformInfo: {
    padding: 12,
    backgroundColor: '#e8f4fd',
    borderRadius: 4,
    marginBottom: 16,
  },
  platformText: {
    fontFamily: 'monospace',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  smallButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    flex: 0.48,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  resultItem: {
    marginBottom: 8,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  resultText: {
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    marginTop: 4,
    color: '#f44336',
    fontSize: 14,
  },
  appsContainer: {
    marginBottom: 24,
  },
  appItem: {
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 4,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  appId: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  appCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  appRunning: {
    marginTop: 4,
    fontWeight: 'bold',
  },
  running: {
    color: '#4CAF50',
  },
  notRunning: {
    color: '#f44336',
  },
  noApps: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 4,
    textAlign: 'center',
    color: '#666',
  },
  testButton: {
    marginTop: 8,
    backgroundColor: '#e0e0e0',
    padding: 6,
    borderRadius: 4,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  testButtonText: {
    color: '#333',
    fontSize: 12,
  },
});

export default AppUsageTestScreen; 