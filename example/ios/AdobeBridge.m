
#import "AdobeBridge.h"
#import "AppDelegate.h"
#import <UIKit/UIKit.h>

@implementation AdobeBridge
+ (void)configure: (UIApplicationState)appState
{
  [AEPMobileCore setLogLevel:AEPLogLevelDebug];
  NSArray *extensionsToRegister = @[AEPMobileIdentity.class, AEPMobileLifecycle.class, AEPMobileSignal.class, AEPMobileAssurance.class, AEPMobileEdge.class, AEPMobileEdgeBridge.class, AEPMobileEdgeConsent.class, AEPMobileEdgeIdentity.class, AEPMobileMessaging.class, AEPMobileOptimize.class, AEPMobilePlaces.class, AEPMobileUserProfile.class];
      [AEPMobileCore registerExtensions:extensionsToRegister completion:^{
        [AEPMobileCore configureWithAppId: @"example"];
        if (appState != UIApplicationStateBackground) {
            [AEPMobileCore lifecycleStart:@{@"": @""}];
        }
    }];
}
@end