import { useState, useRef } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { CameraView, useCameraPermissions } from "expo-camera";

export function useCameraHandler(onImageSelected: (uri: string) => void) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraType, setCameraType] = useState<"front" | "back">("back");
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const handleError = (message: string, error: any) => {
    console.error(message, error);
    Alert.alert("Error", message);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await (cameraRef.current as any).takePictureAsync();
        setCapturedImage(photo.uri);
        onImageSelected(photo.uri);
      } catch (error) {
        handleError("Failed to take picture. Please try again.", error);
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0].uri;
        setCapturedImage(selectedImage);
        onImageSelected(selectedImage);
      }
    } catch (error) {
      handleError("Failed to pick an image. Please try again.", error);
    }
  };

  const toggleCameraType = () => {
    setCameraType(cameraType === "back" ? "front" : "back");
  };

  const reset = () => {
    setCapturedImage(null);
  };

  return {
    capturedImage,
    setCapturedImage,
    cameraType,
    toggleCameraType,
    cameraRef,
    permission,
    requestPermission,
    takePicture,
    pickImage,
    reset,
  };
}
