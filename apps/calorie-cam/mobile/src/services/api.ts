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
    physical: "http://192.168.2.106:3000/api", // Update this with your actual IP
  },
  // Production endpoint
  production: "https://calorie-cam-production.up.railway.app/api",
};

// Determine the appropriate API URL based on environment and platform
let API_URL: string;
if (isDevelopment) {
  // Check if running in Expo Go ('storeClient') or as a standalone build
  const isExpoGoOrStandalone =
    Constants.executionEnvironment === "storeClient" ||
    Constants.executionEnvironment === "standalone";

  // Determine if it's likely a physical device environment
  // This includes Expo Go, standalone builds, or cases where executionEnvironment might be undefined
  const isPhysicalDeviceEnvironment =
    isExpoGoOrStandalone || !Constants.executionEnvironment; // Fallback for older versions or edge cases

  if (isPhysicalDeviceEnvironment) {
    // Use the local network IP for physical devices (including Expo Go)
    API_URL = API_URLS.development.physical;
  } else {
    // Otherwise, assume simulator/emulator and use platform-specific localhost address
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
  } mode on ${Platform.OS}, env: ${Constants.executionEnvironment})` // Added env for debugging
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

/**
 * Fetches the food logs from the API
 * @returns Array of food log entries
 */
export const getFoodLogs = async () => {
  try {
    const response = await fetch(`${API_URL}/food-logs`);

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching food logs:", error);
    throw error;
  }
};

/**
 * Clears all food logs.
 * Assumes DELETE /api/food-logs endpoint exists on the server.
 * @returns Success message or relevant data from the server
 */
export const clearFoodLogs = async (): Promise<{ message: string }> => {
  try {
    // TODO: Add authentication headers if needed
    const response = await fetch(`${API_URL}/food-logs`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        // 'Authorization': `Bearer YOUR_TOKEN_HERE` // If auth is needed
      },
    });

    if (!response.ok) {
      // Try to parse error message from server if possible
      let errorDetails = `Server responded with status: ${response.status}`;
      try {
        const errorBody = await response.json();
        errorDetails = errorBody.message || errorDetails;
      } catch (parseError) {
        // Ignore if response body is not JSON
      }
      throw new Error(errorDetails);
    }

    // Handle successful response (e.g., 204 No Content or a success message)
    if (response.status === 204) {
      return { message: "History cleared successfully." };
    }
    // If server sends a JSON body on success:
    // return await response.json();
    return { message: "History cleared successfully." }; // Default success
  } catch (error) {
    console.error("Error clearing food logs:", error);
    throw error; // Re-throw to be caught by the mutation's onError
  }
};
