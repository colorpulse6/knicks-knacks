-- Migration: Initial schema for Leaf app

-- Users table (Supabase Auth provides users, but we can extend if needed)

-- Books table
CREATE TABLE books (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    author text NOT NULL,
    cover_url text,
    open_library_id text,
    created_at timestamp with time zone DEFAULT now()
);
CREATE INDEX idx_books_user_id ON books(user_id);

-- Progress table
CREATE TABLE progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id uuid REFERENCES books(id) ON DELETE CASCADE,
    pages_read integer NOT NULL DEFAULT 0,
    chapters_read integer,
    percent_complete real NOT NULL DEFAULT 0,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT unique_progress UNIQUE (user_id, book_id)
);
CREATE INDEX idx_progress_user_id ON progress(user_id);
CREATE INDEX idx_progress_book_id ON progress(book_id);

-- Recommendations table
CREATE TABLE recommendations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id uuid REFERENCES books(id) ON DELETE CASCADE,
    reason text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);
CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX idx_recommendations_book_id ON recommendations(book_id);
