// Shared navigation types for stack and tab navigation
export type RootStackParamList = {
  BooksList: undefined;
  BookDetails: { book: any };
};

export type RootTabParamList = {
  AddBook: undefined;
  Books: undefined;
  Profile: undefined;
};
