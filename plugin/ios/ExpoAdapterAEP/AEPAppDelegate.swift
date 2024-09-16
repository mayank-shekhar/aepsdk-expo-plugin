import AEPCore
import AEPLifecycle
import AEPSignal
import AEPEdge
import AEPEdgeIdentity
import AEPMessaging
import ExpoModulesCore
import SystemConfiguration

public class AEPAppDelegate: ExpoAppDelegateSubscriber {
  public func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {

    //  Read the infoDictionary to get environment file id
    let plistDict = Bundle.main.infoDictionary

    if let plist = plistDict, let plistConfig = plist["AEPSDK"] as? [String: Any], let environmentFileId = plistConfig["environmentFileId"] as? String, let logLevel = plistConfig["logLevel"] as? String {


        //  Set the log level
      if logLevel == "DEBUG" {
          MobileCore.setLogLevel(.debug)
      } else if logLevel == "ERROR" {
          MobileCore.setLogLevel(.error)
      } else if logLevel == "WARNING" {
          MobileCore.setLogLevel(.warning)
      } else if logLevel == "TRACE" {
          MobileCore.setLogLevel(.trace)
      } else {
          MobileCore.setLogLevel(.error)
      }

      //  Register the extensions
      MobileCore.registerExtensions([Lifecycle.self, Identity.self, Signal.self, Edge.self, Messaging.self], {

        MobileCore.configureWith(appId: environmentFileId)


        if application.applicationState != .background {
          // Only start lifecycle if the application is not in the background
          MobileCore.lifecycleStart(additionalContextData: ["contextDataKey": "contextDataVal"])
        }
      })
    }
    return true
  }
}
