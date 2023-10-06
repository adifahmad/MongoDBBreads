var express = require('express');
const { ObjectId, MongoCursorExhaustedError } = require('mongodb');
var router = express.Router();


module.exports = function (db) {

    const Todo = db.collection('todos');
    const User = db.collection('users')

    // const sort = ""

    router.get('/', async function (req, res, next) {
        try {
            const { executor } = req.query
            const todos = await Todo.find({ executor: new ObjectId(executor) }).toArray();
            res.json(todos)
        } catch (err) {
            res.status(500).json({ err })
        }
    });

    router.post('/', async function (req, res, next) {
        try {
            const { title, executor } = req.body
            const user = await User.findOne({ _id: new ObjectId(executor) })
            const todos = await Todo.insertOne({ title: title, complete: false, executor: user._id });
            res.status(201).json(todos)
        } catch (err) {
            res.status(500).json({ err })
        }
    })

    router.get('/:id', async function (req, res, next) {
        try {
            const id = req.params.id
            const todos = await Todo.findOne({ _id: new ObjectId(id) });
            res.status(201).json({ todos })
        } catch (err) {
            res.status(500).json({ err })
        }
    })

    router.put('/:id', async function (req, res, next) {
        try {
            const id = req.params.id
            const { title, deadline, complete } = req.body
            const todos = await Todo.updateOne({ _id: new ObjectId(id) }, { $set: { title: title, deadline: deadline, complete: complete } });
            res.status(201).json(todos)
        } catch (err) {
            res.status(500).json({ err })
        }
    })

    router.delete('/:id', async function (req, res, next) {
        try {
            const id = req.params.id
            const todos = await Todo.deleteOne({ _id: new ObjectId(id) });
            res.status(201).json(todos)
        } catch (err) {
            res.status(500).json({ err })
        }
    })

    return router;
}