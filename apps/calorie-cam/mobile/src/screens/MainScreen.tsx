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
import { Camera, CameraType } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "@tanstack/react-query";
import { uploadFoodImage } from "../services/api";
import NutritionCard from "../components/NutritionCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { FoodAnalysisResult } from "../types";

const MainScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] =
    useState<FoodAnalysisResult | null>(null);
  const cameraRef = useRef<Camera>(null);

  // Request camera permission when component mounts
  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera. Please enable camera permissions.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>CalorieCam</Text>

      {!capturedImage ? (
        <View style={styles.cameraContainer}>
          <Camera style={styles.camera} type={CameraType.back} ref={cameraRef}>
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
            </View>
          </Camera>
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
            <NutritionCard result={analysisResult} />
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
});

export default MainScreen;
