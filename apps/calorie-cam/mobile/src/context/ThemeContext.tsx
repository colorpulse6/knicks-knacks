import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme, View, StyleSheet } from "react-native";

// Key for storing theme preference
export const DARK_MODE_KEY = "@app:darkModeEnabled";

// Define the Theme Context type
interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
  isLoadingTheme: boolean;
}

// Create the context with undefined initial value
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ThemeProvider props type
interface ThemeProviderProps {
  children: ReactNode;
}

// Theme Provider Component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isLoadingTheme, setIsLoadingTheme] = useState(true);
  const systemColorScheme = useColorScheme();

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      setIsLoadingTheme(true);
      try {
        const storedValue = await AsyncStorage.getItem(DARK_MODE_KEY);
        // If a preference exists, use it
        if (storedValue !== null) {
          setTheme(JSON.parse(storedValue) ? "dark" : "light");
        }
        // Otherwise use system preference, defaulting to light if unavailable
        else if (systemColorScheme) {
          setTheme(systemColorScheme);
        }
      } catch (error) {
        console.error("Failed to load theme preference:", error);
        // Default to light theme on error
      } finally {
        setIsLoadingTheme(false);
      }
    };

    loadThemePreference();
  }, [systemColorScheme]);

  // Toggle theme function
  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    // Update state immediately for a responsive UI
    setTheme(newTheme);

    try {
      // Save preference
      await AsyncStorage.setItem(
        DARK_MODE_KEY,
        JSON.stringify(newTheme === "dark")
      );
      console.log("Theme preference saved:", newTheme);
    } catch (error) {
      console.error("Failed to save theme preference:", error);
      // Revert state if save failed
      setTheme(theme);
    }
  };

  // Context value to provide
  const contextValue: ThemeContextType = {
    theme,
    toggleTheme,
    isLoadingTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <View style={[styles.container, theme === "dark" && styles.darkTheme]}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb", // Light mode background
  },
  darkTheme: {
    backgroundColor: "#111827", // Dark mode background
  },
});

export default ThemeContext;
