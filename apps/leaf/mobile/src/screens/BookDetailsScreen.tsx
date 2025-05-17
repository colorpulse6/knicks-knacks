import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getWorksByAuthor, getCoverUrl, getCoverUrlByOlid } from '../services/openLibrary';
import useTheme from '../hooks/useTheme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

type BookDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'BookDetails'>;

export default function BookDetailsScreen({ route, navigation }: BookDetailsScreenProps) {
  const { themeObj } = useTheme();
  const { book } = route.params;
  const [suggestedBooks, setSuggestedBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    navigation.setOptions({ title: book.title });
    if (book.author && book.language) {
      setLoading(true);
      getWorksByAuthor(book.author, book.language)
        .then((data) => {
          setSuggestedBooks(data.docs || []);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [book.author, book.language]);

  return (
    <FlatList
      data={suggestedBooks.filter((b) => b.title !== book.title)}
      keyExtractor={(item) => item.key || item.title}
      renderItem={({ item }) => (
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          {item.cover_edition_key ? (
            <Image
              source={{ uri: getCoverUrlByOlid(item.cover_edition_key, 'M') }}
              style={{ width: 40, height: 60, borderRadius: 4, marginRight: 12 }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ width: 40, height: 60, borderRadius: 4, backgroundColor: themeObj.card, marginRight: 12 }} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.searchTitle, { color: themeObj.text }]}>{item.title}</Text>
            <Text style={[styles.searchAuthor, { color: themeObj.textSecondary }]}>{item.author_name?.[0]}</Text>
          </View>
        </TouchableOpacity>
      )}
      ListHeaderComponent={
        <>
          <View style={styles.header}>
            {book.cover_url ? (
              <Image source={{ uri: book.cover_url }} style={styles.cover} />
            ) : (
              <View style={[styles.cover, { backgroundColor: themeObj.card }]} />
            )}
            <View style={styles.info}>
              <Text style={[styles.title, { color: themeObj.text }]}>{book.title}</Text>
              <Text style={[styles.author, { color: themeObj.textSecondary }]}>{book.author}</Text>
            </View>
          </View>
          <Text style={[styles.sectionTitle, { color: themeObj.text }]}>Suggested Books by {book.author}</Text>
          {loading && <ActivityIndicator color={themeObj.primary} style={{ marginVertical: 16 }} />}
          {error && <Text style={{ color: 'red' }}>{error}</Text>}
        </>
      }
      style={{ flex: 1, backgroundColor: themeObj.background, padding: 16 }}
      contentContainerStyle={{ paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  cover: {
    width: 100,
    height: 150,
    borderRadius: 8,
    marginRight: 16,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  suggestedBook: {
    width: 120,
    marginRight: 12,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  suggestedCover: {
    width: 80,
    height: 120,
    borderRadius: 6,
    marginBottom: 6,
  },
  suggestedTitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchAuthor: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});
