import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import useTheme from '../hooks/useTheme';

export default function ProfileScreen() {
  const { theme, themeObj, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: themeObj.background }]}> 
      <Text style={[styles.header, { color: themeObj.primary }]}>Profile / Settings</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 16 }}>
        <Text style={[styles.info, { color: themeObj.textSecondary }]}>Dark Mode</Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: themeObj.border, true: themeObj.accent }}
          thumbColor={isDark ? themeObj.primary : '#f4f3f4'}
          ios_backgroundColor={themeObj.border}
        />
      </View>
      {/* TODO: Add user info here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  info: {
    fontSize: 16,
    marginRight: 12,
  },
});
