import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, KeyboardAvoidingView, Platform, FlatList, TouchableOpacity, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useAddBook } from '../hooks/useAddBook';
import { searchBooks, getCoverUrl, OpenLibraryDoc } from '../services/openLibrary';
import useTheme from '../hooks/useTheme';

const API_URL = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL;

export default function AddBookScreen() {
  const { themeObj } = useTheme();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [openLibraryId, setOpenLibraryId] = useState('');
  const { mutate: addBook, isPending } = useAddBook(() => {
    setTitle('');
    setAuthor('');
    setCoverUrl('');
    setOpenLibraryId('');
    setSearchResults([]);
    setSearchLoading(false);
  });

  // Open Library search state
  const [searchResults, setSearchResults] = useState<OpenLibraryDoc[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

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

  const handleSelectBook = (book: OpenLibraryDoc) => {
    setTitle(book.title || '');
    setAuthor((book.author_name && book.author_name[0]) || '');
    setCoverUrl(book.cover_i ? getCoverUrl(book.cover_i, 'M') : '');
    setOpenLibraryId(book.key ? book.key.replace('/works/', '') : '');
    setSearchResults([]);
  };

  const handleAddBook = () => {
    if (!title || !author) {
      // Validation handled in hook's onError for consistency
      return;
    }
    addBook({
      title,
      author,
      cover_url: coverUrl,
      open_library_id: openLibraryId,
    });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: themeObj.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={64} // adjust as needed for header
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
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
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.searchItem, { backgroundColor: themeObj.background, borderBottomColor: themeObj.border }]} onPress={() => handleSelectBook(item)}>
                {item.cover_i && (
                  <View style={{ marginRight: 8 }}>
                    <Image
                      source={{ uri: getCoverUrl(item.cover_i, 'S') }}
                      style={{ width: 32, height: 48, borderRadius: 4 }}
                      resizeMode="cover"
                    />
                  </View>
                )}
                <View>
                  <Text style={[styles.searchTitle, { color: themeObj.text }]}>{item.title}</Text>
                  <Text style={[styles.searchAuthor, { color: themeObj.text }]}>{item.author_name?.[0]}</Text>
                </View>
              </TouchableOpacity>
            )}
            style={{ maxHeight: 220, width: '100%' }}
            keyboardShouldPersistTaps="handled"
          />
        )}
        <Button title={isPending ? 'Adding...' : 'Add Book'} onPress={handleAddBook} disabled={isPending} color={themeObj.primary} />
      </ScrollView>
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
