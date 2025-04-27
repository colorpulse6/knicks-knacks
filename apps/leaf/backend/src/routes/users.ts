import express from 'express';
import { upsertUser } from '../controllers/users.controller';

const router = express.Router();

// POST /users - upsert user by id
router.post('/', upsertUser);

export default router;
