import { FoodAnalysisResult } from "../types";

// API URL - In a real app, this would come from environment variables
const API_URL = "http://localhost:3000/api";

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
