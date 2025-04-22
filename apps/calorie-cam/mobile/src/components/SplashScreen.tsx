import React from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CalorieCam</Text>
      <Text style={styles.subtitle}>Food nutritional analysis with AI</Text>
      <ActivityIndicator size="large" color="#4f46e5" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4f46e5",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#6b7280",
    marginBottom: 32,
  },
  loader: {
    marginTop: 20,
  },
});

export default SplashScreen;
