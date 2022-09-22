import express from 'express';
import cors from 'cors';
import dayjs from 'dayjs';

import joi from 'joi'
import db from './database/database.js';
import { ObjectId } from 'mongodb';

const app = express();

app.use(express.json())
app.use(cors())

const titleSchema = joi.object({
    title: joi.string().min(1).required(),
    expireAt: joi.date().iso()
})

const choiceSchema = joi.object({
    title: joi.string().min(1).required(),
    pollId: joi.string().hex().length(24).required()
})

app.post('/poll', async (req, res) => {

    let { title, expireAt } = req.body

    if (!expireAt) {
        const defaultExpireAt = dayjs().add(30, 'days').format('YYYY-MM-DD HH:mm')
        expireAt = defaultExpireAt
    }

    const validation = titleSchema.validate({ title, expireAt })
    if (validation.error) {
        if (validation.error.details[0].message.includes('empty')) {
            return res.status(422)
                .send(validation.error.details[0].message)
        }

        return res.status(422)
            .send(validation.error.details[0].message)
    }

    try {
        await db.collection('polls').insertOne({
            title,
            expireAt
        })
    } catch (error) {
        console.log(error)
    }
    res.sendStatus(201)

})

app.get('/poll', async (req, res) => {

    try {
        const polls = await db.collection('polls').find().toArray()
        res.send(polls).status(200)
    } catch (error) {

    }
})

app.post('/choice', async (req, res) => {
    const { title, pollId } = req.body

    const validation = choiceSchema.validate({ title, pollId })

    if (validation.error) {
        if (validation.error.details[0].message.includes('empty')) {
            return res.status(422)
                .send(validation.error.details[0].message)
        }
        return res.sendStatus(422)
    }

    const pollExists = await db.collection('polls').findOne({ _id: ObjectId(pollId) })
    console.log(pollExists)
    if (!pollExists) return res.sendStatus(404)

    const choiceExists = await db.collection('choices').findOne({
        title, pollId: ObjectId(pollId)
    })
    if (choiceExists) return res.sendStatus(409)

    const isExpired = dayjs().isAfter(dayjs(pollExists.expireAt))
    if (isExpired) return res.sendStatus(403)

    await db.collection('choices').insertOne({ title, pollId: ObjectId(pollId) })
    res.sendStatus(201)
})

app.get('/poll/:id/choice', async (req, res) => {

    const { id } = req.params

    const pollExists = await db.collection('polls').findOne({ _id: ObjectId(id) })
    if (!pollExists) return res.sendStatus(404)

    const choices = await db.collection('choices').find({ pollId: ObjectId(id) }).toArray()

    res.status(200).send(choices)
})

app.post('/choice/:id/vote', async (req, res) => {
    const { id } = req.params();

    const choiceExists = await db.collection('choices').findOne({ _id: ObjectId(id) })
    if (!choiceExists) return res.status(404)

    const poll = await db.collection('polls').findOne({ _id: ObjectId(choiceExists.pollId) })
    const isExpired = poll.expireAt.isBefore(new dayjs())
    if (isExpired) return res.status(403)

    const createdAt = dayjs().format('YYYY-MM-DD HH:mm')

    await db.collection('votes').insertOnde({
        choiceId: choiceExists._id,
        createdAt
    })
    res.status(201)

})

app.get('/poll/:id/result', async (req, res) => {

    const { id } = req.params()

    const pollExists = await db.collection('polls').findOne({ _id: ObjectId(id) })
    if (!pollExists) return res.status(404)

    const choices = await db.collection('votes').find({ pollId: ObjectId(id) }).toArray().map(choice => choice._id)

    // const numVotes = choices.forEach(async (choice) => {
    //     const votes = await db.collection('votes').find({_id: ObjectId(choice)})
    // })
    // for (let i = 0; i < choices.length; i++) {
    //     const 
    // }

    res.status(200).send({
        ...pollExists,
        result: {
            //Não ta certo
            title: choices[0],
            vote: choices[0]
        }
    })
})

app.delete('/poll', async (req, res) => {
    try {
        await db.collection('choices').remove()
    } catch (error) {

    }
})

app.listen(3000, console.log('Listening on port 3000'))