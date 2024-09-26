# @adobe/aepsdk-expo-plugin

Adobe Experience Platform SDK Expo Plugin

## About this project

This project is a wrapper around the Adobe Experience Platform React Native SDKs for Expo projects.

## Who should use this plugin?

**This plugin is intended for developers who are building Expo project from scratch and want to use the Adobe Experience Platform SDKs in their projects.**

If you already have an existing Expo project and have already installed the Adobe Experience Platform RN SDKs, you should not use this plugin.

If you have a bare React Native project, you should not use this plugin. You can see this [guide](https://github.com/adobe/aepsdk-react-native?tab=readme-ov-file#installation) for more information on how to install the Adobe Experience Platform SDKs in a bare React Native project.

### What's supported?

  - This plugin is meant for Expo projects only.
  - This plugin is meant for developers who are building Expo project from scratch and want to use the Adobe Experience Platform SDKs in their projects.
  - You don't need to install this plugin if you have an Expo app or a Bare React Native app and have already integrated with the Adobe Experience Platform RN SDKs.
  - This expo plugin supports Kotlin and Objective C only.

#### Want to migrate your Bare React Native project to Expo?

If you have a Bare React Native project and want to migrate to Expo, you can follow this official [guide](https://docs.expo.dev/bare/using-expo-cli/).

We also have a [guide](https://github.com/adobe/aepsdk-react-native/blob/main/docs/expo.md) on how to migrate your Bare React Native project with our React Native SDKs to Expo.

## Getting Started

This document walks you through how to get up and running with the AEP Expo SDK with only a few lines of code.

> [!IMPORTANT]
> This plugin is intended for developers who are building Expo apps from scratch and want to use the Adobe Experience Platform SDKs in their projects.

### Installation

In your expo project, install the Adobe Experience Platform Expo plugin.

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


### Configuration

In you application, open the expo's `app.json` file and modify the plugins section to include the Adobe Experience Platform SDK Expo plugin.

```json
{
  "expo": {
    "plugins": [
      [
        "@adobe/aepsdk-expo-plugin",
        {
          "environmentFileId": "YOUR_ENVIRONMENT_FILE_ID",
          "logLevel": "VERBOSE"
        }
      ]
    ]
  }
}
```
You can see the full list of configuration options [here](./docs/getting-started.md#configuration-options)


### Building your app

Once you have completed the installation and configuration steps above, you can build your app using the following command:

```bash
npx expo prebuild
```

Run the pod install for `iOS`

```bash
npx pod-install
```

In the build steps, Expo will take care of linking the native SDKs and initializing the SDKs with the provided configuration. You will not need to write any native code to integrate the SDKs.

For more information on how to get started with this project, see the [getting started guide](./docs/getting-started.md).






## Development

See the [development guide](./docs/development.md) for more information on how to develop this project.


## Contributing

Contributions are welcome! See the [contributing guide](./CONTRIBUTING.md) for more information on how to contribute to this project.


## License

This project is licensed under the Apache V2 License. See [LICENSE](./LICENSE) for more information.
