import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorksByAuthor, getCoverUrlByOlid } from '../services/openLibrary';
import { BookRecord, BookStatus, updateBook } from '../services/api';
import useTheme from '../hooks/useTheme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

type BookDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'BookDetails'>;

const statuses: BookStatus[] = ['want_to_read', 'reading', 'paused', 'finished'];

const statusLabels: Record<BookStatus, string> = {
  want_to_read: 'On Deck',
  reading: 'Reading',
  paused: 'Paused',
  finished: 'Finished',
};

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

export default function BookDetailsScreen({ route, navigation }: BookDetailsScreenProps) {
  const { themeObj } = useTheme();
  const initialBook = route.params.book as BookRecord;
  const [book, setBook] = useState<BookRecord>(initialBook);
  const [status, setStatus] = useState<BookStatus>(initialBook.status || 'want_to_read');
  const [pagesRead, setPagesRead] = useState(String(initialBook.pages_read || 0));
  const [percentComplete, setPercentComplete] = useState(
    String(initialBook.percent_complete || 0),
  );
  const [suggestedBooks, setSuggestedBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: () => {
      const parsedPages = Number(pagesRead);
      const parsedPercent = Number(percentComplete);

      if (!Number.isFinite(parsedPages) || parsedPages < 0) {
        throw new Error('Pages read must be zero or higher.');
      }

      if (!Number.isFinite(parsedPercent) || parsedPercent < 0 || parsedPercent > 100) {
        throw new Error('Percent complete must be between 0 and 100.');
      }

      return updateBook(book.id, {
        status,
        pagesRead: Math.round(parsedPages),
        percentComplete: clampPercent(Math.round(parsedPercent)),
      });
    },
    onSuccess: (updatedBook) => {
      setBook(updatedBook);
      setStatus(updatedBook.status);
      setPagesRead(String(updatedBook.pages_read || 0));
      setPercentComplete(String(updatedBook.percent_complete || 0));
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (saveError: Error) => {
      Alert.alert('Update failed', saveError.message || 'Unable to update reading progress.');
    },
  });

  useEffect(() => {
    navigation.setOptions({
      title: '',
      headerStyle: { backgroundColor: themeObj.background },
      headerTintColor: themeObj.text,
    });

    if (book.author && book.language) {
      setLoading(true);
      getWorksByAuthor(book.author, book.language)
        .then((data) => {
          setSuggestedBooks(data.docs || []);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [book.author, book.language, navigation, themeObj.background, themeObj.text]);

  const percent = clampPercent(Number(percentComplete) || 0);

  const renderSuggestion = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.suggestionRow}>
      {item.cover_edition_key ? (
        <Image
          source={{ uri: getCoverUrlByOlid(item.cover_edition_key, 'M') }}
          style={styles.suggestionCover}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.suggestionCover, { backgroundColor: themeObj.muted }]}>
          <Ionicons name="book-outline" size={20} color={themeObj.primary} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={[styles.searchTitle, { color: themeObj.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.searchAuthor, { color: themeObj.textSecondary }]} numberOfLines={1}>
          {item.author_name?.[0]}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={suggestedBooks.filter((suggestion) => suggestion.title !== book.title)}
      keyExtractor={(item) => item.key || item.title}
      renderItem={renderSuggestion}
      ListHeaderComponent={
        <View>
          <View style={styles.header}>
            {book.cover_url ? (
              <Image source={{ uri: book.cover_url }} style={styles.cover} />
            ) : (
              <View style={[styles.cover, styles.coverPlaceholder, { backgroundColor: themeObj.muted }]}>
                <Ionicons name="book-outline" size={38} color={themeObj.primary} />
              </View>
            )}
            <View style={styles.info}>
              <Text style={[styles.title, { color: themeObj.text }]}>{book.title}</Text>
              <Text style={[styles.author, { color: themeObj.textSecondary }]}>{book.author}</Text>
              {book.page_count ? (
                <Text style={[styles.meta, { color: themeObj.textSecondary }]}>
                  {book.page_count} pages
                </Text>
              ) : null}
            </View>
          </View>

          <View style={[styles.panel, { backgroundColor: themeObj.card, borderColor: themeObj.border }]}>
            <Text style={[styles.panelTitle, { color: themeObj.text }]}>Reading Status</Text>
            <View style={styles.statusGrid}>
              {statuses.map((nextStatus) => {
                const selected = status === nextStatus;
                return (
                  <TouchableOpacity
                    key={nextStatus}
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor: selected ? themeObj.primary : themeObj.muted,
                        borderColor: selected ? themeObj.primary : themeObj.border,
                      },
                    ]}
                    onPress={() => setStatus(nextStatus)}
                  >
                    <Text
                      style={[
                        styles.statusChipText,
                        { color: selected ? '#12100d' : themeObj.text },
                      ]}
                    >
                      {statusLabels[nextStatus]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.progressRow}>
              <View style={styles.progressInputWrap}>
                <Text style={[styles.inputLabel, { color: themeObj.textSecondary }]}>
                  Pages read
                </Text>
                <TextInput
                  value={pagesRead}
                  onChangeText={setPagesRead}
                  keyboardType="number-pad"
                  style={[
                    styles.input,
                    {
                      backgroundColor: themeObj.background,
                      borderColor: themeObj.border,
                      color: themeObj.text,
                    },
                  ]}
                />
              </View>
              <View style={styles.progressInputWrap}>
                <Text style={[styles.inputLabel, { color: themeObj.textSecondary }]}>
                  Percent
                </Text>
                <TextInput
                  value={percentComplete}
                  onChangeText={setPercentComplete}
                  keyboardType="number-pad"
                  style={[
                    styles.input,
                    {
                      backgroundColor: themeObj.background,
                      borderColor: themeObj.border,
                      color: themeObj.text,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={[styles.progressTrack, { backgroundColor: themeObj.muted }]}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: themeObj.primary, width: `${percent}%` },
                ]}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: themeObj.primary }]}
              onPress={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              <Ionicons name="checkmark" size={18} color="#12100d" />
              <Text style={styles.saveButtonText}>
                {saveMutation.isPending ? 'Saving' : 'Save Progress'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { color: themeObj.text }]}>
            More by {book.author}
          </Text>
          {loading && <ActivityIndicator color={themeObj.primary} style={{ marginVertical: 16 }} />}
          {error && <Text style={{ color: themeObj.primary }}>{error}</Text>}
        </View>
      }
      style={{ flex: 1, backgroundColor: themeObj.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 18,
  },
  cover: {
    borderRadius: 6,
    height: 164,
    marginRight: 16,
    width: 108,
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
  },
  meta: {
    fontSize: 13,
    marginTop: 8,
  },
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 22,
    padding: 16,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statusChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 12,
  },
  progressInputWrap: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  progressTrack: {
    borderRadius: 999,
    height: 6,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 999,
    height: '100%',
  },
  saveButton: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 13,
  },
  saveButtonText: {
    color: '#12100d',
    fontSize: 15,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 12,
  },
  suggestionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 14,
  },
  suggestionCover: {
    alignItems: 'center',
    borderRadius: 4,
    height: 64,
    justifyContent: 'center',
    marginRight: 12,
    width: 44,
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  searchAuthor: {
    fontSize: 14,
    marginTop: 2,
  },
});
