import express, { json } from 'express';
import cors from 'cors';
import db from './database/database.js';

const app = express();

app.use(express(json))
app.use(cors())

app.post('/poll', (req, res) => { })
app.get('/poll', (req, res) => { })

app.post('/choice', (req, res) => { })
app.get('/poll/:id/choice', (req, res) => { })
app.post('/choice/:id/vote', (req, res) => { })
app.get('/poll/:id/result', (req, res) => { })

app.listen(5000, console.log('Listening on port 5000'))