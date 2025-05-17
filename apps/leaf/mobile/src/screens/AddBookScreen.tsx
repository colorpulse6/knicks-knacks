import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, KeyboardAvoidingView, Platform, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useAddBook } from '../hooks/useAddBook';
import { searchBooks, getCoverUrl, OpenLibraryDoc } from '../services/openLibrary';
import useTheme from '../hooks/useTheme';
import { BookInput } from '../services/api';
import { useQuery } from '@tanstack/react-query';
import { fetchBooks } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL;

export default function AddBookScreen() {
  const { themeObj } = useTheme();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [openLibraryId, setOpenLibraryId] = useState('');
  const [selectedBook, setSelectedBook] = useState<BookInput | null>(null);
  const { mutate: addBook, isPending } = useAddBook(() => {
    setTitle('');
    setAuthor('');
    setCoverUrl('');
    setOpenLibraryId('');
    setSearchResults([]);
    setSearchLoading(false);
    setSelectedBook(null);
  });

  // Open Library search state
  const [searchResults, setSearchResults] = useState<OpenLibraryDoc[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch current books for duplicate check
  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: fetchBooks,
  });

  const handleSearch = async (nextTitle?: string, nextAuthor?: string) => {
    const t = typeof nextTitle === 'string' ? nextTitle : title;
    const a = typeof nextAuthor === 'string' ? nextAuthor : author;
    if (!t && !a) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const data = await searchBooks({ title: t, author: a, limit: 10 });
      setSearchResults(data.docs || []);
    } catch (err) {
      console.error('Open Library search error:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

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
    // Only require title and author for manual add
    if (!title || !author) {
      alert('Please enter a title and author, or select a book from search results.');
      return;
    }
    console.log("SELECTED BOOK", selectedBook)
    if (selectedBook) {
      addBook(selectedBook);
    } else {
      // Send a full BookInput object, even if some fields are undefined
      addBook({
        title,
        author,
        cover_url: coverUrl || undefined,
        open_library_id: openLibraryId || undefined,
        subtitle: undefined,
        author_key: undefined,
        description: undefined,
        isbn_10: undefined,
        isbn_13: undefined,
        publish_date: undefined,
        publisher: undefined,
        page_count: undefined,
        subjects: undefined,
        language: undefined,
        series: undefined,
        goodreads_id: undefined,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: themeObj.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={64} // adjust as needed for header
    >
      <View style={{ width: '100%' }}>
        <TextInput
          style={[styles.input, { borderColor: themeObj.border, backgroundColor: themeObj.background, color: themeObj.text }]}
          placeholder="Title"
          placeholderTextColor={themeObj.textSecondary}
          value={title}
          onChangeText={t => {
            setTitle(t);
            handleSearch(t, author);
          }}
        />
        <TextInput
          style={[styles.input, { borderColor: themeObj.border, backgroundColor: themeObj.background, color: themeObj.text }]}
          placeholder="Author"
          placeholderTextColor={themeObj.textSecondary}
          value={author}
          onChangeText={a => {
            setAuthor(a);
            handleSearch(title, a);
          }}
        />
        {/* Autocomplete/Search Results */}
        {searchLoading && <ActivityIndicator style={{marginBottom: 12}} />}
      </View>
      {searchResults.length > 0 && (title.trim() !== '' || author.trim() !== '') && (
        <FlatList
          data={searchResults.slice(0, 5)}
          keyExtractor={item => item.key}
          renderItem={({ item }) => {
            // Check if this book is already in the user's list
            const alreadyAdded = books.some((b: BookInput) =>
              (item.key && b.open_library_id && b.open_library_id === item.key.replace('/works/', '')) ||
              (Array.isArray(item.isbn) && b.isbn_13 && item.isbn.includes(b.isbn_13)) ||
              (b.title === item.title && b.author === (item.author_name?.[0] || ''))
            );
            return (
              <TouchableOpacity
                style={[styles.searchItem, alreadyAdded && { opacity: 0.5 }]}
                onPress={() => !alreadyAdded && handleSelectBook(item)}
                disabled={alreadyAdded}
              >
                {item.cover_i ? (
                  <Image source={{ uri: getCoverUrl(item.cover_i, 'S') }} style={{ width: 30, height: 45, borderRadius: 4, marginRight: 12 }} />
                ) : (
                  <View style={{ width: 30, height: 45, borderRadius: 4, backgroundColor: themeObj.card, marginRight: 12 }} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.searchTitle}>{item.title}</Text>
                  <Text style={styles.searchAuthor}>{item.author_name?.[0]}</Text>
                </View>
                {alreadyAdded && (
                  <Ionicons name="checkmark-circle" size={22} color="green" style={{ marginLeft: 6 }} />
                )}
              </TouchableOpacity>
            );
          }}
          style={{ maxHeight: 300, width: '100%' }}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={null}
          ListFooterComponent={null}
        />
      )}
      <Button title={isPending ? 'Adding...' : 'Add Book'} onPress={handleAddBook} disabled={isPending} color={themeObj.primary} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    padding: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchAuthor: {
    fontSize: 14,
  },
});
