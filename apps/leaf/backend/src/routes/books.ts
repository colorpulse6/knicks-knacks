import express from 'express';
import {
  getBooks,
  addBook,
  deleteBook,
  updateBook,
} from '../controllers/books.controller';

const router = express.Router();

router.get('/', getBooks);
router.post('/', addBook);
router.patch('/:id', updateBook);
router.delete('/:id', deleteBook);

export default router;
