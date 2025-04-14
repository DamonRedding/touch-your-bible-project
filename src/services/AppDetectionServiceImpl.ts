import { AppDetectionService, AppInfo, AppDetectionError, AppDetectionErrorCodes } from './AppDetectionService';
import * as AppDetection from '../../modules/app-detection';
import { Platform, Linking } from 'react-native';

class AppDetectionServiceImpl implements AppDetectionService {
    /**
     * Check if the app has all required permissions
     * @returns Promise<boolean> True if all permissions are granted
     */
    async checkPermissions(): Promise<{ [key: string]: boolean }> {
        try {
            if (Platform.OS === 'android') {
                return await AppDetection.checkPermissions();
            } else if (Platform.OS === 'ios') {
                // iOS doesn't need special permissions for the limited functionality available
                return { hasUsageStatsPermission: true };
            } else {
                return { hasUsageStatsPermission: false };
            }
        } catch (error) {
            console.warn('[AppDetection] Error checking permissions:', error);
            return { hasUsageStatsPermission: false };
        }
    }

    /**
     * Request required permissions for full functionality
     * @returns Promise<boolean> True if permissions are now granted
     */
    async requestPermissions(): Promise<boolean> {
        try {
            if (Platform.OS === 'android') {
                // On Android, we need to direct the user to Usage Access settings
                const url = 'package:com.touchyourbible.app';
                await Linking.openSettings();
                // Need to check again after they return
                const permissions = await this.checkPermissions();
                return permissions.hasUsageStatsPermission === true;
            } else {
                // iOS doesn't need special permissions for the limited functionality available
                return true;
            }
        } catch (error) {
            console.error('[AppDetection] Error requesting permissions:', error);
            return false;
        }
    }

    /**
     * Ensure usage stats permissions are granted
     * @param showPrompt Whether to show a prompt to request permissions
     * @returns Promise<boolean> True if permissions are granted
     */
    private async ensurePermissions(showPrompt: boolean = true): Promise<boolean> {
        const permissions = await this.checkPermissions();
        
        if (!permissions.hasUsageStatsPermission && showPrompt) {
            return await this.requestPermissions();
        }
        
        return permissions.hasUsageStatsPermission;
    }

    async getInstalledApps(): Promise<AppInfo[]> {
        try {
            // Make sure we have necessary permissions
            if (Platform.OS === 'android') {
                const hasPermission = await this.ensurePermissions(false);
                if (!hasPermission) {
                    console.warn('[AppDetection] Missing usage stats permission for full functionality');
                    // Continue anyway, basic info will still work
                }
            } else if (Platform.OS === 'ios') {
                console.log('[AppDetection] iOS limits app detection due to privacy restrictions');
                console.log('[AppDetection] Using URL scheme method to detect common apps');
            }
            
            // Get installed apps
            console.log('[AppDetection] Requesting installed apps from native module');
            const apps = await AppDetection.getInstalledApps();
            
            // Log app detection status
            console.log(`[AppDetection] Get Installed Apps: ${apps.length > 0 ? '✅' : '❌'} (found ${apps.length} apps)`);
            
            if (apps.length > 0) {
                console.log('[AppDetection] Apps detected:', apps.map(app => app.name).join(', '));
                return apps;
            } else if (Platform.OS === 'ios') {
                console.log('[AppDetection] No apps detected on iOS, providing fallback list');
                
                // For iOS, we provide a minimal list of known system apps if no apps were detected
                // These are safe to assume exist on all iOS devices
                return [
                    {
                        id: 'safari://',
                        name: 'Safari',
                        category: 'utilities',
                        isRunning: true
                    },
                    {
                        id: 'photos-redirect://',
                        name: 'Photos',
                        category: 'utilities',
                        isRunning: true
                    },
                    {
                        id: 'mailto://',
                        name: 'Mail',
                        category: 'utilities',
                        isRunning: true
                    },
                    {
                        id: 'tel://',
                        name: 'Phone',
                        category: 'utilities',
                        isRunning: true
                    }
                ];
            }
            
            return apps;
        } catch (error) {
            console.error('[AppDetection] Error getting installed apps:', error);
            
            // Return fallback app list for iOS
            if (Platform.OS === 'ios') {
                console.warn('[AppDetection] Exception occurred, returning fallback app list for iOS');
                return [
                    {
                        id: 'safari://',
                        name: 'Safari',
                        category: 'utilities',
                        isRunning: true
                    },
                    {
                        id: 'photos-redirect://',
                        name: 'Photos',
                        category: 'utilities',
                        isRunning: true
                    }
                ];
            }
            
            throw this.handleError(error);
        }
    }

