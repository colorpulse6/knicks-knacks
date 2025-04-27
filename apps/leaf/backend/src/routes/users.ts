import express from 'express';
import { upsertUser } from '../controllers/users.controller';

const router = express.Router();

router.post('/', upsertUser);

export default router;
