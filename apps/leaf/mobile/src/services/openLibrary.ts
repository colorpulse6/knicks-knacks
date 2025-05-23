// Utility functions for querying Open Library's public API

const OPEN_LIBRARY_BASE = 'https://openlibrary.org';

// Update this string with your actual contact email
const OPEN_LIBRARY_USER_AGENT = 'LeafApp/1.0 (contact: colorpulse@gmail.com)';

export interface OpenLibraryDoc {
  cover_i?: number;
  has_fulltext?: boolean;
  edition_count?: number;
  title: string;
  author_name?: string[];
  author_key: string[]; 
  first_publish_year?: number;
  key: string;
  ia?: string[];
  public_scan_b?: boolean;
  isbn?: string[];
}

export interface OpenLibrarySearchResponse {
  start: number;
  num_found: number;
  docs: OpenLibraryDoc[];
}

export async function searchBooks({ title, author, query, page = 1, limit = 10 }: { title?: string; author?: string; query?: string; page?: number; limit?: number }): Promise<OpenLibrarySearchResponse> {
  let url = `${OPEN_LIBRARY_BASE}/search.json?`;
  if (title) url += `title=${encodeURIComponent(title)}&`;
  if (author) url += `author=${encodeURIComponent(author)}&`;
  if (query) url += `q=${encodeURIComponent(query)}&`;
  if (page) url += `page=${page}&`;
  if (limit) url += `limit=${limit}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': OPEN_LIBRARY_USER_AGENT,
    },
  });
  if (!res.ok) throw new Error('Failed to search Open Library');
  return res.json();
}

export async function searchAuthors(query: string) {
  const url = `${OPEN_LIBRARY_BASE}/search/authors.json?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': OPEN_LIBRARY_USER_AGENT,
    },
  });
  if (!res.ok) throw new Error('Failed to search authors');
  return res.json();
}

export async function getWorksByAuthor(authorName: string, language?: string) {
  let url = `${OPEN_LIBRARY_BASE}/search.json?q=author:${encodeURIComponent(authorName)}`;
  if (language) {
    url += `&lang=${encodeURIComponent(language)}`;
  }
  url += '&limit=20';
  const res = await fetch(url, {
    headers: {
      'User-Agent': OPEN_LIBRARY_USER_AGENT,
    },
  });
  if (!res.ok) throw new Error('Failed to search Open Library by author');
  return res.json();
}

export function getCoverUrl(coverId: string | number, size: 'S' | 'M' | 'L' = 'M') {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

export function getCoverUrlByOlid(olid: string, size: 'S' | 'M' | 'L' = 'M') {
  return `https://covers.openlibrary.org/b/olid/${olid}-${size}.jpg`;
}

export function getAuthorImageUrl(authorId: string) {
  return `${OPEN_LIBRARY_BASE}/authors/${authorId}/photo.jpg`;
}
