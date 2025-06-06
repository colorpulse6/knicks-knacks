import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getDeviceUserId } from '../utils/deviceUser';

// API URL configuration
const isDevelopment = __DEV__;
const API_URLS = {
  development: {
    android: 'http://10.0.2.2:4000', // Update port if needed
    ios: 'http://localhost:4000',
    physical: 'http://192.168.136.109:4000', // Update with your local IP and port
  },
  production: 'https://knick-knacks-leaf-production.up.railway.app', // Update with your production URL
};

let API_URL: string;
if (isDevelopment) {
  const isExpoGoOrStandalone =
    Constants.executionEnvironment === 'storeClient' ||
    Constants.executionEnvironment === 'standalone';
    
  const isPhysicalDeviceEnvironment =
    isExpoGoOrStandalone || !Constants.executionEnvironment;
  if (isPhysicalDeviceEnvironment) {
    API_URL = API_URLS.development.physical;
  } else {
    API_URL =
      Platform.OS === 'android'
        ? API_URLS.development.android
        : API_URLS.development.ios;
  }
} else {
  API_URL = API_URLS.production;
}

// --- BookInput type for strong typing across the app ---
export type BookInput = {
  title: string;
  subtitle?: string;
  author: string;
  author_key?: string;
  description?: string;
  cover_url?: string;
  open_library_id?: string;
  isbn_10?: string;
  isbn_13?: string;
  publish_date?: string;
  publisher?: string;
  page_count?: number;
  subjects?: string[];
  language?: string;
  series?: string;
  goodreads_id?: string;
};

/**
 * Fetches books from the API.
 *
 * @returns {Promise<Object[]>} A promise resolving to an array of book objects.
 */
export async function fetchBooks() {
  const user_id = await getDeviceUserId();
  const url = `${API_URL}/books?user_id=${encodeURIComponent(user_id)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    console.error('Failed to fetch books:', res.status, text, 'URL:', url);
    throw new Error('Failed to fetch books');
  }
  return res.json();
}

/**
 * Adds a new book to the API.
 *
 * @param {BookInput} book - The book object to add.
 * @returns {Promise<Object>} A promise resolving to the added book object.
 */
export async function addBook(book: BookInput) {
  console.log("ADDING BOOK", book)
  const user_id = await getDeviceUserId();
  const url = `${API_URL}/books`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...book, user_id }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('Failed to add book:', res.status, text, 'URL:', url);
    throw new Error('Failed to add book');
  }
  return res.json();
}

/**
 * Deletes a book by id from the API.
 *
 * @param {string} id - The id of the book to delete.
 * @param {string} user_id - The user_id of the book owner.
 * @returns {Promise<boolean>} A promise resolving to true if the book was deleted successfully.
 */
export async function deleteBook(id: string, user_id: string) {
  const url = `${API_URL}/books/${id}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id }),
  });
  const text = await res.text();
  console.log('[deleteBook] URL:', url, 'Status:', res.status, 'Response:', text);
  if (!res.ok) {
    console.error('Failed to delete book:', res.status, text);
    throw new Error('Failed to delete book');
  }
  return true;
}

/**
 * Initializes a user in the backend (upsert).
 * @param {string} user_id - The device user id to initialize.
 * @returns {Promise<void>} Resolves when the user is initialized.
 */
export async function initUser(user_id: string): Promise<void> {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('Failed to initialize user:', res.status, text);
    throw new Error('Failed to initialize user');
  }
}
