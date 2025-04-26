import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clearFoodLogs } from "../services/api";
import { Alert } from "react-native";

export function useClearHistoryHandler() {
  const queryClient = useQueryClient();
  const queryKeys = { foodLogs: ["foodLogs"] };

  return useMutation({
    mutationFn: clearFoodLogs,
    onSuccess: (data: { message: string }) => {
      Alert.alert("Success", data.message || "Your food history has been cleared.");
      queryClient.invalidateQueries({ queryKey: queryKeys.foodLogs });
    },
    onError: (error: Error) => {
      console.error("Clear history error:", error);
      Alert.alert("Error", error.message || "Failed to clear history. Please try again.");
    },
  });
}
