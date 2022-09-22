import dayjs from 'dayjs';
import joi from 'joi';
import db from '../database/database.js';
import { ObjectId } from 'mongodb';

const idSchema = joi.object({
    id: joi.string().hex().length(24).required()
})

const handleVote = async (req, res) => {
    const { id } = req.params

    try {
        const choiceExists = await db.collection('choices').findOne({ _id: ObjectId(id) })
        if (!choiceExists) return res.sendStatus(404)
        console.log(choiceExists)

        const poll = await db.collection('polls').findOne({ _id: ObjectId(choiceExists.pollId) })
        const isExpired = dayjs().isAfter(dayjs(poll.expireAt))
        if (isExpired) return res.sendStatus(403)

        const createdAt = dayjs().format('YYYY-MM-DD HH:mm')

        await db.collection('votes').insertOne({
            choiceId: choiceExists._id,
            createdAt
        })
        res.sendStatus(201)

    } catch (error) {
        console.log(error);
    }

}

const showResult = async (req, res) => {

    const { id } = req.params

    try {
        const pollExists = await db.collection('polls').findOne({ _id: ObjectId(id) })
        if (!pollExists) return res.sendStatus(404)

        const choices = await db.collection('choices').find({ pollId: ObjectId(id) }).toArray()

        const votes = await Promise.all(choices.map(async (choice) => {
            try {
                const numVotes = (await db.collection('votes').find({ choiceId: ObjectId(choice._id) }).toArray()).length
                return {
                    ...choice,
                    numVotes
                }
            } catch (error) {
                console.log(error)
            }
        }))

        votes.sort((a, b) => b.numVotes - a.numVotes)

        res.status(200).send({
            ...pollExists,
            result: {
                title: votes[0].title,
                votes: votes[0].numVotes
            }
        })

    } catch (error) {
        console.log(error)
    }
}

export { handleVote, showResult }