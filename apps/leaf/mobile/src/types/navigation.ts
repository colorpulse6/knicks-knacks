// Shared navigation types for stack and tab navigation
import type { BookRecord } from '../services/api';

export type RootStackParamList = {
  BooksList: undefined;
  BookDetails: { book: BookRecord };
};

export type RootTabParamList = {
  AddBook: undefined;
  Books: undefined;
  Profile: undefined;
};
