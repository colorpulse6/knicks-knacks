import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FoodAnalysisResult } from "../types";

interface NutritionCardProps {
  result: FoodAnalysisResult;
}

const NutritionCard: React.FC<NutritionCardProps> = ({ result }) => {
  const { data } = result;

  // If it's not food, show the funny message
  if (!data.isFood) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFoodTitle}>That's not food! 🧐</Text>
        <Text style={styles.notFoodMessage}>
          {data.message || "I can't count calories for that!"}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{data.foodName}</Text>

      <View style={styles.nutritionContainer}>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{data.calories || "?"}</Text>
          <Text style={styles.nutritionLabel}>Calories</Text>
        </View>

        <View style={styles.macroContainer}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>
              {data.proteins?.toFixed(1) || "?"}
            </Text>
            <Text style={styles.nutritionLabel}>Protein (g)</Text>
          </View>

          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>
              {data.fats?.toFixed(1) || "?"}
            </Text>
            <Text style={styles.nutritionLabel}>Fat (g)</Text>
          </View>

          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>
              {data.carbs?.toFixed(1) || "?"}
            </Text>
            <Text style={styles.nutritionLabel}>Carbs (g)</Text>
          </View>
        </View>
      </View>

      {data.message && <Text style={styles.message}>{data.message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#111827",
  },
  nutritionContainer: {
    marginBottom: 12,
  },
  nutritionItem: {
    alignItems: "center",
    padding: 10,
  },
  nutritionValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4f46e5",
  },
  nutritionLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  macroContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  message: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#6b7280",
    textAlign: "center",
    marginTop: 16,
  },
  notFoodTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f59e0b",
    textAlign: "center",
    marginBottom: 12,
  },
  notFoodMessage: {
    fontSize: 16,
    textAlign: "center",
    color: "#4b5563",
    lineHeight: 24,
  },
});

export default NutritionCard;
