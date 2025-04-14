import ExpoModulesCore

public class AppDetectionModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('AppDetection')` in JavaScript.
    Name("AppDetection")

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
    Constants([
      "PI": Double.pi
    ])

    // Defines event names that the module can send to JavaScript.
    Events("onChange", "onAppsDetected", "onAppStateChange")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      return "Hello world! 👋"
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { (value: String) in
      // Send an event to JavaScript.
      self.sendEvent("onChange", [
        "value": value
      ])
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of the
    // view definition: Prop, Events.
    View(AppDetectionView.self) {
      // Defines a setter for the `url` prop.
      @Prop
      @objc
      var url: String? {
        set {
          // Remove webView access since it's not part of AppDetectionView
        }
        get {
          return nil
        }
      }

      Events("onLoad", "onAppsDetected", "onAppStateChange", "onError")
    }

    Function("getInstalledApps") { () -> [[String: Any]] in
      // iOS doesn't provide direct access to all installed apps
      // Instead, we'll check for common apps using URL schemes
      let commonAppSchemes: [String: String] = [
        "fb": "Facebook",
        "instagram": "Instagram",
        "twitter": "Twitter", 
        "slack": "Slack",
        "sms": "Messages",
        "safari": "Safari",
        "googlechrome": "Chrome",
        "googlegmail": "Gmail",
        "snapchat": "Snapchat",
        "tiktok": "TikTok",
        "whatsapp": "WhatsApp",
        "nflx": "Netflix",
        "spotify": "Spotify",
        "youtube": "YouTube",
        "maps": "Maps",
        "facetime": "FaceTime",
        "tel": "Phone",
        "mailto": "Mail",
        "photos-redirect": "Photos",
        "music": "Apple Music",
        "itms-apps": "App Store"
      ]
      
      var installedApps: [[String: Any]] = []
      
      // Log that we're checking for installed apps - helpful for debugging
      NSLog("AppDetection: Checking for installed apps via URL schemes on iOS")
      
      for (scheme, appName) in commonAppSchemes {
        // Create a properly formatted URL with the scheme
        let urlString = "\(scheme)://"
        if let url = URL(string: urlString) {
          let canOpen = UIApplication.shared.canOpenURL(url)
          NSLog("AppDetection: Checking scheme %@ - Can open: %@", urlString, canOpen ? "YES" : "NO")
          
          if canOpen {
            let category = self.getCategoryFromId(scheme) ?? "other"
            installedApps.append([
              "id": urlString,
              "name": appName,
              "category": category,
              "isRunning": true, // Best approximation on iOS
              "installed": true
            ])
          }
        } else {
          NSLog("AppDetection: Invalid URL scheme format: %@", urlString)
        }
      }
      
      NSLog("AppDetection: Found %d installed apps", installedApps.count)
      
      // If no apps were detected, provide system apps that must be available
      if installedApps.isEmpty {
        NSLog("AppDetection: No apps detected, adding default iOS system apps")
        installedApps.append([
          "id": "safari://",
          "name": "Safari",
          "category": "utilities",
          "isRunning": true,
          "installed": true
        ])
        installedApps.append([
          "id": "mailto://",
          "name": "Mail",
          "category": "utilities",
          "isRunning": true,
          "installed": true
        ])
      }
      
      return installedApps
    }

    AsyncFunction("isAppInstalled") { (appId: String) -> Bool in
      if let url = URL(string: appId) {
        return UIApplication.shared.canOpenURL(url)
      }
      return false
    }
    
    AsyncFunction("isAppRunning") { (appId: String) -> Bool in
      // iOS doesn't provide a way to check if an app is running
      // We'll just check if it's installed as that's the best we can do
      if let url = URL(string: appId) {
        return UIApplication.shared.canOpenURL(url)
      }
      return false
    }

    AsyncFunction("getAppInfo") { (appId: String) -> [String: Any]? in
      if let url = URL(string: appId),
         UIApplication.shared.canOpenURL(url) {
        // Get app info by URL scheme
        // iOS doesn't provide app name access, so we'll use a mapping for common apps
        let appName = self.getAppNameFromId(appId) ?? appId
        let category = self.getCategoryFromId(appId) ?? "other"
        
        return [
          "id": appId,
          "name": appName,
          "installed": true,
          "isRunning": true, // Best estimate on iOS
          "category": category
        ]
      }
      return nil
    }
    
    // Functions to add/remove apps from monitoring
    Function("addAppToMonitor") { (appId: String) in
      if let view = self.view as? AppDetectionView {
        view.addAppToMonitor(appId)
      }
    }
    
    Function("removeAppFromMonitor") { (appId: String) in
      if let view = self.view as? AppDetectionView {
        view.removeAppFromMonitor(appId)
      }
    }
    
    Function("clearMonitoredApps") {
      if let view = self.view as? AppDetectionView {
        view.clearMonitoredApps()
      }
    }
    
    // Add check permissions function
    Function("checkPermissions") { () -> [String: Bool] in
      // iOS doesn't need usage stats permission like Android
      // Return success by default since iOS URL scheme detection doesn't need special permissions
      return ["hasUsageStatsPermission": true]
    }
  }

  // Helper method to get app names for common apps
  private func getAppNameFromId(_ appId: String) -> String? {
    let appNames: [String: String] = [
      "fb": "Facebook",
      "instagram": "Instagram",
      "twitter": "Twitter", 
      "slack": "Slack",
      "sms": "Messages",
      "safari": "Safari",
      "googlechrome": "Chrome",
      "googlegmail": "Gmail",
      "snapchat": "Snapchat",
      "tiktok": "TikTok",
      "whatsapp": "WhatsApp",
      "nflx": "Netflix",
      "spotify": "Spotify",
      "com.facebook.Facebook": "Facebook",
      "com.instagram.Instagram": "Instagram",
      "com.atebits.Tweetie2": "Twitter",
      "com.apple.MobileSMS": "Messages",
      "com.apple.mobilesafari": "Safari"
    ]
    
    // Try to match directly
    if let name = appNames[appId] {
      return name
    }
    
    // If we have a URL scheme with ://, try to match without it
    if appId.contains("://") {
      let scheme = appId.components(separatedBy: "://")[0]
      return appNames[scheme]
    }
    
    return nil
  }
  
  // Helper method to categorize apps
  private func getCategoryFromId(_ appId: String) -> String? {
    let lowerAppId = appId.lowercased()
    
    if lowerAppId.contains("facebook") || lowerAppId.contains("instagram") || 
       lowerAppId.contains("twitter") || lowerAppId.contains("snap") || 
       lowerAppId.contains("tiktok") || lowerAppId.contains("whatsapp") {
      return "social"
    } else if lowerAppId.contains("netflix") || lowerAppId.contains("youtube") || 
              lowerAppId.contains("spotify") || lowerAppId.contains("music") {
      return "entertainment"
    } else if lowerAppId.contains("game") {
      return "games"
    } else if lowerAppId.contains("office") || lowerAppId.contains("docs") || 
              lowerAppId.contains("word") || lowerAppId.contains("excel") {
      return "productivity"
    }
    
    return "other"
  }
}
