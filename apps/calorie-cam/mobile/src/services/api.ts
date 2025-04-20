import { FoodAnalysisResult } from "../types";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Determine if we're running in development mode
const isDevelopment = __DEV__;

// API URL configuration
const API_URLS = {
  // For simulator/emulator, use localhost
  development: {
    // Android emulator needs 10.0.2.2 to access host machine's localhost
    android: "http://10.0.2.2:3000/api",
    // iOS simulator can use localhost directly
    ios: "http://localhost:3000/api",
    // For physical devices in development, use your computer's local IP address
    // Replace with your actual local IP address when testing on physical devices
    physical: "http://192.168.1.X:3000/api", // Update this with your actual IP
  },
  // Production endpoint
  production: "https://calorie-cam-production.up.railway.app/api",
};

// Determine the appropriate API URL based on environment and platform
let API_URL: string;
if (isDevelopment) {
  // When running on a physical device, use the physical device URL
  const isPhysicalDevice =
    !Constants.executionEnvironment ||
    Constants.executionEnvironment === "standalone";

  if (isPhysicalDevice) {
    API_URL = API_URLS.development.physical;
  } else {
    // When in simulator/emulator, use the appropriate platform-specific URL
    API_URL =
      Platform.OS === "android"
        ? API_URLS.development.android
        : API_URLS.development.ios;
  }
} else {
  // In production, always use the production URL
  API_URL = API_URLS.production;
}

console.log(
  `Using API URL: ${API_URL} (${
    isDevelopment ? "development" : "production"
  } mode on ${Platform.OS})`
);

/**
 * Uploads a food image for analysis
 * @param imageUri The local URI of the image to upload
 * @returns The analysis result from the server
 */
export const uploadFoodImage = async (
  imageUri: string
): Promise<FoodAnalysisResult> => {
  try {
    // Create form data for the image
    const formData = new FormData();

    // Get filename from URI
    const uriParts = imageUri.split("/");
    const fileName = uriParts[uriParts.length - 1];

    // Append the image to the form data
    formData.append("image", {
      uri: imageUri,
      name: fileName,
      type: "image/jpeg",
    } as any);

    // Send the request to the server
    const response = await fetch(`${API_URL}/upload-food-image`, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
