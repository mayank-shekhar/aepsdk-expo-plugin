[&#8592; Back to the main page](../README.md)

# Development

## Requirements

- Node.js v20.0.0 or later
- npm v7.0.0 or later
- Expo CLI v4.0.17 or later
- Xcode v15.0 or later
- Swift v5.0 or later
- Android Studio
- React Native v0.64.0 or later
- Yarn v1.22.0 or later
- CocoaPods v1.10.0 or later

## Getting Started

1. Clone the repository:

  ```bash
    git clone
  ```

2. Navigate to the `plugin/` directory and run the following commands:

  ```bash
    yarn install
    yarn build
  ```

3. Navigate to the `example/` directory and run the following commands in another terminal window:

  ```bash
    yarn install
    npx expo prebuild
  ```

4. To run the app, run the following command:

  ```bash
    npx expo run:ios
  ```

  or

  ```bash
    npx expo run:android
  ```

## Configurations

The plugin can be configured using the `app.json` file in the `example/` directory. The configuration options are as follows:

```json
{
  "plugins": [
    [
      "aepsdk-expo-plugin",
      {
        "environmentFileId": "development",
        "logLevel": "DEBUG",
      }
    ]
  ]
}
```

Replace `development` with the environment file ID from the Adobe Experience Platform Mobile Tag property value.

The config plugin allows you to set the following options:

- `environmentFileId`: The environment file ID from the Adobe Experience Platform Mobile Tag property value.
- `logLevel`: The log level for the plugin. The available options are `VERBOSE`, `DEBUG`, `INFO`, `WARNING`, and `ERROR`.
