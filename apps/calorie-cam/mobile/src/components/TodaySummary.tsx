import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { FoodLog } from "../types";
import { useTheme } from "../hooks/useTheme";

type TodaySummaryProps = {
  logs: FoodLog[];
};

const toNumber = (value?: number) => {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
};

const isToday = (date: string) => {
  return new Date(date).toDateString() === new Date().toDateString();
};

const TodaySummary: React.FC<TodaySummaryProps> = ({ logs }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const todaysLogs = logs.filter((log) => isToday(log.logged_at));
  const totals = todaysLogs.reduce(
    (sum, log) => ({
      calories: sum.calories + toNumber(log.calories),
      proteins: sum.proteins + toNumber(log.proteins),
      fats: sum.fats + toNumber(log.fats),
      carbs: sum.carbs + toNumber(log.carbs),
    }),
    { calories: 0, proteins: 0, fats: 0, carbs: 0 },
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.eyebrow, isDark && styles.eyebrowDark]}>
            Today
          </Text>
          <Text style={[styles.title, isDark && styles.titleDark]}>
            {Math.round(totals.calories)} kcal
          </Text>
        </View>
        <View style={[styles.countBadge, isDark && styles.countBadgeDark]}>
          <Text style={[styles.countText, isDark && styles.countTextDark]}>
            {todaysLogs.length} scans
          </Text>
        </View>
      </View>

      <View style={styles.macroRow}>
        <View style={styles.macroItem}>
          <Text style={[styles.macroValue, isDark && styles.macroValueDark]}>
            {totals.proteins.toFixed(0)}g
          </Text>
          <Text style={[styles.macroLabel, isDark && styles.macroLabelDark]}>
            Protein
          </Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={[styles.macroValue, isDark && styles.macroValueDark]}>
            {totals.fats.toFixed(0)}g
          </Text>
          <Text style={[styles.macroLabel, isDark && styles.macroLabelDark]}>
            Fat
          </Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={[styles.macroValue, isDark && styles.macroValueDark]}>
            {totals.carbs.toFixed(0)}g
          </Text>
          <Text style={[styles.macroLabel, isDark && styles.macroLabelDark]}>
            Carbs
          </Text>
        </View>
      </View>

      <Text style={[styles.disclaimer, isDark && styles.disclaimerDark]}>
        Estimates can vary with portions, ingredients, and photo quality.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderColor: "#e7e1d8",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    padding: 18,
  },
  containerDark: {
    backgroundColor: "#171923",
    borderColor: "#2d3340",
  },
  headerRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  eyebrow: {
    color: "#ef6f4d",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  eyebrowDark: {
    color: "#ffa387",
  },
  title: {
    color: "#171923",
    fontSize: 34,
    fontWeight: "800",
    marginTop: 2,
  },
  titleDark: {
    color: "#f8fafc",
  },
  countBadge: {
    backgroundColor: "#f2eee8",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  countBadgeDark: {
    backgroundColor: "#242936",
  },
  countText: {
    color: "#4d5562",
    fontSize: 13,
    fontWeight: "700",
  },
  countTextDark: {
    color: "#d7dde8",
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroItem: {
    flex: 1,
  },
  macroValue: {
    color: "#171923",
    fontSize: 20,
    fontWeight: "800",
  },
  macroValueDark: {
    color: "#f8fafc",
  },
  macroLabel: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 3,
  },
  macroLabelDark: {
    color: "#a7afbd",
  },
  disclaimer: {
    color: "#7a6b5f",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 18,
  },
  disclaimerDark: {
    color: "#a7afbd",
  },
});

export default TodaySummary;
