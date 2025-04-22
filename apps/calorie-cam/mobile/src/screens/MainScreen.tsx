import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "@tanstack/react-query";
import { uploadFoodImage } from "../services/api";
import NutritionCard from "../components/NutritionCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { FoodAnalysisResult } from "../types";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { RootTabParamList } from "../../App";

type MainScreenProps = BottomTabScreenProps<RootTabParamList, "Camera">;

const MainScreen: React.FC<MainScreenProps> = ({ navigation }) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] =
    useState<FoodAnalysisResult | null>(null);
  const [cameraType, setCameraType] = useState<"front" | "back">("back");
  const cameraRef = useRef(null);

  // Use the permissions hook
  const [permission, requestPermission] = useCameraPermissions();

  // Handle image upload and analysis
  const analysisMutation = useMutation({
    mutationFn: uploadFoodImage,
    onSuccess: (data) => {
      setAnalysisResult(data);
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        "Failed to analyze the food image. Please try again."
      );
      console.error("Analysis error:", error);
    },
  });

  // Take picture with camera
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        // @ts-ignore - Ignoring TypeScript errors for the camera ref
        const photo = await cameraRef.current.takePictureAsync();
        setCapturedImage(photo.uri);
        analysisMutation.mutate(photo.uri);
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert("Error", "Failed to take picture. Please try again.");
      }
    }
  };

  // Pick image from gallery
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
        analysisMutation.mutate(selectedImage);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick an image. Please try again.");
    }
  };

  // Reset the state to take another picture
  const reset = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
  };

  // Toggle camera type (front/back)
  const toggleCameraType = () => {
    setCameraType(cameraType === "back" ? "front" : "back");
  };

  // View history after analysis
  const viewHistory = () => {
    navigation.navigate("History");
  };

  // Check permission status from the hook
  if (!permission) {
    // Permissions are still loading
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (!permission.granted) {
    // Permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>CalorieCam</Text>

      {!capturedImage ? (
        <View style={styles.cameraContainer}>
          <CameraView style={styles.camera} facing={cameraType} ref={cameraRef}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={pickImage}>
                <Text style={styles.buttonText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.captureButton]}
                onPress={takePicture}
              >
                <Text style={styles.buttonText}>Capture</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={toggleCameraType}
              >
                <Text style={styles.buttonText}>Flip</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      ) : (
        <ScrollView style={styles.resultContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />

          {analysisMutation.isPending ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4f46e5" />
              <Text style={styles.loadingText}>Analyzing your food...</Text>
            </View>
          ) : analysisMutation.isSuccess && analysisResult ? (
            <>
              <NutritionCard result={analysisResult} />
              <TouchableOpacity
                style={styles.historyButton}
                onPress={viewHistory}
              >
                <Text style={styles.buttonText}>View History</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.errorText}>
              Something went wrong with the analysis.
            </Text>
          )}

          <TouchableOpacity style={styles.resetButton} onPress={reset}>
            <Text style={styles.resetButtonText}>Take Another Photo</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
    color: "#4f46e5",
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    margin: 16,
  },
  camera: {
    flex: 1,
    justifyContent: "flex-end",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  button: {
    backgroundColor: "#4f46e5",
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: 100,
  },
  captureButton: {
    backgroundColor: "#14b8a6",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  previewImage: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
  },
  resultContainer: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4f46e5",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
  resetButton: {
    backgroundColor: "#f59e0b",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 20,
  },
  resetButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  historyButton: {
    backgroundColor: "#4f46e5",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  permissionText: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
    color: "#111827",
  },
  permissionButton: {
    backgroundColor: "#4f46e5",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
});

export default MainScreen;
