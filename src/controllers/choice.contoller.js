import dayjs from 'dayjs';
import joi from 'joi'
import db from '../database/database.js';
import { ObjectId } from 'mongodb';

const choiceSchema = joi.object({
    title: joi.string().min(1).required(),
    pollId: joi.string().hex().length(24).required()
})

const idSchema = joi.object({
    id: joi.string().hex().length(24).required()
})

const createChoice = async (req, res) => {
    const { title, pollId } = req.body

    const validation = choiceSchema.validate({ title, pollId })

    if (validation.error) {
        if (validation.error.details[0].message.includes('empty')) {
            return res.status(422)
                .send(validation.error.details[0].message)
        }
        return res.sendStatus(422)
    }

    try {
        const pollExists = await db.collection('polls').findOne({ _id: ObjectId(pollId) })
        if (!pollExists) return res.sendStatus(404)

        const choiceExists = await db.collection('choices').findOne({
            title, pollId: ObjectId(pollId)
        })
        if (choiceExists) return res.sendStatus(409)

        const isExpired = dayjs().isAfter(dayjs(pollExists.expireAt))
        if (isExpired) return res.sendStatus(403)

        await db.collection('choices').insertOne({ title, pollId: ObjectId(pollId) })
        res.sendStatus(201)

    } catch (error) {
        console.log(error)
    }
}

const findChoice = async (req, res) => {

    const { id } = req.params

    const validation = idSchema.validate({ id })

    if (validation.error) return res.status(422).send(validation.error.details[0].message)

    try {
        const pollExists = await db.collection('polls').findOne({ _id: ObjectId(id) })
        if (!pollExists) return res.sendStatus(404)

        const choices = await db.collection('choices').find({ pollId: ObjectId(id) }).toArray()

        res.status(200).send(choices)

    } catch (error) {
        console.log(error)
    }
}

const deleteChoice = async (req, res) => {
    const { id } = req.params

    const validation = idSchema.validate({ id })

    if (validation.error) return res.status(422).send(validation.error.details[0].message)

    try {
        const choiceExists = await db.collection('choices').findOne({ _id: ObjectId(id) })
        if (!choiceExists) return res.sendStatus(404)

        await db.collection('choices').deleteOne({ _id: ObjectId(id) })
    } catch (error) {
        console.log(error);
    }
    res.sendStatus(200)
}

export { createChoice, findChoice, deleteChoice }