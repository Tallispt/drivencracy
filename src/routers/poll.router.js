import express from 'express';

import { createPoll, findPoll, deletePoll } from '../controllers/poll.controller.js';

const router = express.Router()

router.post('/poll', createPoll)
router.get('/poll', findPoll)
router.delete('/poll:id', deletePoll)

export default router