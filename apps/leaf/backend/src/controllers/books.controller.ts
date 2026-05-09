import { Request, Response, RequestHandler } from 'express';
import { supabase } from '../supabaseClient';
import {
  getScopedBookFilter,
  normalizeBookInsert,
  parseBookUpdate,
} from '../utils/books';

function getRequestUserId(req: Request): string | undefined {
  const bodyUserId = req.body?.user_id;
  const queryUserId = req.query.user_id;
  const headerUserId = req.headers['x-device-user-id'];

  if (typeof bodyUserId === 'string') return bodyUserId;
  if (typeof queryUserId === 'string') return queryUserId;
  if (typeof headerUserId === 'string') return headerUserId;
  return undefined;
}

function sendValidationError(res: Response, error: unknown): boolean {
  if (
    error instanceof Error &&
    (/invalid/i.test(error.message) ||
      /valid id/i.test(error.message) ||
      /at least one field/i.test(error.message))
  ) {
    res.status(400).json({ error: error.message });
    return true;
  }

  return false;
}

export const getBooks: RequestHandler = async (req: Request, res:Response) => {
  const userId = req.query.user_id as string | undefined;
  if (!userId) {
    res.status(400).json({ error: 'user_id is required' });
    return;
  }
  const query = supabase
    .from('books')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
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
  const user_id = getRequestUserId(req);
  if (!user_id) {
    res.status(400).json({ error: 'user_id is required (in body or x-device-user-id header)' });
    return;
  }

  let insertObj: ReturnType<typeof normalizeBookInsert>;
  try {
    insertObj = normalizeBookInsert(req.body, user_id);
  } catch (error) {
    if (sendValidationError(res, error)) return;
    throw error;
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

export const updateBook: RequestHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user_id = getRequestUserId(req);

  if (!id || !user_id) {
    res.status(400).json({ error: 'Book id and user_id are required' });
    return;
  }

  let scopedFilter: ReturnType<typeof getScopedBookFilter>;
  let updatePayload: ReturnType<typeof parseBookUpdate>;

  try {
    scopedFilter = getScopedBookFilter(id, user_id);
    updatePayload = parseBookUpdate(req.body);
  } catch (error) {
    if (sendValidationError(res, error)) return;
    throw error;
  }

  const { data, error } = await supabase
    .from('books')
    .update(updatePayload)
    .match(scopedFilter)
    .select('*')
    .maybeSingle();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (!data) {
    res.status(404).json({ error: 'Book not found' });
    return;
  }

  res.json(data);
};

export const deleteBook: RequestHandler = async (req:Request, res:Response) => {
  const { id } = req.params;
  const user_id = getRequestUserId(req);
  if (!id || !user_id) {
    res.status(400).json({ error: 'Book id and user_id are required' });
    return;
  }

  let scopedFilter: ReturnType<typeof getScopedBookFilter>;
  try {
    scopedFilter = getScopedBookFilter(id, user_id);
  } catch (error) {
    if (sendValidationError(res, error)) return;
    throw error;
  }

  const { data, error } = await supabase
    .from('books')
    .delete()
    .match(scopedFilter)
    .select();
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
