import { Request, Response, RequestHandler } from 'express';
import { supabase } from '../supabaseClient';

export const getBooks: RequestHandler = async (req: Request, res:Response) => {
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

export const addBook: RequestHandler = async (req: Request, res: Response) => {
  // Try to get user_id from body, else from header
  let user_id = req.body.user_id;
  if (!user_id) {
    user_id = req.headers['x-device-user-id'] as string | undefined;
  }
  // Destructure all possible BookInput fields
  const {
    id,
    title,
    subtitle,
    author,
    author_key,
    description,
    cover_url,
    open_library_id,
    isbn_10,
    isbn_13,
    publish_date,
    publisher,
    page_count,
    subjects,
    language,
    series,
    goodreads_id
  } = req.body;
  if (!user_id) {
    res.status(400).json({ error: 'user_id is required (in body or x-device-user-id header)' });
    return;
  }
  // Build insertObj without id
  const insertObj: any = {
    user_id,
    title,
    subtitle,
    author,
    author_key,
    description,
    cover_url,
    open_library_id,
    isbn_10,
    isbn_13,
    publish_date,
    publisher,
    page_count,
    subjects,
    language,
    series,
    goodreads_id
  };
  // Remove id if present (should never be sent)
  if ('id' in insertObj) {
    delete insertObj.id;
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

export const deleteBook: RequestHandler = async (req:Request, res:Response) => {
  const { id } = req.params;
  const { user_id } = req.body;
  console.log('[deleteBook controller] id param:', id, 'user_id:', user_id);
  if (!id || !user_id) {
    res.status(400).json({ error: 'Book id and user_id are required' });
    return;
  }
  const { data, error } = await supabase
    .from('books')
    .delete()
    .eq('id', id)
    .eq('user_id', user_id)
    .select();
  console.log('[deleteBook controller] delete result:', { data, error });
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  if (!data || data.length === 0) {
    res.status(404).json({ error: 'No book deleted (not found or not permitted)' });
    return;
  }
  res.status(204).send();
};
