import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../hooks/useTheme';

export default function ProfileScreen() {
  const { theme, themeObj, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: themeObj.background }]}>
      <Text style={[styles.header, { color: themeObj.text }]}>Profile</Text>
      <View style={[styles.panel, { backgroundColor: themeObj.card, borderColor: themeObj.border }]}>
        <View style={[styles.iconWrap, { backgroundColor: themeObj.muted }]}>
          <Ionicons name="person-outline" size={26} color={themeObj.primary} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: themeObj.text }]}>Reader Settings</Text>
          <Text style={[styles.subtitle, { color: themeObj.textSecondary }]}>
            Tune the app surface for longer reading sessions.
          </Text>
        </View>
      </View>

      <View style={[styles.settingRow, { backgroundColor: themeObj.card, borderColor: themeObj.border }]}>
        <View>
          <Text style={[styles.settingTitle, { color: themeObj.text }]}>Dark Mode</Text>
          <Text style={[styles.settingNote, { color: themeObj.textSecondary }]}>
            Keep the shelf in editorial mode.
          </Text>
        </View>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: themeObj.border, true: themeObj.accent }}
          thumbColor={isDark ? themeObj.primary : '#f4f3f4'}
          ios_backgroundColor={themeObj.border}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 16,
  },
  panel: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 16,
    padding: 16,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 999,
    height: 52,
    justifyContent: 'center',
    marginRight: 14,
    width: 52,
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  settingRow: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  settingNote: {
    fontSize: 13,
    marginTop: 3,
  },
});
