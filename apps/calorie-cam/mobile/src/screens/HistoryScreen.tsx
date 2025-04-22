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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { getFoodLogs } from "../services/api";
import { FoodLog } from "../types";

const HistoryScreen = () => {
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

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading your food history...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
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
    <View style={styles.logItemContainer}>
      <Image source={{ uri: item.image_url }} style={styles.foodImage} />
      <View style={styles.logItemContent}>
        <Text style={styles.foodName}>{item.food_name}</Text>
        <Text style={styles.caloriesText}>{item.calories} calories</Text>
        <View style={styles.macroContainer}>
          <Text style={styles.macroText}>
            Protein: {item.proteins?.toFixed(1) || "0"} g
          </Text>
          <Text style={styles.macroText}>
            Fat: {item.fats?.toFixed(1) || "0"} g
          </Text>
          <Text style={styles.macroText}>
            Carbs: {item.carbs?.toFixed(1) || "0"} g
          </Text>
        </View>
        <Text style={styles.dateText}>
          {new Date(item.logged_at).toLocaleDateString()} at{" "}
          {new Date(item.logged_at).toLocaleTimeString()}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Food History</Text>
      {foodLogs && foodLogs.length > 0 ? (
        <FlatList
          data={foodLogs}
          renderItem={renderFoodLogItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
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
    backgroundColor: "#f9fafb",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
    color: "#4f46e5",
  },
  listContent: {
    padding: 16,
  },
  logItemContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  foodImage: {
    width: "100%",
    height: 180,
  },
  logItemContent: {
    padding: 16,
  },
  foodName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  caloriesText: {
    fontSize: 18,
    color: "#4f46e5",
    fontWeight: "600",
    marginBottom: 8,
  },
  macroContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  macroText: {
    fontSize: 14,
    color: "#6b7280",
  },
  dateText: {
    fontSize: 12,
    color: "#9ca3af",
    fontStyle: "italic",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  errorText: {
    textAlign: "center",
    color: "#ef4444",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#4f46e5",
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
  emptyText: {
    fontSize: 18,
    color: "#6b7280",
    textAlign: "center",
  },
});

export default HistoryScreen;
