[&#8592; Back to the main page](../README.md)

# Getting Started

This guide walks through how to get up and running with the AEP Expo SDK with only a few lines of code.

> [!IMPORTANT]
> This plugin is intended for developers who are building Expo apps from scratch and want to use the Adobe Experience Platform SDKs in their projects.

## Prerequisites

- [Node.js](https://nodejs.org/en/download/) v20.0.0 or later
- [npm](https://www.npmjs.com/get-npm) v7.0.0 or later
- [Expo CLI](https://docs.expo.dev/get-started/installation/) v4.0.17 or later
- [Xcode](https://developer.apple.com/xcode/) v15.0 or later
- [Swift](https://swift.org/download/) v5.0 or later
- [Android Studio](https://developer.android.com/studio) v4.0 or later
- [React Native](https://reactnative.dev/docs/environment-setup) v0.64.0 or later
- [Yarn](https://classic.yarnpkg.com/en/docs/install) v1.22.0 or later
- [CocoaPods](https://cocoapods.org/) v1.10.0 or later

## Features

This plugin provides the following features:

- **Adobe Experience Platform SDKs**: The plugin provides a wrapper around the Adobe Experience Platform React Native SDKs for Expo projects.
- **Configuration**: The plugin allows you to configure the SDKs using the `app.json` file.
- **No Native Code**: The plugin does not require you to write any native code to integrate the SDKs.
- **Uses Expo Native Modules**: The plugin uses Expo's native modules to integrate the SDKs with your application.
- **Easy to Use**: The plugin is easy to use and requires only a few lines of code to get started.

## Usage

**The Expo plugin takes care of adding or removing the native code and configuring the SDKs with the provided configuration. You will not need to write any native code to integrate the SDKs.**

### For new Expo projects

#### Installation

In you expo project, install the Adobe Experience Platform Expo plugin.

To install the plugin, run the following command:

```bash
npx expo install @adobe/aepsdk-expo-plugin
```

or

```bash
yarn add @adobe/aepsdk-expo-plugin
```

#### Install React Native SDKs

Please install the RN SDKs required in your application using this documentation: [Adobe Experience Platform React Native SDKs](https://github.com/adobe/aepsdk-react-native?tab=readme-ov-file#installation)

> [!IMPORTANT]
> The plugin requires React Native SDKs to be installed in your project in `dependencies` and not in `devDependencies`. If you have installed the SDKs in `devDependencies`, you need to move them to `dependencies`. The Expo plugin will not install the SDKs.


#### Configuration

In you application, open the expo's `app.json` file and modify the plugins section to include the Adobe Experience Platform SDK Expo plugin.

The plugin has the following configuration options:

- `environmentFileId`: The environment file ID from the Adobe Experience Platform Mobile Tag property value.
- `logLevel`: The log level for the SDK. The available options are `VERBOSE`, `DEBUG`, `INFO`, `WARNING`, `ERROR`, and `ASSERT`.
- `allowNativeChanges`: A boolean value to allow the plugin to make changes to the native code. The default value is `true`. Since it is expected that this plugin is used in new Expo projects. You can set this to `false` if you do not want the Plugin to make changes to the native code.

```json
{
  "expo": {
    "plugins": [
      [
        "@adobe/aepsdk-expo-plugin",
        {
          "environmentFileId": "YOUR_ENVIRONMENT_FILE_ID",
          "logLevel": "VERBOSE",
          "allowNativeChanges": true
        }
      ]
    ]
  }
}
```

Replace `YOUR_ENVIRONMENT_FILE_ID` with the environment file ID from the Adobe Experience Platform Mobile Tag property value.

### For Expo apps with expo plugin

If you have an existing Expo project and have already installed the Adobe Experience Platform Expo plugin and react native SDKs but you have not configured the SDKs, or made any changes to the native code, you can follow the steps below to configure the SDKs.

> You can skip any native code changes using `allowNativeChanges` configuration.

#### Configuration

In you application, open the expo's `app.json` file and modify the plugins section to include the Adobe Experience Platform SDK Expo plugin.

The plugin has the following configuration options:

- `environmentFileId`: The environment file ID from the Adobe Experience Platform Mobile Tag property value.
- `logLevel`: The log level for the SDK. The available options are `VERBOSE`, `DEBUG`, `INFO`, `WARNING`, `ERROR`, and `ASSERT`.
- `allowNativeChanges`: A boolean value to allow the plugin to make changes to the native code. The default value is `true`. Since it is expected that this plugin is used in new Expo projects. You can set this to `false` if you do not want the Plugin to make changes to the native code.
- `allowPodFileChanges`: A boolean value to allow the plugin to make changes to the Podfile. The default value is `true`. Since it is expected that this plugin is used in new Expo projects. You can set this to `false` if you do not want the Plugin to make changes to the Podfile.
- `allowBuildSettingsChanges`: A boolean value to allow the plugin to make changes to the build settings. The default value is `true`. Since it is expected that this plugin is used in new Expo projects. You can set this to `false` if you do not want the Plugin to make changes to the build settings.

```json
{
  "expo": {
    "plugins": [
      [
        "@adobe/aepsdk-expo-plugin",
        {
          "environmentFileId": "YOUR_ENVIRONMENT_FILE_ID",
          "logLevel": "VERBOSE",
          "allowNativeChanges": true,
          "allowPodFileChanges": true,
          "allowBuildSettingsChanges": true
        }
      ]
    ]
  }
}
```


## Building your app

Once you have completed the installation and configuration steps above, you can build your app using the following command:

```bash
npx expo prebuild
```
> [!IMPORTANT]
>You can also use `npx expo prebuild --clean` to clean the `ios` and `android` directories, but this will remove any changes you have made to the native code. So, use this command with caution.

In the build steps, Expo will take care of linking the native SDKs and initializing the SDKs with the provided configuration. You will not need to write any native code to integrate the SDKs.

## Running the app

To run iOS app run

  ```bash
  npx expo run:ios
  ```

To run Android app run

  ```bash
  npx expo run:android
  ```
