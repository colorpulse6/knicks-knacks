import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  Linking,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clearFoodLogs } from "../services/api";
import { useTheme } from "../hooks/useTheme";

const queryKeys = {
  foodLogs: ["foodLogs"],
};

const SettingsScreen = () => {
  const { theme, toggleTheme, isLoadingTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const appVersion = "1.0.0"; // This would be dynamic in a real app

  const queryClient = useQueryClient();

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    // In a real app, this would update notification settings
  };

  const clearHistoryMutation = useMutation({
    mutationFn: clearFoodLogs,
    onSuccess: (data: { message: string }) => {
      Alert.alert(
        "Success",
        data.message || "Your food history has been cleared."
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.foodLogs });
    },
    onError: (error: Error) => {
      console.error("Clear history error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to clear history. Please try again."
      );
    },
  });

  const clearHistory = () => {
    if (clearHistoryMutation.isPending) return;

    Alert.alert(
      "Clear History",
      "Are you sure you want to clear your food history? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearHistoryMutation.mutate();
          },
        },
      ]
    );
  };

  const contactSupport = () => {
    Linking.openURL("mailto:support@caloriecam.com");
  };

  const renderSettingItem = (
    title: string,
    icon: keyof typeof Ionicons.glyphMap,
    action: () => void,
    type: "toggle" | "button" = "button",
    value?: boolean
  ) => {
    const isDarkModeLoading = title === "Dark Mode" && isLoadingTheme;
    const isClearingHistory =
      title === "Clear History" && clearHistoryMutation.isPending;
    const isDisabled = isDarkModeLoading || isClearingHistory;
    const showActivityIndicator = isDarkModeLoading || isClearingHistory;

    return (
      <TouchableOpacity
        style={[styles.settingItem, theme === "dark" && styles.settingItemDark]}
        onPress={!isDisabled ? action : undefined}
        disabled={isDisabled || (type === "toggle" && isDisabled)}
      >
        <View style={styles.settingItemLeft}>
          <Ionicons
            name={icon}
            size={24}
            color={theme === "dark" ? "#c7d2fe" : "#4f46e5"}
            style={styles.icon}
          />
          <Text
            style={[
              styles.settingTitle,
              theme === "dark" && styles.settingTitleDark,
            ]}
          >
            {title}
          </Text>
        </View>
        {showActivityIndicator ? (
          <ActivityIndicator size="small" color="#4f46e5" />
        ) : type === "toggle" ? (
          <Switch
            value={value}
            onValueChange={action}
            trackColor={{ false: "#d1d5db", true: "#c7d2fe" }}
            thumbColor={value ? "#4f46e5" : "#f4f3f4"}
            ios_backgroundColor="#d1d5db"
            disabled={isDisabled}
          />
        ) : (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme === "dark" ? "#9ca3af" : "#9ca3af"}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, theme === "dark" && styles.containerDark]}
    >
      <Text style={[styles.title, theme === "dark" && styles.titleDark]}>
        Settings
      </Text>
      <ScrollView style={styles.scrollView}>
        <View style={[styles.section, theme === "dark" && styles.sectionDark]}>
          <Text
            style={[
              styles.sectionTitle,
              theme === "dark" && styles.sectionTitleDark,
            ]}
          >
            Preferences
          </Text>
          {renderSettingItem(
            "Dark Mode",
            "moon",
            toggleTheme,
            "toggle",
            theme === "dark"
          )}
          {renderSettingItem(
            "Notifications",
            "notifications",
            toggleNotifications,
            "toggle",
            notificationsEnabled
          )}
        </View>

        <View style={[styles.section, theme === "dark" && styles.sectionDark]}>
          <Text
            style={[
              styles.sectionTitle,
              theme === "dark" && styles.sectionTitleDark,
            ]}
          >
            Data
          </Text>
          {renderSettingItem("Clear History", "trash", clearHistory)}
          {renderSettingItem("Export Data", "download", () => {})}
        </View>

        <View style={[styles.section, theme === "dark" && styles.sectionDark]}>
          <Text
            style={[
              styles.sectionTitle,
              theme === "dark" && styles.sectionTitleDark,
            ]}
          >
            Support
          </Text>
          {renderSettingItem("Contact Us", "mail", contactSupport)}
          {renderSettingItem("Privacy Policy", "document-text", () => {})}
          {renderSettingItem("Terms of Service", "document", () => {})}
        </View>

        <View style={styles.footer}>
          <Text
            style={[
              styles.versionText,
              theme === "dark" && styles.versionTextDark,
            ]}
          >
            Version {appVersion}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
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
    color: "#c7d2fe", // Lighter indigo for dark mode
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
    marginHorizontal: 16,
  },
  sectionDark: {
    backgroundColor: "#1f2937", // Dark background for sections
    shadowColor: "#000",
    shadowOpacity: 0.2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginHorizontal: 16,
    marginVertical: 12,
  },
  sectionTitleDark: {
    color: "#9ca3af", // Lighter text for dark mode
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  settingItemDark: {
    borderBottomColor: "#374151", // Darker border for dark mode
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: "#111827",
  },
  settingTitleDark: {
    color: "#f9fafb", // Light text for dark mode
  },
  footer: {
    alignItems: "center",
    marginVertical: 24,
  },
  versionText: {
    fontSize: 14,
    color: "#9ca3af",
  },
  versionTextDark: {
    color: "#6b7280", // Slightly darker text in dark mode
  },
});

export default SettingsScreen;
