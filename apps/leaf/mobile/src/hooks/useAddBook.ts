import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { addBook, BookInput } from '../services/api';

export const BOOKS_QUERY_KEY = ['books'];

export function useAddBook(onSuccess?: (data: any) => void) {
  const queryClient = useQueryClient();
  return useMutation<BookInput, any, BookInput>({
    mutationFn: (book: BookInput) => addBook(book),
    onSuccess: (data) => {
      if (onSuccess) onSuccess(data);
      queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY });
      Alert.alert('Success', 'Book added!');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to add book');
    },
  });
}
