import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useAddBook } from '../hooks/useAddBook';
import { searchBooks, getCoverUrl, OpenLibraryDoc } from '../services/openLibrary';
import useTheme from '../hooks/useTheme';
import { BookInput, fetchBooks } from '../services/api';

export default function AddBookScreen() {
  const { themeObj } = useTheme();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [openLibraryId, setOpenLibraryId] = useState('');
  const [selectedBook, setSelectedBook] = useState<BookInput | null>(null);
  const [searchResults, setSearchResults] = useState<OpenLibraryDoc[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const { mutate: addBook, isPending } = useAddBook(() => {
    setTitle('');
    setAuthor('');
    setCoverUrl('');
    setOpenLibraryId('');
    setSearchResults([]);
    setSearchLoading(false);
    setSelectedBook(null);
  });

  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: fetchBooks,
  });

  useEffect(() => {
    const trimmedTitle = title.trim();
    const trimmedAuthor = author.trim();

    if (!trimmedTitle && !trimmedAuthor) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    if (
      selectedBook &&
      selectedBook.title === trimmedTitle &&
      selectedBook.author === trimmedAuthor
    ) {
      return;
    }

    setSearchLoading(true);
    const searchTimer = setTimeout(async () => {
      try {
        const data = await searchBooks({
          title: trimmedTitle,
          author: trimmedAuthor,
          limit: 10,
        });
        setSearchResults(data.docs || []);
      } catch (err) {
        console.error('Open Library search error:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 450);

    return () => clearTimeout(searchTimer);
  }, [author, selectedBook, title]);

  const mapDocToBookInput = (doc: OpenLibraryDoc): BookInput => ({
    title: doc.title,
    subtitle: (doc as any).subtitle,
    author: doc.author_name?.[0] || '',
    author_key: doc.author_key?.[0],
    description: (doc as any).description,
    cover_url: doc.cover_i ? getCoverUrl(doc.cover_i, 'L') : undefined,
    open_library_id: doc.key?.replace('/works/', ''),
    isbn_10: (doc as any).isbn?.find((i: string) => i.length === 10),
    isbn_13: (doc as any).isbn?.find((i: string) => i.length === 13),
    publish_date: (doc as any).publish_date?.[0],
    publisher: (doc as any).publisher?.[0],
    page_count: (doc as any).number_of_pages_median,
    subjects: (doc as any).subject,
    language: (doc as any).language?.[0],
    series: (doc as any).series,
    goodreads_id: (doc as any).goodreads_id,
    status: 'want_to_read',
    pages_read: 0,
    percent_complete: 0,
  });

  const handleSelectBook = (doc: OpenLibraryDoc) => {
    const mapped = mapDocToBookInput(doc);
    setSelectedBook(mapped);
    setTitle(mapped.title);
    setAuthor(mapped.author);
    setCoverUrl(mapped.cover_url || '');
    setOpenLibraryId(mapped.open_library_id || '');
    setSearchResults([]);
  };

  const handleAddBook = () => {
    if (!title.trim() || !author.trim()) {
      Alert.alert('Missing Details', 'Enter a title and author, or select a result.');
      return;
    }

    if (selectedBook) {
      addBook(selectedBook);
      return;
    }

    addBook({
      title: title.trim(),
      author: author.trim(),
      cover_url: coverUrl || undefined,
      open_library_id: openLibraryId || undefined,
      status: 'want_to_read',
      pages_read: 0,
      percent_complete: 0,
    });
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setSelectedBook(null);
  };

  const handleAuthorChange = (value: string) => {
    setAuthor(value);
    setSelectedBook(null);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: themeObj.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={64}
    >
      <Text style={[styles.header, { color: themeObj.text }]}>Add Book</Text>
      <View style={[styles.panel, { backgroundColor: themeObj.card, borderColor: themeObj.border }]}>
        <TextInput
          style={[
            styles.input,
            { borderColor: themeObj.border, backgroundColor: themeObj.background, color: themeObj.text },
          ]}
          placeholder="Title"
          placeholderTextColor={themeObj.textSecondary}
          value={title}
          onChangeText={handleTitleChange}
        />
        <TextInput
          style={[
            styles.input,
            { borderColor: themeObj.border, backgroundColor: themeObj.background, color: themeObj.text },
          ]}
          placeholder="Author"
          placeholderTextColor={themeObj.textSecondary}
          value={author}
          onChangeText={handleAuthorChange}
        />
        {selectedBook && (
          <View style={[styles.selectedPill, { backgroundColor: themeObj.muted }]}>
            <Ionicons name="checkmark-circle" size={18} color={themeObj.primary} />
            <Text style={[styles.selectedText, { color: themeObj.text }]}>Selected from Open Library</Text>
          </View>
        )}
      </View>

      {searchLoading && <ActivityIndicator color={themeObj.primary} style={{ marginBottom: 12 }} />}

      {searchResults.length > 0 && (title.trim() !== '' || author.trim() !== '') && (
        <FlatList
          data={searchResults.slice(0, 5)}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => {
            const alreadyAdded = books.some((book: BookInput) =>
              (item.key && book.open_library_id && book.open_library_id === item.key.replace('/works/', '')) ||
              (Array.isArray(item.isbn) && book.isbn_13 && item.isbn.includes(book.isbn_13)) ||
              (book.title === item.title && book.author === (item.author_name?.[0] || '')),
            );

            return (
              <TouchableOpacity
                style={[
                  styles.searchItem,
                  { backgroundColor: themeObj.card, borderColor: themeObj.border },
                  alreadyAdded && { opacity: 0.5 },
                ]}
                onPress={() => !alreadyAdded && handleSelectBook(item)}
                disabled={alreadyAdded}
              >
                {item.cover_i ? (
                  <Image source={{ uri: getCoverUrl(item.cover_i, 'S') }} style={styles.resultCover} />
                ) : (
                  <View style={[styles.resultCover, { backgroundColor: themeObj.muted }]}>
                    <Ionicons name="book-outline" size={18} color={themeObj.primary} />
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
                {alreadyAdded ? (
                  <Ionicons name="checkmark-circle" size={22} color={themeObj.accent} style={{ marginLeft: 6 }} />
                ) : (
                  <Ionicons name="add-circle-outline" size={22} color={themeObj.primary} style={{ marginLeft: 6 }} />
                )}
              </TouchableOpacity>
            );
          }}
          style={styles.resultsList}
          keyboardShouldPersistTaps="handled"
        />
      )}

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: themeObj.primary }]}
        onPress={handleAddBook}
        disabled={isPending}
      >
        <Ionicons name="add" size={20} color="#12100d" />
        <Text style={styles.addButtonText}>{isPending ? 'Adding' : 'Add to Library'}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    flex: 1,
    justifyContent: 'flex-start',
    padding: 20,
  },
  header: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 16,
  },
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    padding: 14,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 12,
    padding: 12,
    width: '100%',
  },
  selectedPill: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectedText: {
    fontSize: 13,
    fontWeight: '700',
  },
  resultsList: {
    maxHeight: 330,
    width: '100%',
  },
  searchItem: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 10,
  },
  resultCover: {
    alignItems: 'center',
    borderRadius: 4,
    height: 52,
    justifyContent: 'center',
    marginRight: 12,
    width: 36,
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  searchAuthor: {
    fontSize: 14,
    marginTop: 2,
  },
  addButton: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 14,
  },
  addButtonText: {
    color: '#12100d',
    fontSize: 16,
    fontWeight: '800',
  },
});
