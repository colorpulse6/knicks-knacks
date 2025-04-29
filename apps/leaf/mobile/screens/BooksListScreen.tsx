import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBooks, deleteBook } from '../services/api';
import useTheme from '../hooks/useTheme';
import dayjs from 'dayjs';

export default function BooksListScreen() {
  const { themeObj } = useTheme();
  const [expandedYears, setExpandedYears] = useState<{ [year: string]: boolean }>({});

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

  useEffect(() => {
    if (books && books.length > 0) {
      const currentYear = dayjs().format('YYYY');
      setExpandedYears((prev) => {
        // Only set if it's not already set (e.g., user toggled)
        if (prev[currentYear]) return prev;
        return { ...prev, [currentYear]: true };
      });
    }
  }, [books]);

  const queryClient = useQueryClient();
  const { mutate: removeBook, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });

  // Group books by year and then by month
  const groupedBooks = books?.reduce((acc: any, book: any) => {
    const date = dayjs(book.created_at);
    const year = date.format('YYYY');
    const month = date.format('MMMM');
    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = [];
    acc[year][month].push(book);
    return acc;
  }, {}) || {};

  const toggleYear = (year: string) => {
    setExpandedYears((prev) => ({ ...prev, [year]: !prev[year] }));
  };

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

  // Render grouped books by year and month
  return (
    <View style={{ flex: 1, backgroundColor: themeObj.background }}>
      <FlatList
        data={Object.keys(groupedBooks).sort((a, b) => Number(b) - Number(a))}
        keyExtractor={year => year}
        renderItem={({ item: year }) => (
          <View>
            <TouchableOpacity onPress={() => toggleYear(year)} style={{ padding: 12, backgroundColor: themeObj.card, borderBottomWidth: 1, borderColor: themeObj.border }}>
              <Text style={{ color: themeObj.text, fontWeight: 'bold', fontSize: 18 }}>{year} {expandedYears[year] ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {expandedYears[year] && (
              <View style={{ paddingLeft: 12 }}>
                {Object.keys(groupedBooks[year]).sort((a, b) => dayjs(b, 'MMMM').month() - dayjs(a, 'MMMM').month()).map(month => (
                  <View key={month} style={{ marginBottom: 12 }}>
                    <Text style={{ color: themeObj.textSecondary, fontWeight: '600', fontSize: 16, marginTop: 8 }}>{month}</Text>
                    {groupedBooks[year][month].map((item: any) => (
                      <View key={item.id} style={[styles.bookItem, { backgroundColor: themeObj.card, borderColor: themeObj.border }]}>
                        {item.cover_url ? (
                          <Image source={{ uri: item.cover_url }} style={styles.coverImg} />
                        ) : null}
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.title, { color: themeObj.text }]}>{item.title}</Text>
                          <Text style={[styles.author, { color: themeObj.textSecondary }]}>{item.author}</Text>
                          <Text style={{ color: themeObj.textSecondary, fontSize: 12 }}>
                            Finished on {dayjs(item.created_at).format('MMMM D, YYYY')}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => removeBook(item.id)}
                          style={{ marginLeft: 8, padding: 8 }}
                          disabled={isDeleting}
                        >
                          <Text style={{ color: themeObj.accent, fontWeight: 'bold' }}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: themeObj.textSecondary, textAlign: 'center', marginTop: 32 }}>No books found.</Text>}
      />
    </View>
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
