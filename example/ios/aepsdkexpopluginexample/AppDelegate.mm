#import "AppDelegate.h"
//Added by Adobe Expo SDK Plugin
@import AEPCore
@import AEPLifecycle
@import AEPSignal
@import AEPServices
@import AEPIdentity
@import AEPEdge
@import AEPMessaging

#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"main";

  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};
  MobileCore.setLogLevel(.debug)

    // Added by Adobe Expo SDK Plugin
    MobileCore.registerExtensions([Identity.self, Lifecycle.self, Signal.self, Edge.self, Messaging.self]) {
        // Use the extensions in your app
        MobileCore.registerWith(appId: "example")
        print("Extensions registered successfully")

        if application.applicationState != .background {
          // Only start lifecycle if the application is not in the background
          MobileCore.lifecycleStart(additionalContextData: ["contextDataKey": "contextDataVal"])
        }
    }
    

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@".expo/.virtual-metro-entry"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// Linking API
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  return [super application:application openURL:url options:options] || [RCTLinkingManager application:application openURL:url options:options];
}

// Universal Links
- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler {
  BOOL result = [RCTLinkingManager application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
  return [super application:application continueUserActivity:userActivity restorationHandler:restorationHandler] || result;
}

// Explicitly define remote notification delegates to ensure compatibility with some third-party libraries
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  return [super application:application didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

// Explicitly define remote notification delegates to ensure compatibility with some third-party libraries
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  return [super application:application didFailToRegisterForRemoteNotificationsWithError:error];
}

// Explicitly define remote notification delegates to ensure compatibility with some third-party libraries
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  return [super application:application didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}

@end
