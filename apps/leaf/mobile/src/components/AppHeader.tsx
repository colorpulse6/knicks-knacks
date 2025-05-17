import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function AppHeader() {
  return (
    <View style={styles.header}>
      <Image
        source={{ uri: 'https://img.icons8.com/emoji/48/000000/leaf-fluttering-in-wind.png' }}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Leaf</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#eafbe7',
    borderBottomWidth: 1,
    borderBottomColor: '#b4e2c3',
  },
  logo: {
    width: 36,
    height: 36,
    marginRight: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#388e3c',
    letterSpacing: 2,
  },
});
