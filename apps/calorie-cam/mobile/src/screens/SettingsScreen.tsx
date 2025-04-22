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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const SettingsScreen = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const appVersion = "1.0.0"; // This would be dynamic in a real app

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In a real app, this would trigger your theme change
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    // In a real app, this would update notification settings
  };

  const clearHistory = () => {
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
            // In a real app, this would clear the food history
            Alert.alert("Success", "Your food history has been cleared.");
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
    return (
      <TouchableOpacity
        style={styles.settingItem}
        onPress={action}
        disabled={type === "toggle"}
      >
        <View style={styles.settingItemLeft}>
          <Ionicons name={icon} size={24} color="#4f46e5" style={styles.icon} />
          <Text style={styles.settingTitle}>{title}</Text>
        </View>
        {type === "toggle" ? (
          <Switch
            value={value}
            onValueChange={action}
            trackColor={{ false: "#d1d5db", true: "#c7d2fe" }}
            thumbColor={value ? "#4f46e5" : "#f4f3f4"}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {renderSettingItem(
            "Dark Mode",
            "moon",
            toggleDarkMode,
            "toggle",
            darkMode
          )}
          {renderSettingItem(
            "Notifications",
            "notifications",
            toggleNotifications,
            "toggle",
            notificationsEnabled
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          {renderSettingItem("Clear History", "trash", clearHistory)}
          {renderSettingItem("Export Data", "download", () => {})}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          {renderSettingItem("Contact Us", "mail", contactSupport)}
          {renderSettingItem("Privacy Policy", "document-text", () => {})}
          {renderSettingItem("Terms of Service", "document", () => {})}
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Version {appVersion}</Text>
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
    color: "#4f46e5",
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginHorizontal: 16,
    marginVertical: 12,
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
  footer: {
    alignItems: "center",
    marginVertical: 24,
  },
  versionText: {
    fontSize: 14,
    color: "#9ca3af",
  },
});

export default SettingsScreen;
