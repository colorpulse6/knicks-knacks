import React from "react";
import { Pressable, Text } from "react-native";

export interface ButtonProps {
  text: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

export const Button = ({ text, onPress, variant = "primary", disabled }: ButtonProps) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={{
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
      alignItems: "center",
      backgroundColor: variant === "primary" ? "#2563eb" : "#e5e7eb",
      opacity: disabled ? 0.5 : 1
    }}
  >
    <Text style={{ color: variant === "primary" ? "white" : "#1f2937" }}>
      {text}
    </Text>
  </Pressable>
);
