import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile / Settings</Text>
      {/* TODO: Add dark mode toggle and user info here */}
      <Text style={styles.info}>Dark mode toggle coming soon!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#4CAF50',
  },
  info: {
    fontSize: 16,
    color: '#666',
  },
});
