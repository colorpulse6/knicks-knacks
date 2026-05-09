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
import Constants from "expo-constants";
import { useTheme } from "../hooks/useTheme";
import { useClearHistoryHandler } from "../hooks/useClearHistory";

type AppExtra = {
  privacyPolicyUrl?: string;
  supportEmail?: string;
  termsUrl?: string;
};

const SettingsScreen = () => {
  const { theme, toggleTheme, isLoadingTheme } = useTheme();
  const isDark = theme === "dark";
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";
  const appExtra = (Constants.expoConfig?.extra ?? {}) as AppExtra;
  const supportEmail = appExtra.supportEmail || "support@caloriecam.com";

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    // In a real app, this would update notification settings
  };

  const clearHistoryMutation = useClearHistoryHandler();

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
    Linking.openURL(`mailto:${supportEmail}`);
  };

  const openExternalLink = (url: string | undefined, label: string) => {
    if (!url) {
      Alert.alert(
        `${label} not configured`,
        "Add this link in the app config before publishing.",
      );
      return;
    }

    Linking.openURL(url);
  };

  const exportData = () => {
    Alert.alert(
      "Export Data",
      "History export is not available yet. Your logs remain stored for this device account.",
    );
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
            color={isDark ? "#ffa387" : "#ef6f4d"}
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
          {renderSettingItem("Export Data", "download", exportData)}
        </View>

        <View style={[styles.section, theme === "dark" && styles.sectionDark]}>
          <Text
            style={[
              styles.sectionTitle,
              theme === "dark" && styles.sectionTitleDark,
            ]}
          >
            Nutrition
          </Text>
          <Text style={[styles.disclaimer, isDark && styles.disclaimerDark]}>
            CalorieCam estimates nutrition from photos. Results can be wrong and are not medical advice.
          </Text>
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
          {renderSettingItem("Privacy Policy", "document-text", () =>
            openExternalLink(appExtra.privacyPolicyUrl, "Privacy Policy")
          )}
          {renderSettingItem("Terms of Service", "document", () =>
            openExternalLink(appExtra.termsUrl, "Terms of Service")
          )}
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
    backgroundColor: "#f7f3ed",
  },
  containerDark: {
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
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    backgroundColor: "white",
    borderColor: "#e7e1d8",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
    marginHorizontal: 18,
  },
  sectionDark: {
    backgroundColor: "#171923",
    borderColor: "#2d3340",
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
    borderBottomColor: "#2d3340",
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
    color: "#f9fafb",
  },
  disclaimer: {
    color: "#4d5562",
    fontSize: 14,
    lineHeight: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  disclaimerDark: {
    color: "#a7afbd",
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
