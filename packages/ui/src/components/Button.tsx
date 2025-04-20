import React from "react";
import { Pressable, Text, View, StyleSheet, Platform } from "react-native";
import clsx from "clsx";

export interface ButtonProps {
  text: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

export function Button({
  text,
  onPress,
  variant = "primary",
  disabled = false,
}: ButtonProps) {
  // Common styles between web and native
  const baseStyles = {
    container: {
      paddingHorizontal: 16, // px-4
      paddingVertical: 8, // py-2
      borderRadius: 6, // rounded-md
      alignItems: "center" as const,
      justifyContent: "center" as const,
      opacity: disabled ? 0.5 : 1,
    },
    text: {
      fontWeight: "500" as const, // font-medium
      color: "white",
    },
  };

  // Variant styles
  const variantStyles = {
    primary: {
      backgroundColor: "#4f46e5", // primary
    },
    secondary: {
      backgroundColor: "#14b8a6", // secondary
    },
  };

  // Web-specific styles for Tailwind classes
  const webClassName =
    Platform.OS === "web"
      ? clsx("px-4 py-2 rounded-md font-medium text-white transition", {
          "bg-primary hover:bg-primary-dark": variant === "primary",
          "bg-secondary hover:bg-secondary-dark": variant === "secondary",
          "opacity-50 cursor-not-allowed": disabled,
        })
      : "";

  return Platform.OS === "web" ? (
    // Web version using div with Tailwind classes
    <Pressable
      // @ts-ignore - className is valid in react-native-web
      className={webClassName}
      onClick={disabled ? undefined : onPress}
      disabled={disabled}
    >
      <Text>{text}</Text>
    </Pressable>
  ) : (
    // Native version using View and StyleSheet
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[
        baseStyles.container,
        variant === "primary" ? variantStyles.primary : variantStyles.secondary,
      ]}
    >
      <Text style={baseStyles.text}>{text}</Text>
    </Pressable>
  );
}
