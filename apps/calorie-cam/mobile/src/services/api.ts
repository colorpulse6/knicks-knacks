import { FoodAnalysisResult, FoodLog, FoodLogUpdateInput } from "../types";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { getDeviceUserId } from "../utils/deviceUser";

// Determine if we're running in development mode
const isDevelopment = __DEV__;

// API URL configuration
const apiUrlFromConfig = Constants.expoConfig?.extra?.apiUrl;

const API_URLS = {
  development: {
    android: "http://10.0.2.2:3000/api",
    ios: "http://localhost:3000/api",
  },
  production: "https://calorie-cam-production.up.railway.app/api",
};

// Determine the appropriate API URL based on environment and platform
const API_URL =
  typeof apiUrlFromConfig === "string" && apiUrlFromConfig.length > 0
    ? apiUrlFromConfig
    : isDevelopment
      ? Platform.OS === "android"
        ? API_URLS.development.android
        : API_URLS.development.ios
      : API_URLS.production;

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
    const userId = await getDeviceUserId();

    // Get filename from URI
    const uriParts = imageUri.split("/");
    const fileName = uriParts[uriParts.length - 1];

    // Append the image to the form data
    formData.append("image", {
      uri: imageUri,
      name: fileName,
      type: "image/jpeg",
    } as any);
    formData.append("userId", userId);

    // Send the request to the server
    const response = await fetch(`${API_URL}/upload-food-image`, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
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
export const getFoodLogs = async (): Promise<FoodLog[]> => {
  try {
    const userId = await getDeviceUserId();
    const response = await fetch(
      `${API_URL}/food-logs?userId=${encodeURIComponent(userId)}`
    );

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching food logs:", error);
    throw error;
  }
};

export const updateFoodLog = async (
  id: string,
  payload: FoodLogUpdateInput
): Promise<FoodLog> => {
  try {
    const userId = await getDeviceUserId();
    const response = await fetch(
      `${API_URL}/food-logs/${encodeURIComponent(id)}?userId=${encodeURIComponent(userId)}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      let errorDetails = `Server responded with status: ${response.status}`;
      try {
        const errorBody = await response.json();
        errorDetails = errorBody.error || errorBody.message || errorDetails;
      } catch {
        // Ignore non-JSON error bodies.
      }
      throw new Error(errorDetails);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating food log:", error);
    throw error;
  }
};

export const deleteFoodLog = async (id: string): Promise<{ message: string }> => {
  try {
    const userId = await getDeviceUserId();
    const response = await fetch(
      `${API_URL}/food-logs/${encodeURIComponent(id)}?userId=${encodeURIComponent(userId)}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      let errorDetails = `Server responded with status: ${response.status}`;
      try {
        const errorBody = await response.json();
        errorDetails = errorBody.error || errorBody.message || errorDetails;
      } catch {
        // Ignore non-JSON error bodies.
      }
      throw new Error(errorDetails);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting food log:", error);
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
    const userId = await getDeviceUserId();
    const response = await fetch(
      `${API_URL}/food-logs?userId=${encodeURIComponent(userId)}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      // Try to parse error message from server if possible
      let errorDetails = `Server responded with status: ${response.status}`;
      try {
        const errorBody = await response.json();
        errorDetails = errorBody.message || errorDetails;
      } catch {
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
