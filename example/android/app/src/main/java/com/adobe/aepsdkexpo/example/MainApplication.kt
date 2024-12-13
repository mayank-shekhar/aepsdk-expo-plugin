package com.adobe.aepsdkexpo.example;

// Adobe SDKs imports start
import com.adobe.marketing.mobile.Lifecycle
import com.adobe.marketing.mobile.Signal
import android.util.Log
import com.adobe.marketing.mobile.LoggingMode
import com.adobe.marketing.mobile.Assurance
import com.adobe.marketing.mobile.Edge
import com.adobe.marketing.mobile.edge.bridge.EdgeBridge
import com.adobe.marketing.mobile.edge.consent.Consent
import com.adobe.marketing.mobile.edge.identity.Identity
import com.adobe.marketing.mobile.Messaging
import com.adobe.marketing.mobile.optimize.Optimize
import com.adobe.marketing.mobile.Places
import com.adobe.marketing.mobile.UserProfile
import com.adobe.marketing.mobile.MobileCore
// Adobe SDKs imports end


import android.app.Application
import android.content.res.Configuration

import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.ReactHost
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader

import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ReactNativeHostWrapper

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost = ReactNativeHostWrapper(
        this,
        object : DefaultReactNativeHost(this) {
          override fun getPackages(): List<ReactPackage> {
            // Packages that cannot be autolinked yet can be added manually here, for example:
            // packages.add(new MyReactNativePackage());
            return PackageList(this).packages
          }

          override fun getJSMainModuleName(): String = ".expo/.virtual-metro-entry"

          override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

          override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
          override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }
  )

  override val reactHost: ReactHost
    get() = ReactNativeHostWrapper.createReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()

    MobileCore.setApplication(this);
    MobileCore.configureWithAppID("example");
    MobileCore.setLogLevel(LoggingMode.DEBUG);


    val extensions = listOf(Lifecycle.EXTENSION, Signal.EXTENSION, Assurance.EXTENSION, Edge.EXTENSION, EdgeBridge.EXTENSION, Consent.EXTENSION, Identity.EXTENSION, Messaging.EXTENSION, Optimize.EXTENSION, Places.EXTENSION, UserProfile.EXTENSION)
    MobileCore.registerExtensions(extensions) {
      // Use the extensions in your app
      Log.d("CoreExtensions", "Extensions registered successfully");
    }

    SoLoader.init(this, false)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }
    ApplicationLifecycleDispatcher.onApplicationCreate(this)
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
  }
}
