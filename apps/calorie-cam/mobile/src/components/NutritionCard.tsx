import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FoodAnalysisResult } from "../types";
import { useTheme } from "../hooks/useTheme";

interface NutritionCardProps {
  result: FoodAnalysisResult;
}

const NutritionCard: React.FC<NutritionCardProps> = ({ result }) => {
  const { theme } = useTheme(); // Get the current theme
  const { data } = result;

  // If it's not food, show the funny message
  if (!data.isFood) {
    return (
      <View
        style={[styles.container, theme === "dark" && styles.containerDark]}
      >
        <Text style={styles.notFoodTitle}>That's not food! 🧐</Text>
        <Text
          style={[
            styles.notFoodMessage,
            theme === "dark" && styles.notFoodMessageDark,
          ]}
        >
          {data.message || "I can't count calories for that!"}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, theme === "dark" && styles.containerDark]}>
      <Text style={[styles.title, theme === "dark" && styles.titleDark]}>
        {data.foodName}
      </Text>

      <View style={styles.nutritionContainer}>
        <View style={styles.nutritionItem}>
          <Text
            style={[
              styles.nutritionValue,
              theme === "dark" && styles.nutritionValueDark,
            ]}
          >
            {data.calories || "?"}
          </Text>
          <Text
            style={[
              styles.nutritionLabel,
              theme === "dark" && styles.nutritionLabelDark,
            ]}
          >
            Calories
          </Text>
        </View>

        <View
          style={[
            styles.macroContainer,
            theme === "dark" && styles.macroContainerDark,
          ]}
        >
          <View style={styles.nutritionItem}>
            <Text
              style={[
                styles.nutritionValue,
                theme === "dark" && styles.nutritionValueDark,
              ]}
            >
              {data.proteins?.toFixed(1) || "?"}
            </Text>
            <Text
              style={[
                styles.nutritionLabel,
                theme === "dark" && styles.nutritionLabelDark,
              ]}
            >
              Protein (g)
            </Text>
          </View>

          <View style={styles.nutritionItem}>
            <Text
              style={[
                styles.nutritionValue,
                theme === "dark" && styles.nutritionValueDark,
              ]}
            >
              {data.fats?.toFixed(1) || "?"}
            </Text>
            <Text
              style={[
                styles.nutritionLabel,
                theme === "dark" && styles.nutritionLabelDark,
              ]}
            >
              Fat (g)
            </Text>
          </View>

          <View style={styles.nutritionItem}>
            <Text
              style={[
                styles.nutritionValue,
                theme === "dark" && styles.nutritionValueDark,
              ]}
            >
              {data.carbs?.toFixed(1) || "?"}
            </Text>
            <Text
              style={[
                styles.nutritionLabel,
                theme === "dark" && styles.nutritionLabelDark,
              ]}
            >
              Carbs (g)
            </Text>
          </View>
        </View>
      </View>

      {data.message && (
        <Text style={[styles.message, theme === "dark" && styles.messageDark]}>
          {data.message}
        </Text>
      )}
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
  containerDark: {
    backgroundColor: "#1f2937",
    shadowOpacity: 0.2,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#111827",
  },
  titleDark: {
    color: "#f9fafb",
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
  nutritionValueDark: {
    color: "#c7d2fe",
  },
  nutritionLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  nutritionLabelDark: {
    color: "#9ca3af",
  },
  macroContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  macroContainerDark: {
    borderTopColor: "#374151",
  },
  message: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#6b7280",
    textAlign: "center",
    marginTop: 16,
  },
  messageDark: {
    color: "#9ca3af",
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
  notFoodMessageDark: {
    color: "#d1d5db",
  },
});

export default NutritionCard;
