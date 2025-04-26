import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadFoodImage } from "../services/api";
import { Alert } from "react-native";

export function useMutationHandler(onSuccess: (data: any) => void) {
  const queryClient = useQueryClient();
  const queryKeys = { foodLogs: ["foodLogs"] };

  return useMutation({
    mutationFn: uploadFoodImage,
    onSuccess: (data) => {
      onSuccess(data);
      queryClient.invalidateQueries({ queryKey: queryKeys.foodLogs });
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        "Failed to analyze the food image. Please try again."
      );
      console.error("Analysis error:", error);
    },
  });
}
