import { ExpoConfig } from "expo/config";

export default (): ExpoConfig => {
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
        experiments: {
            newArch: true, // Enable the New Architecture
        },
        assetBundlePatterns: ["**/*"],
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.your-org.leaf"
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            package: "com.your_org.leaf"
        },
        web: {
            favicon: "./assets/favicon.png"
        },
        extra: {
            apiUrl: process.env.EXPO_PUBLIC_API_URL,
            eas: {
                projectId: process.env.EAS_PROJECT_ID || "your-leaf-project-id",
            },
        },
        runtimeVersion: {
            policy: "appVersion",
        },
        updates: {
            url: "https://u.expo.dev/your-leaf-project-id",
        },
        doctor: {
            reactNativeDirectoryCheck: {
                listUnknownPackages: false
            }
        },
    };
};
