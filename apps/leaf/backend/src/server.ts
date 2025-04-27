import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import booksRouter from './routes/books';
import progressRouter from './routes/progress';
import usersRouter from './routes/users';

const app = express();
app.use(cors());
app.use(express.json());

// Mount all API routes under /api for consistency with calorie-cam
app.use('/api/books', booksRouter);
app.use('/api/progress', progressRouter);
app.use('/api/users', usersRouter);

// Move healthcheck under /api as well
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Leaf backend running on port ${PORT}`);
});
