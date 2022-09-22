import dayjs from 'dayjs';
import joi from 'joi'
import db from '../database/database.js';

const titleSchema = joi.object({
    title: joi.string().min(1).required(),
    expireAt: joi.date().iso()
})

const idSchema = joi.object({
    id: joi.string().hex().length(24).required()
})

const createPoll = async (req, res) => {

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
}

const findPoll = async (req, res) => {

    try {
        const polls = await db.collection('polls').find().toArray()
        res.send(polls).status(200)
    } catch (error) {
        console.log(error)
    }
}

const deletePoll = async (req, res) => {
    const { id } = req.params
    try {
        await db.collection('polls').deleteOne({ _id: ObjectId(id) })
    } catch (error) {
        console.log(error);
    }
    res.sendStatus(200)
}

export { createPoll, findPoll, deletePoll }