    async isAppInstalled(appId: string): Promise<boolean> {
        try {
            return await AppDetection.isAppInstalled(appId);
        } catch (error) {
            throw this.handleError(error);
        }
    }
    
    async isAppRunning(appId: string): Promise<boolean> {
        try {
            // On Android, we need usage stats permission
            if (Platform.OS === 'android') {
                const hasPermission = await this.ensurePermissions(false);
                if (!hasPermission) {
                    throw this.createError(AppDetectionErrorCodes.PERMISSION_DENIED);
                }
            }
            
            return await AppDetection.isAppRunning(appId);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getAppInfo(appId: string): Promise<AppInfo | null> {
        try {
            // Check first if we want extended info (requires permissions)
            if (Platform.OS === 'android') {
                const hasPermission = await this.ensurePermissions(false);
                if (!hasPermission) {
                    console.warn('[AppDetection] Missing usage stats permission for full app info');
                    // Continue anyway, basic info will still work
                }
            }
            
            return await AppDetection.getAppInfo(appId);
        } catch (error) {
            throw this.handleError(error);
        }
    }
    
    async startMonitoring(appIds: string | string[]): Promise<void> {
        try {
            // Android requires usage stats permission
            if (Platform.OS === 'android') {
                const hasPermission = await this.ensurePermissions(true);
                if (!hasPermission) {
                    throw this.createError(AppDetectionErrorCodes.PERMISSION_DENIED);
                }
            }
            
            const idsToMonitor = Array.isArray(appIds) ? appIds : [appIds];
            
            for (const appId of idsToMonitor) {
                await AppDetection.addAppToMonitor(appId);
            }
        } catch (error) {
            throw this.handleError(error);
        }
    }
    
    async stopMonitoring(appIds: string | string[]): Promise<void> {
        try {
            const idsToStop = Array.isArray(appIds) ? appIds : [appIds];
            
            for (const appId of idsToStop) {
                await AppDetection.removeAppFromMonitor(appId);
            }
        } catch (error) {
            throw this.handleError(error);
        }
    }
    
    async clearAllMonitoring(): Promise<void> {
        try {
            await AppDetection.clearMonitoredApps();
        } catch (error) {
            throw this.handleError(error);
        }
    }

    private handleError(error: any): AppDetectionError {
        console.error('[AppDetection] Error:', error);
        
        if (error instanceof Error) {
            if (error.message.includes('permission')) {
                return this.createError(AppDetectionErrorCodes.PERMISSION_DENIED, error.message);
            }
            
            if (error.message.includes('not found')) {
                return this.createError(AppDetectionErrorCodes.APP_NOT_FOUND, error.message);
            }
            
            return this.createError(AppDetectionErrorCodes.UNKNOWN_ERROR, error.message);
        }
        
        return this.createError(AppDetectionErrorCodes.UNKNOWN_ERROR);
    }

    private createError(code: string, message?: string): AppDetectionError {
        const error = new Error(message || this.getErrorMessage(code)) as AppDetectionError;
        error.code = code;
        return error;
    }

    private getErrorMessage(code: string): string {
        switch (code) {
            case AppDetectionErrorCodes.PERMISSION_DENIED:
                return 'Permission denied to access app information. Please grant usage access permission.';
            case AppDetectionErrorCodes.APP_NOT_FOUND:
                return 'Application not found';
            case AppDetectionErrorCodes.PLATFORM_NOT_SUPPORTED:
                return 'This platform is not supported';
            default:
                return 'An unknown error occurred';
        }
    }
}

export const appDetectionService = new AppDetectionServiceImpl(); 