import AppNavigation from './navigation';
import AppHeader from './components/AppHeader';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { getDeviceUserId } from './utils/deviceUser';
import { ThemeProvider } from './context/ThemeContext';

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    getDeviceUserId();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppHeader />
        <AppNavigation />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
