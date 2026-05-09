import React, { useEffect, useState } from "react";
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FoodAnalysisResult, FoodLogUpdateInput } from "../types";
import { useTheme } from "../hooks/useTheme";

interface NutritionCardProps {
  result: FoodAnalysisResult;
  editable?: boolean;
  isSaving?: boolean;
  onSave?: (payload: FoodLogUpdateInput) => Promise<unknown> | void;
}

type NutritionForm = {
  foodName: string;
  calories: string;
  proteins: string;
  fats: string;
  carbs: string;
};

const formatNumber = (value?: number) => {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toString()
    : "";
};

const parseNumberInput = (value: string, label: string) => {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return undefined;
  }

  const parsed = Number(trimmed);

  if (!Number.isFinite(parsed) || parsed < 0) {
    Alert.alert("Invalid value", `${label} must be zero or higher.`);
    return null;
  }

  return parsed;
};

const NutritionCard: React.FC<NutritionCardProps> = ({
  result,
  editable = false,
  isSaving = false,
  onSave,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { data } = result;
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<NutritionForm>({
    foodName: data.foodName,
    calories: formatNumber(data.calories),
    proteins: formatNumber(data.proteins),
    fats: formatNumber(data.fats),
    carbs: formatNumber(data.carbs),
  });

  useEffect(() => {
    if (isEditing) {
      return;
    }

    setForm({
      foodName: data.foodName,
      calories: formatNumber(data.calories),
      proteins: formatNumber(data.proteins),
      fats: formatNumber(data.fats),
      carbs: formatNumber(data.carbs),
    });
  }, [data.calories, data.carbs, data.fats, data.foodName, data.proteins, isEditing]);

  const updateForm = (field: keyof NutritionForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleCancel = () => {
    setForm({
      foodName: data.foodName,
      calories: formatNumber(data.calories),
      proteins: formatNumber(data.proteins),
      fats: formatNumber(data.fats),
      carbs: formatNumber(data.carbs),
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!onSave) {
      return;
    }

    const foodName = form.foodName.trim();
    const calories = parseNumberInput(form.calories, "Calories");
    const proteins = parseNumberInput(form.proteins, "Protein");
    const fats = parseNumberInput(form.fats, "Fat");
    const carbs = parseNumberInput(form.carbs, "Carbs");

    if (!foodName) {
      Alert.alert("Missing name", "Add a food name before saving.");
      return;
    }

    if ([calories, proteins, fats, carbs].some((value) => value === null)) {
      return;
    }

    try {
      await onSave({
        foodName,
        calories: calories ?? undefined,
        proteins: proteins ?? undefined,
        fats: fats ?? undefined,
        carbs: carbs ?? undefined,
      });
      setIsEditing(false);
    } catch {
      Alert.alert("Update failed", "The food log could not be updated.");
    }
  };

  // If it's not food, show the funny message
  if (!data.isFood) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Text style={styles.notFoodTitle}>{"That's not food."}</Text>
        <Text
          style={[
            styles.notFoodMessage,
            isDark && styles.notFoodMessageDark,
          ]}
        >
          {data.message || "I can't count calories for that!"}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, isDark && styles.titleDark]}>
          {isEditing ? "Edit meal" : data.foodName}
        </Text>

        {editable && onSave && !isEditing && (
          <TouchableOpacity
            accessibilityLabel="Edit nutrition"
            style={[styles.iconButton, isDark && styles.iconButtonDark]}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="create-outline" size={20} color={isDark ? "#f8fafc" : "#171923"} />
          </TouchableOpacity>
        )}
      </View>

      {isEditing ? (
        <View>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            value={form.foodName}
            onChangeText={(value) => updateForm("foodName", value)}
            placeholder="Food name"
            placeholderTextColor={isDark ? "#8b95a6" : "#9ca3af"}
          />
          <View style={styles.inputGrid}>
            <TextInput
              style={[styles.input, styles.inputHalf, isDark && styles.inputDark]}
              value={form.calories}
              onChangeText={(value) => updateForm("calories", value)}
              keyboardType="number-pad"
              placeholder="Calories"
              placeholderTextColor={isDark ? "#8b95a6" : "#9ca3af"}
            />
            <TextInput
              style={[styles.input, styles.inputHalf, isDark && styles.inputDark]}
              value={form.proteins}
              onChangeText={(value) => updateForm("proteins", value)}
              keyboardType="decimal-pad"
              placeholder="Protein"
              placeholderTextColor={isDark ? "#8b95a6" : "#9ca3af"}
            />
            <TextInput
              style={[styles.input, styles.inputHalf, isDark && styles.inputDark]}
              value={form.fats}
              onChangeText={(value) => updateForm("fats", value)}
              keyboardType="decimal-pad"
              placeholder="Fat"
              placeholderTextColor={isDark ? "#8b95a6" : "#9ca3af"}
            />
            <TextInput
              style={[styles.input, styles.inputHalf, isDark && styles.inputDark]}
              value={form.carbs}
              onChangeText={(value) => updateForm("carbs", value)}
              keyboardType="decimal-pad"
              placeholder="Carbs"
              placeholderTextColor={isDark ? "#8b95a6" : "#9ca3af"}
            />
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.secondaryButton, isDark && styles.secondaryButtonDark]}
              onPress={handleCancel}
              disabled={isSaving}
            >
              <Text style={[styles.secondaryButtonText, isDark && styles.secondaryButtonTextDark]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, isSaving && styles.disabledButton]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Ionicons name="checkmark" size={18} color="#ffffff" />
              <Text style={styles.primaryButtonText}>
                {isSaving ? "Saving" : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.nutritionContainer}>
          <View style={styles.nutritionItem}>
            <Text
              style={[
                styles.nutritionValue,
                isDark && styles.nutritionValueDark,
              ]}
            >
              {data.calories || "?"}
            </Text>
            <Text
              style={[
                styles.nutritionLabel,
                isDark && styles.nutritionLabelDark,
              ]}
            >
              Calories
            </Text>
          </View>

          <View style={[styles.macroContainer, isDark && styles.macroContainerDark]}>
            <View style={styles.nutritionItem}>
              <Text
                style={[
                  styles.nutritionValue,
                  isDark && styles.nutritionValueDark,
                ]}
              >
                {data.proteins?.toFixed(1) || "?"}
              </Text>
              <Text
                style={[
                  styles.nutritionLabel,
                  isDark && styles.nutritionLabelDark,
                ]}
              >
                Protein (g)
              </Text>
            </View>

            <View style={styles.nutritionItem}>
              <Text
                style={[
                  styles.nutritionValue,
                  isDark && styles.nutritionValueDark,
                ]}
              >
                {data.fats?.toFixed(1) || "?"}
              </Text>
              <Text
                style={[
                  styles.nutritionLabel,
                  isDark && styles.nutritionLabelDark,
                ]}
              >
                Fat (g)
              </Text>
            </View>

            <View style={styles.nutritionItem}>
              <Text
                style={[
                  styles.nutritionValue,
                  isDark && styles.nutritionValueDark,
                ]}
              >
                {data.carbs?.toFixed(1) || "?"}
              </Text>
              <Text
                style={[
                  styles.nutritionLabel,
                  isDark && styles.nutritionLabelDark,
                ]}
              >
                Carbs (g)
              </Text>
            </View>
          </View>
        </View>
      )}

      {data.message && (
        <Text style={[styles.message, isDark && styles.messageDark]}>
          {data.message}
        </Text>
      )}

      <Text style={[styles.disclaimer, isDark && styles.disclaimerDark]}>
        Nutrition values are estimates. Confirm critical diet or medical decisions with a qualified professional.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderColor: "#e7e1d8",
    borderRadius: 8,
    borderWidth: 1,
    padding: 20,
    marginVertical: 16,
  },
  containerDark: {
    backgroundColor: "#171923",
    borderColor: "#2d3340",
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    color: "#171923",
    flex: 1,
    fontSize: 24,
    fontWeight: "800",
    paddingRight: 12,
  },
  titleDark: {
    color: "#f9fafb",
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "#f2eee8",
    borderRadius: 999,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  iconButtonDark: {
    backgroundColor: "#242936",
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
    fontWeight: "800",
    color: "#ef6f4d",
  },
  nutritionValueDark: {
    color: "#ffa387",
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
    borderTopColor: "#ece5dc",
  },
  macroContainerDark: {
    borderTopColor: "#2d3340",
  },
  inputGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  input: {
    backgroundColor: "#f8f6f2",
    borderColor: "#e7e1d8",
    borderRadius: 8,
    borderWidth: 1,
    color: "#171923",
    fontSize: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputDark: {
    backgroundColor: "#11141d",
    borderColor: "#2d3340",
    color: "#f8fafc",
  },
  inputHalf: {
    width: "48%",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 2,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#ef6f4d",
    borderRadius: 8,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#f2eee8",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 16,
  },
  secondaryButtonDark: {
    backgroundColor: "#242936",
  },
  secondaryButtonText: {
    color: "#171923",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButtonTextDark: {
    color: "#f8fafc",
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
    fontWeight: "800",
    color: "#ef6f4d",
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
  disclaimer: {
    color: "#7a6b5f",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
  },
  disclaimerDark: {
    color: "#a7afbd",
  },
});

export default NutritionCard;
