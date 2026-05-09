import { ExpoConfig } from "expo/config";

export default (): ExpoConfig => {
  const easProjectId = process.env.EAS_PROJECT_ID;

  return {
    name: "CalorieCam",
    slug: "calorie-cam",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    experiments: {},
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: process.env.EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      blockedPermissions: ["android.permission.RECORD_AUDIO"],
      package: process.env.EXPO_PUBLIC_ANDROID_PACKAGE,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      [
        "expo-camera",
        {
          cameraPermission:
            "Allow CalorieCam to access your camera to take photos of food for analysis.",
          recordAudioAndroid: false,
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission:
            "Allow CalorieCam to access your photos to select images of food for analysis.",
        },
      ],
      "expo-font",
    ],
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      eas: {
        projectId: easProjectId,
      },
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    ...(easProjectId
      ? { updates: { url: `https://u.expo.dev/${easProjectId}` } }
      : {}),
  };
};
