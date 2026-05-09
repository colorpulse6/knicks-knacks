import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteBook, fetchBooks, BookRecord, BookStatus } from '../services/api';
import useTheme from '../hooks/useTheme';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootStackParamList, RootTabParamList } from '../types/navigation';

type BooksListScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, 'BooksList'>,
  BottomTabNavigationProp<RootTabParamList>
>;

interface BooksListScreenProps {
  navigation: BooksListScreenNavigationProp;
}

const statusOrder: BookStatus[] = ['reading', 'want_to_read', 'paused', 'finished'];

const statusLabels: Record<BookStatus, string> = {
  reading: 'Reading',
  want_to_read: 'On Deck',
  paused: 'Paused',
  finished: 'Finished',
};

const statusDescriptions: Record<BookStatus, string> = {
  reading: 'Books currently in motion',
  want_to_read: 'A shelf for what comes next',
  paused: 'Set aside without losing the thread',
  finished: 'Completed reads',
};

export default function BooksListScreen({ navigation }: BooksListScreenProps) {
  const { themeObj } = useTheme();
  const [expandedSections, setExpandedSections] = useState<Record<BookStatus, boolean>>({
    reading: true,
    want_to_read: true,
    paused: false,
    finished: false,
  });
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const {
    data: books = [],
    isLoading,
    error,
  } = useQuery<BookRecord[]>({
    queryKey: ['books'],
    queryFn: fetchBooks,
  });

  const queryClient = useQueryClient();
  const { mutate: removeBook, isPending: isDeleting } = useMutation({
    mutationFn: async ({ id, user_id }: { id: string; user_id: string }) => {
      return deleteBook(id, user_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (deleteError) => {
      Alert.alert(
        'Failed to delete',
        `Could not delete book.\n${deleteError instanceof Error ? deleteError.message : ''}`,
      );
    },
  });

  const groupedBooks = statusOrder.map((status) => ({
    status,
    books: books.filter((book) => (book.status || 'want_to_read') === status),
  }));

  const toggleSection = (status: BookStatus) => {
    setExpandedSections((current) => ({
      ...current,
      [status]: !current[status],
    }));
  };

  const handleDelete = (book: BookRecord) => {
    Alert.alert(
      'Delete Book',
      `Delete "${book.title}" from your library?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPendingDeleteId(book.id);
            removeBook(
              { id: book.id, user_id: book.user_id },
              { onSettled: () => setPendingDeleteId(null) },
            );
          },
        },
      ],
      { cancelable: true },
    );
  };

  const renderProgress = (book: BookRecord) => {
    const percent = Math.max(0, Math.min(100, book.percent_complete || 0));
    return (
      <View style={styles.progressWrap}>
        <View style={[styles.progressTrack, { backgroundColor: themeObj.muted }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: themeObj.primary, width: `${percent}%` },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: themeObj.textSecondary }]}>
          {percent}% complete
        </Text>
      </View>
    );
  };

  const renderBook = (book: BookRecord) => (
    <TouchableOpacity
      key={book.id}
      style={[styles.bookItem, { backgroundColor: themeObj.card, borderColor: themeObj.border }]}
      onPress={() => navigation.navigate('BookDetails', { book })}
      activeOpacity={0.85}
    >
      {book.cover_url ? (
        <Image source={{ uri: book.cover_url }} style={styles.coverImg} />
      ) : (
        <View style={[styles.coverPlaceholder, { backgroundColor: themeObj.muted }]}>
          <Ionicons name="book-outline" size={24} color={themeObj.primary} />
        </View>
      )}
      <View style={styles.bookCopy}>
        <Text style={[styles.bookTitle, { color: themeObj.text }]} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={[styles.author, { color: themeObj.textSecondary }]} numberOfLines={1}>
          {book.author}
        </Text>
        {renderProgress(book)}
      </View>
      <TouchableOpacity
        onPress={() => handleDelete(book)}
        style={[styles.deleteButton, { backgroundColor: themeObj.muted }]}
        disabled={isDeleting || pendingDeleteId === book.id}
        accessibilityLabel="Delete book"
      >
        <Ionicons name="trash-outline" size={18} color={themeObj.text} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: themeObj.background }]}>
        <ActivityIndicator size="large" color={themeObj.primary} />
        <Text style={[styles.loadingText, { color: themeObj.textSecondary }]}>
          Loading your library...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: themeObj.background }]}>
        <Text style={[styles.errorText, { color: themeObj.primary }]}>
          Failed to load books.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeObj.background }]}>
      <Text style={[styles.header, { color: themeObj.text }]}>Library</Text>
      <FlatList
        data={groupedBooks}
        keyExtractor={(section) => section.status}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.section}>
            <TouchableOpacity
              onPress={() => toggleSection(item.status)}
              style={[styles.sectionHeader, { borderColor: themeObj.border }]}
            >
              <View>
                <Text style={[styles.sectionTitle, { color: themeObj.text }]}>
                  {statusLabels[item.status]}
                </Text>
                <Text style={[styles.sectionDescription, { color: themeObj.textSecondary }]}>
                  {statusDescriptions[item.status]}
                </Text>
              </View>
              <View style={styles.sectionRight}>
                <Text style={[styles.sectionCount, { color: themeObj.primary }]}>
                  {item.books.length}
                </Text>
                <Ionicons
                  name={expandedSections[item.status] ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={themeObj.textSecondary}
                />
              </View>
            </TouchableOpacity>
            {expandedSections[item.status] && (
              item.books.length > 0 ? (
                item.books.map(renderBook)
              ) : (
                <Text style={[styles.emptyShelf, { color: themeObj.textSecondary }]}>
                  No books here yet.
                </Text>
              )
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: themeObj.textSecondary }]}>
            No books found.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  header: {
    fontSize: 36,
    fontWeight: '800',
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  listContent: {
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
  },
  sectionDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  sectionCount: {
    fontSize: 18,
    fontWeight: '800',
  },
  bookItem: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 12,
    padding: 12,
  },
  coverImg: {
    borderRadius: 4,
    height: 86,
    marginRight: 12,
    resizeMode: 'cover',
    width: 58,
  },
  coverPlaceholder: {
    alignItems: 'center',
    borderRadius: 4,
    height: 86,
    justifyContent: 'center',
    marginRight: 12,
    width: 58,
  },
  bookCopy: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  author: {
    fontSize: 14,
    marginTop: 3,
  },
  progressWrap: {
    marginTop: 10,
  },
  progressTrack: {
    borderRadius: 999,
    height: 5,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 999,
    height: '100%',
  },
  progressText: {
    fontSize: 12,
    marginTop: 5,
  },
  deleteButton: {
    alignItems: 'center',
    borderRadius: 999,
    height: 38,
    justifyContent: 'center',
    marginLeft: 10,
    width: 38,
  },
  emptyShelf: {
    fontSize: 14,
    paddingVertical: 16,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 32,
    textAlign: 'center',
  },
});
