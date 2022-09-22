import express from 'express';

import { handleVote, showResult } from '../controllers/vote.controller';

const router = express.Router()

router.post('/choice/:id/vote', handleVote)
router.get('/poll/:id/result', showResult)

export default router