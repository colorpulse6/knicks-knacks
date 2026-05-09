import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteFoodLog, getFoodLogs } from "../services/api";
import { FoodLog } from "../types";
import { useTheme } from "../hooks/useTheme";
import TodaySummary from "../components/TodaySummary";

const HistoryScreen = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();

  const {
    data: foodLogs,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery<FoodLog[]>({
    queryKey: ["foodLogs"],
    queryFn: getFoodLogs,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFoodLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foodLogs"] });
    },
    onError: (deleteError: Error) => {
      Alert.alert("Delete failed", deleteError.message || "Unable to delete this log.");
    },
  });

  const confirmDelete = (item: FoodLog) => {
    if (deleteMutation.isPending) return;

    Alert.alert(
      "Delete Log",
      `Remove ${item.food_name || "this food log"} from your history?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(item.id),
        },
      ],
    );
  };

  const formatMacro = (value?: number) => {
    return typeof value === "number" && Number.isFinite(value)
      ? value.toFixed(1)
      : "0";
  };

  if (isLoading) {
    return (
      <View
        style={[styles.centerContainer, isDark && styles.centerContainerDark]}
      >
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
          Loading your food history...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.centerContainer, isDark && styles.centerContainerDark]}
      >
        <Text style={styles.errorText}>
          Error loading your food history. Pull down to refresh.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderFoodLogItem = ({ item }: { item: FoodLog }) => (
    <View
      style={[styles.logItemContainer, isDark && styles.logItemContainerDark]}
    >
      <Image source={{ uri: item.image_url }} style={styles.foodImage} />
      <View style={styles.logItemContent}>
        <View style={styles.logHeader}>
          <View style={styles.logTitleWrap}>
            <Text style={[styles.foodName, isDark && styles.foodNameDark]}>
              {item.food_name}
            </Text>
            <Text style={[styles.dateText, isDark && styles.dateTextDark]}>
              {new Date(item.logged_at).toLocaleDateString()} at{" "}
              {new Date(item.logged_at).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </Text>
          </View>
          <TouchableOpacity
            accessibilityLabel="Delete food log"
            style={[styles.deleteButton, isDark && styles.deleteButtonDark]}
            onPress={() => confirmDelete(item)}
            disabled={deleteMutation.isPending}
          >
            <Ionicons name="trash-outline" size={18} color={isDark ? "#f8fafc" : "#171923"} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.caloriesText, isDark && styles.caloriesTextDark]}>
          {item.calories || 0} calories
        </Text>
        <View style={styles.macroContainer}>
          <Text style={[styles.macroText, isDark && styles.macroTextDark]}>
            Protein: {formatMacro(item.proteins)}g
          </Text>
          <Text style={[styles.macroText, isDark && styles.macroTextDark]}>
            Fat: {formatMacro(item.fats)}g
          </Text>
          <Text style={[styles.macroText, isDark && styles.macroTextDark]}>
            Carbs: {formatMacro(item.carbs)}g
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.title, isDark && styles.titleDark]}>
        History
      </Text>
      {foodLogs && foodLogs.length > 0 ? (
        <FlatList
          data={foodLogs}
          renderItem={renderFoodLogItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={<TodaySummary logs={foodLogs} />}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        />
      ) : (
        <View
          style={[styles.emptyContainer, isDark && styles.emptyContainerDark]}
        >
          <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
            No food logs yet. Start scanning foods!
          </Text>
        </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f7f3ed",
  },
  centerContainerDark: {
    backgroundColor: "#10131b",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 12,
    marginTop: 8,
    paddingHorizontal: 18,
    color: "#171923",
  },
  titleDark: {
    color: "#f8fafc",
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  logItemContainer: {
    backgroundColor: "white",
    borderColor: "#e7e1d8",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
  },
  logItemContainerDark: {
    backgroundColor: "#171923",
    borderColor: "#2d3340",
  },
  foodImage: {
    width: "100%",
    height: 180,
  },
  logItemContent: {
    padding: 16,
  },
  logHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  logTitleWrap: {
    flex: 1,
    paddingRight: 12,
  },
  deleteButton: {
    alignItems: "center",
    backgroundColor: "#f2eee8",
    borderRadius: 999,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  deleteButtonDark: {
    backgroundColor: "#242936",
  },
  foodName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#171923",
    marginBottom: 4,
  },
  foodNameDark: {
    color: "#f9fafb",
  },
  caloriesText: {
    fontSize: 18,
    color: "#ef6f4d",
    fontWeight: "800",
    marginBottom: 10,
  },
  caloriesTextDark: {
    color: "#ffa387",
  },
  macroContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  macroText: {
    flex: 1,
    fontSize: 14,
    color: "#6b7280",
  },
  macroTextDark: {
    color: "#9ca3af",
  },
  dateText: {
    fontSize: 12,
    color: "#7a6b5f",
  },
  dateTextDark: {
    color: "#a7afbd",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  loadingTextDark: {
    color: "#9ca3af",
  },
  errorText: {
    textAlign: "center",
    color: "#ef4444",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#ef6f4d",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyContainerDark: {
    backgroundColor: "#10131b",
  },
  emptyText: {
    fontSize: 18,
    color: "#6b7280",
    textAlign: "center",
  },
  emptyTextDark: {
    color: "#9ca3af",
  },
});

export default HistoryScreen;
