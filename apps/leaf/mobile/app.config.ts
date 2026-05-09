import { ExpoConfig } from "expo/config";

export default (): ExpoConfig => {
    const easProjectId = process.env.EAS_PROJECT_ID;

    return {
        name: "Leaf",
        slug: "leaf",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "light",
        splash: {
            image: "./assets/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        newArchEnabled: true,
        assetBundlePatterns: ["**/*"],
        ios: {
            supportsTablet: true,
            bundleIdentifier: process.env.EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            package: process.env.EXPO_PUBLIC_ANDROID_PACKAGE
        },
        web: {
            favicon: "./assets/favicon.png"
        },
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
