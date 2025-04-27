import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import booksRouter from './routes/books';
import progressRouter from './routes/progress';
import usersRouter from './routes/users';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/books', booksRouter);
app.use('/progress', progressRouter);
app.use('/users', usersRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Leaf backend running on port ${PORT}`);
});
