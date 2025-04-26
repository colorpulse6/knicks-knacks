import express from 'express';
import { getProgress, upsertProgress } from '../controllers/progress.controller';

const router = express.Router();

router.get('/', getProgress);
router.post('/', upsertProgress);

export default router;
