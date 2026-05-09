import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../hooks/useTheme';

export default function AppHeader() {
  const { themeObj } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: themeObj.background, borderBottomColor: themeObj.border }]}>
      <View style={[styles.mark, { backgroundColor: themeObj.card, borderColor: themeObj.border }]}>
        <Ionicons name="leaf-outline" size={20} color={themeObj.primary} />
      </View>
      <Text style={[styles.title, { color: themeObj.text }]}>Leaf</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  mark: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    marginRight: 10,
    width: 38,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0,
  },
});
