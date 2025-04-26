import AppNavigation from './navigation';
import AppHeader from './components/AppHeader';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppHeader />
      <AppNavigation />
    </QueryClientProvider>
  );
}
