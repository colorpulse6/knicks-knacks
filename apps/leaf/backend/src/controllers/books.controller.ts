// Controller for book-related logic in Leaf app
import { Request, Response, RequestHandler } from 'express';
import { supabase } from '../supabaseClient';

export const getBooks: RequestHandler = async (req, res) => {
  const userId = req.query.user_id as string | undefined;
  let query = supabase.from('books').select('*');
  if (userId) {
    query = query.eq('user_id', userId);
  }
  const { data, error } = await query;
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json(data || []);
  return;
};

export const addBook: RequestHandler = async (req, res) => {
  const { user_id, title, author, cover_url, open_library_id } = req.body;
  // Only include user_id if provided
  const insertObj: any = { title, author, cover_url, open_library_id };
  if (user_id) {
    insertObj.user_id = user_id;
  }
  const { data, error } = await supabase
    .from('books')
    .insert([insertObj])
    .select();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.status(201).json(data?.[0]);
  return;
};

export const deleteBook: RequestHandler = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: 'Book id is required' });
    return;
  }
  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', id);
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.status(204).send();
};
