[&#8592; Back to the main page](../README.md)

# Getting Started

This guide walks through how to get up and running with the AEP Expo SDK with only a few lines of code.

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

## Installing the plugin

To install the plugin, run the following command:

```bash
npx expo install aepsdk-expo-plugin
```

or

```bash
yarn add aepsdk-expo-plugin
```

> [!IMPORTANT]
> The plugin requires React Native SDKs to be installed in your project in `dependencies` and not in `devDependencies`. If you have installed the SDKs in `devDependencies`, you need to move them to `dependencies`. The Expo plugin will not install the SDKs.


## Usage

In you application, open the expo's `app.json` file and modify the plugins section to include the Adobe Experience Platform SDK plugin.

The plugin has the following configuration options:

- `environmentFileId`: The environment file ID from the Adobe Experience Platform Mobile Tag property value.
- `logLevel`: The log level for the SDK. The available options are `VERBOSE`, `DEBUG`, `INFO`, `WARNING`, `ERROR`, and `ASSERT`.

```json
{
  "expo": {
    "plugins": [
      [
        "aepsdk-expo-plugin",
        {
          "environmentFileId": "YOUR_ENVIRONMENT_FILE_ID",
          "logLevel": "VERBOSE"
        }
      ]
    ]
  }
}
```

Replace `YOUR_ENVIRONMENT_FILE_ID` with the environment file ID from the Adobe Experience Platform Mobile Tag property value.

## Building your app

Once you have completed the installation and configuration steps above, you can build your app using the following command:

```bash
npx expo prebuild
```

You can also build using `npx expo prebuild --clean` to clean the build cache.

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
