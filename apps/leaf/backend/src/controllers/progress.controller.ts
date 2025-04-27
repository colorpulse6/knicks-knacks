import { Request, Response } from 'express';
import { supabase } from '../supabaseClient';

export const getProgress = async (req: Request, res: Response) => {
  const { user_id, book_id } = req.query;
  let query = supabase.from('progress').select('*');
  if (user_id) query = query.eq('user_id', user_id);
  if (book_id) query = query.eq('book_id', book_id);
  const { data, error } = await query;
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json(data);
  return;
};

export const upsertProgress = async (req: Request, res: Response) => {
  const { user_id, book_id, pages_read, chapters_read, percent_complete } = req.body;
  const { data, error } = await supabase
    .from('progress')
    .upsert([
      { user_id, book_id, pages_read, chapters_read, percent_complete }
    ], { onConflict: 'user_id,book_id' })
    .select();
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.status(200).json(data?.[0]);
  return;
};
