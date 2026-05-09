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
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCameraHandler } from "../hooks/useCameraHandler";
import { useMutationHandler } from "../hooks/useMutationHandler";
import NutritionCard from "../components/NutritionCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { FoodAnalysisResult, FoodLogUpdateInput } from "../types";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { RootTabParamList } from "../App";
import { useTheme } from "../hooks/useTheme";
import { CameraView } from "expo-camera"; // Import CameraView
import { updateFoodLog } from "../services/api";

type MainScreenProps = BottomTabScreenProps<RootTabParamList, "Camera">;

const MainScreen: React.FC<MainScreenProps> = ({ navigation }) => {
  const { theme } = useTheme(); // Get the current theme
  const isDark = theme === "dark";
  const queryClient = useQueryClient();
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);

  // Use camera handler hook
  const {
    capturedImage,
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

  const updateResultMutation = useMutation({
    mutationFn: async (payload: FoodLogUpdateInput) => {
      const logId = analysisResult?.log?.id;

      if (!logId) {
        throw new Error("No saved food log is available to update.");
      }

      return updateFoodLog(logId, payload);
    },
    onSuccess: (updatedLog) => {
      setAnalysisResult((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          imageUrl: updatedLog.image_url || current.imageUrl,
          log: updatedLog,
          data: {
            ...current.data,
            foodName: updatedLog.food_name,
            calories: updatedLog.calories,
            proteins: updatedLog.proteins,
            fats: updatedLog.fats,
            carbs: updatedLog.carbs,
          },
        };
      });
      queryClient.invalidateQueries({ queryKey: ["foodLogs"] });
    },
    onError: (error: Error) => {
      Alert.alert("Update failed", error.message || "Unable to update the food log.");
    },
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
        style={[styles.container, isDark && styles.containerDark]}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? "#ffa387" : "#ef6f4d"}
        />
      </View>
    );
  }

  if (!permission.granted) {
    // Permissions are not granted yet
    return (
      <View
        style={[styles.container, isDark && styles.containerDark]}
      >
        <Text
          style={[
            styles.permissionText,
            isDark && styles.permissionTextDark,
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
      style={[styles.container, isDark && styles.containerDark]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.eyebrow, isDark && styles.eyebrowDark]}>
            CalorieCam
          </Text>
          <Text style={[styles.title, isDark && styles.titleDark]}>
            Camera
          </Text>
        </View>
        <TouchableOpacity
          accessibilityLabel="View history"
          style={[styles.headerButton, isDark && styles.headerButtonDark]}
          onPress={viewHistory}
        >
          <Ionicons name="list-outline" size={22} color={isDark ? "#f8fafc" : "#171923"} />
        </TouchableOpacity>
      </View>

      {!capturedImage ? (
        <View style={styles.cameraContainer}>
          <CameraView style={styles.camera} facing={cameraType} ref={cameraRef}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={pickImage}>
                <Ionicons name="images-outline" size={18} color="#171923" />
                <Text style={styles.secondaryActionText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.captureButton]}
                onPress={takePicture}
              >
                <Ionicons name="camera" size={20} color="#ffffff" />
                <Text style={styles.buttonText}>Capture</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={toggleCameraType}
              >
                <Ionicons name="sync-outline" size={18} color="#171923" />
                <Text style={styles.secondaryActionText}>Flip</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      ) : (
        <ScrollView
          style={[
            styles.resultContainer,
            isDark && styles.resultContainerDark,
          ]}
        >
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />

          {analysisMutation.isPending ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={isDark ? "#ffa387" : "#ef6f4d"}
              />
              <Text
                style={[
                  styles.loadingText,
                  isDark && styles.loadingTextDark,
                ]}
              >
                Analyzing your food...
              </Text>
            </View>
          ) : analysisMutation.isSuccess && analysisResult ? (
            <>
              <NutritionCard
                result={analysisResult}
                editable={Boolean(analysisResult.log)}
                isSaving={updateResultMutation.isPending}
                onSave={(payload) => updateResultMutation.mutateAsync(payload)}
              />
              <TouchableOpacity
                style={styles.historyButton}
                onPress={viewHistory}
              >
                <Ionicons name="list-outline" size={18} color="#ffffff" />
                <Text style={styles.buttonText}>View History</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.errorText}>
              Something went wrong with the analysis.
            </Text>
          )}

          <TouchableOpacity style={styles.resetButton} onPress={reset}>
            <Ionicons name="camera-outline" size={18} color="#171923" />
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
    backgroundColor: "#f7f3ed",
  },
  containerDark: {
    backgroundColor: "#10131b",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
  },
  eyebrow: {
    color: "#ef6f4d",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  eyebrowDark: {
    color: "#ffa387",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#171923",
  },
  titleDark: {
    color: "#f8fafc",
  },
  headerButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#e7e1d8",
    borderRadius: 999,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  headerButtonDark: {
    backgroundColor: "#171923",
    borderColor: "#2d3340",
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
    marginHorizontal: 18,
    marginBottom: 18,
    borderColor: "#e7e1d8",
    borderWidth: 1,
  },
  camera: {
    flex: 1,
    justifyContent: "flex-end",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    backgroundColor: "rgba(16,19,27,0.72)",
    gap: 10,
  },
  button: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    flexDirection: "row",
    gap: 6,
  },
  captureButton: {
    backgroundColor: "#ef6f4d",
    flex: 1.25,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "800",
  },
  secondaryActionText: {
    color: "#171923",
    fontWeight: "800",
  },
  previewImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  resultContainer: {
    flex: 1,
    paddingHorizontal: 18,
    backgroundColor: "#f7f3ed",
  },
  resultContainerDark: {
    backgroundColor: "#10131b",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4d5562",
  },
  loadingTextDark: {
    color: "#d7dde8",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
  resetButton: {
    backgroundColor: "#f2eee8",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginVertical: 20,
  },
  resetButtonText: {
    color: "#171923",
    fontWeight: "800",
    fontSize: 16,
  },
  historyButton: {
    backgroundColor: "#171923",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
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
    backgroundColor: "#ef6f4d",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
});

export default MainScreen;
