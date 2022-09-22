import express from 'express';

import { createChoice, findChoice, deleteChoice } from '../controllers/choice.contoller.js';

const router = express.Router()

router.post('/choice', createChoice)
router.get('/poll/:id/choice', findChoice)
router.delete('/choice/:id', deleteChoice)

export default router