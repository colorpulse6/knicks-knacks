import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { enableScreens } from "react-native-screens";
import MainScreen from "./src/screens/MainScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import SplashScreen from "./src/components/SplashScreen";
import { Ionicons } from "@expo/vector-icons";
import * as Font from "expo-font";
import { ThemeProvider } from "./src/context/ThemeContext";
import { useTheme } from "./src/hooks/useTheme";

// Enable screens for react-navigation
enableScreens();

// Create a client for react-query
const queryClient = new QueryClient();

// Define tab navigator param list for type safety
export type RootTabParamList = {
  Camera: undefined;
  History: undefined;
  Settings: undefined;
};

// Create a tab navigator
const Tab = createBottomTabNavigator<RootTabParamList>();

// Create a component for adapting tab navigator style based on theme
function AppContent() {
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === "Camera") {
              iconName = focused ? "camera" : "camera-outline";
            } else if (route.name === "History") {
              iconName = focused ? "list" : "list-outline";
            } else if (route.name === "Settings") {
              iconName = focused ? "settings" : "settings-outline";
            } else {
              iconName = "help-circle";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#4f46e5",
          tabBarInactiveTintColor: "gray",
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
            borderTopColor: theme === "dark" ? "#374151" : "#e5e7eb",
          },
        })}
      >
        <Tab.Screen name="Camera" component={MainScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
      {/* Set StatusBar style based on theme */}
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
    </NavigationContainer>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate app loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Show splash screen while loading
  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AppContent />
        </QueryClientProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
