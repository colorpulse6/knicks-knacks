import React, { useState } from "react";
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
import { useCameraHandler } from "../hooks/useCameraHandler";
import { useMutationHandler } from "../hooks/useMutationHandler";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadFoodImage } from "../services/api";
import NutritionCard from "../components/NutritionCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { FoodAnalysisResult } from "../types";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { RootTabParamList } from "../../App";
import { useTheme } from "../hooks/useTheme";
import { CameraView } from "expo-camera"; // Import CameraView

type MainScreenProps = BottomTabScreenProps<RootTabParamList, "Camera">;

// Define query keys
const queryKeys = {
  foodLogs: ["foodLogs"],
};

const MainScreen: React.FC<MainScreenProps> = ({ navigation }) => {
  const { theme } = useTheme(); // Get the current theme
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);

  // Use camera handler hook
  const {
    capturedImage,
    setCapturedImage,
    cameraType,
    toggleCameraType,
    cameraRef,
    permission,
    requestPermission,
    takePicture,
    pickImage,
    reset: resetCamera,
  } = useCameraHandler((uri) => analysisMutation.mutate(uri));

  // Use mutation handler hook
  const analysisMutation = useMutationHandler((data) => {
    setAnalysisResult(data);
    // Invalidate the food logs query to trigger a refetch on the history screen
    // Removed useQueryClient and invalidateQueries here, as it is handled in useMutationHandler
  });

  // Reset the state to take another picture
  const reset = () => {
    resetCamera();
    setAnalysisResult(null);
  };

  // View history after analysis
  const viewHistory = () => {
    navigation.navigate("History");
  };

  // Check permission status from the hook
  if (!permission) {
    // Permissions are still loading
    return (
      <View
        style={[styles.container, theme === "dark" && styles.containerDark]}
      >
        <ActivityIndicator
          size="large"
          color={theme === "dark" ? "#c7d2fe" : "#4f46e5"}
        />
      </View>
    );
  }

  if (!permission.granted) {
    // Permissions are not granted yet
    return (
      <View
        style={[styles.container, theme === "dark" && styles.containerDark]}
      >
        <Text
          style={[
            styles.permissionText,
            theme === "dark" && styles.permissionTextDark,
          ]}
        >
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
    <SafeAreaView
      style={[styles.container, theme === "dark" && styles.containerDark]}
    >
      <Text style={[styles.title, theme === "dark" && styles.titleDark]}>
        CalorieCam
      </Text>

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
        <ScrollView
          style={[
            styles.resultContainer,
            theme === "dark" && styles.resultContainerDark,
          ]}
        >
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />

          {analysisMutation.isPending ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={theme === "dark" ? "#c7d2fe" : "#4f46e5"}
              />
              <Text
                style={[
                  styles.loadingText,
                  theme === "dark" && styles.loadingTextDark,
                ]}
              >
                Analyzing your food...
              </Text>
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
  containerDark: {
    backgroundColor: "#111827",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
    color: "#4f46e5",
  },
  titleDark: {
    color: "#c7d2fe",
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
    backgroundColor: "#f9fafb",
  },
  resultContainerDark: {
    backgroundColor: "#111827",
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
  loadingTextDark: {
    color: "#c7d2fe",
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
  permissionTextDark: {
    color: "#f9fafb",
  },
  permissionButton: {
    backgroundColor: "#4f46e5",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
});

export default MainScreen;
