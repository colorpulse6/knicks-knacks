import { Request, Response,RequestHandler } from 'express';
import { supabase } from '../supabaseClient';

// POST /users - upsert user by id
export const upsertUser: RequestHandler = async (req: Request, res: Response) => {
  const { user_id } = req.body;
  if (!user_id) {
    res.status(400).json({ error: 'user_id is required' });
    return;
  }
  const { error } = await supabase
    .from('users')
    .upsert([{ id: user_id }], { onConflict: 'id' });
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.status(200).json({ status: 'ok' });
};  
