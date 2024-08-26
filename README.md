# aepsdk-expo-plugin

Adobe Experience Platform SDK Expo Plugin

## About this project

This project is a wrapper around the Adobe Experience Platform React Native SDK for Expo projects. It is a work in progress and is not yet ready for production use.

This project assumes you have an expo app and are looking to integrate the Adobe Experience Platform SDK.

## Installation

```bash
npm install aepsdk-expo-plugin
```

### Install RN SDKs

Install the required React Native SDKs by following the instructions in the [Adobe Experience Platform SDK documentation](https://github.com/adobe/aepsdk-react-native/tree/main?tab=readme-ov-file#installation).

## Usage

In you application, open the expo's `app.json` file and add the following:

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

Once you have completed the installation and configuration steps, you can build your app using the following command:

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

## Development

To develop the plugin, clone the repository.

This repository is a monorepo that contains the plugin code and the example app.

### Plugin

To develop the plugin, navigate to the `plugin/` directory and run the following commands:

```bash
npm install
npm run build
```

The `build` command here watches the files and rebuilds the plugin when changes are made. You need to run this command in a separate terminal window.


To run the example app, navigate to the `example` directory and run the following commands:

```bash
npm install
npx expo prebuild
```

To run the app, run the following command:

```bash
npx expo run:ios
```

or

```bash
npx expo run:android
```

You can make changes in the `App.tsx` file in the example app to test the plugin. You can import the RN SDKs and use them in the example app.
