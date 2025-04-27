import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBooks, deleteBook } from '../services/api';
import useTheme from '../hooks/useTheme';

export default function BooksListScreen() {
  const { themeObj } = useTheme();
  const {
    data: books,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['books'],
    queryFn: fetchBooks, // No user id argument
  });

  const queryClient = useQueryClient();
  const { mutate: removeBook, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: themeObj.background }]}>
        <ActivityIndicator size="large" color={themeObj.primary} />
        <Text style={[styles.loadingText, { color: themeObj.textSecondary }]}>Loading your books...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: themeObj.background }]}>
        <Text style={[styles.errorText, { color: themeObj.accent }]}>Failed to load books.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: themeObj.background }}
      data={books}
      keyExtractor={item => item.id?.toString() || item.title}
      renderItem={({ item }) => (
        <View style={[styles.bookItem, { backgroundColor: themeObj.card, borderColor: themeObj.border }]}>
          {item.cover_url ? (
            <Image source={{ uri: item.cover_url }} style={styles.coverImg} />
          ) : null}
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: themeObj.text }]}>{item.title}</Text>
            <Text style={[styles.author, { color: themeObj.textSecondary }]}>{item.author}</Text>
          </View>
          <TouchableOpacity
            onPress={() => removeBook(item.id)}
            style={{ marginLeft: 8, padding: 8 }}
            disabled={isDeleting}
          >
            <Text style={{ color: themeObj.accent, fontWeight: 'bold' }}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={themeObj.primary} />}
      ListEmptyComponent={<Text style={[styles.emptyText, { color: themeObj.textSecondary }]}>{books?.length ? undefined : 'No books found. Add your first book!'}</Text>}
      contentContainerStyle={books?.length ? undefined : styles.centerContainer}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    marginTop: 12,
    fontWeight: 'bold',
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  coverImg: {
    width: 50,
    height: 70,
    borderRadius: 4,
    marginRight: 12,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  author: {
    fontSize: 15,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
});
