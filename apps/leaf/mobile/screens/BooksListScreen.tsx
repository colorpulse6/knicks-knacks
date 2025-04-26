import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBooks, deleteBook } from '../services/api';

export default function BooksListScreen() {
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
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your books...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load books.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={books}
      keyExtractor={item => item.id?.toString() || item.title}
      renderItem={({ item }) => (
        <View style={styles.bookItem}>
          {item.cover_url ? (
            <Image source={{ uri: item.cover_url }} style={styles.coverImg} />
          ) : null}
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.author}>{item.author}</Text>
          </View>
          <TouchableOpacity
            onPress={() => removeBook(item.id)}
            style={{ marginLeft: 8, padding: 8 }}
            disabled={isDeleting}
          >
            <Text style={{ color: '#e53935', fontWeight: 'bold' }}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      ListEmptyComponent={<Text style={styles.emptyText}>No books found. Add your first book!</Text>}
      contentContainerStyle={books?.length ? undefined : styles.centerContainer}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4CAF50',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  coverImg: {
    width: 44,
    height: 66,
    borderRadius: 6,
    marginRight: 14,
    backgroundColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  author: {
    fontSize: 16,
    color: '#555',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 32,
  },
});
