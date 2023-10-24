const { render } = require('ejs');
var express = require('express');
const moment = require('moment')
const { ObjectId, MongoCursorExhaustedError } = require('mongodb');
var router = express.Router();


module.exports = function (db) {

    const Todo = db.collection('todos');
    const User = db.collection('users')


    router.get('/', async function (req, res, next) {
        try {
            const { page = 1, sortBy = "", sortMode = "", title, startDate, endDate, complete, limit = 5 } = req.query
            const offset = (page - 1) * limit
            const params = {}
            const executor = req.params.id

            if (title) {
                params['title'] = new RegExp(title, 'i')
            }

            if (startDate && endDate) {
                params['deadline'] = {deadline: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }}
            } else if (startDate) {
                console.log('jalan', startDate)
                params['deadline'] =  {$gte: new Date(startDate)}
            } else if (endDate) {
                params['deadline'] = {$lte: new Date(endDate)}
            }

            if(complete){
                params['complete'] = JSON.parse(complete)
            }

            const rows = await Todo.find({}).toArray();
            const total = rows.length
            const pages = Math.ceil(total / limit)
            const todos = await Todo.find(params).sort(sortBy == '_id' ? sortBy == 'title' ? { _id: sortMode == 'desc' ? -1 : 1 } : { title: sortMode == 'desc' ? -1 : 1 } : { complete: sortMode == 'desc' ? -1 : 1 }).skip(Number(offset)).limit(Number(limit)).toArray();
            res.json({ data: todos, total, pages, page, limit, offset, executor, moment })
        } catch (err) {
            res.status(500).json({ err })
        }
    });

    router.post('/', async function (req, res, next) {
        try {
            const { title, executor } = req.body
            const user = await User.findOne({ _id: new ObjectId(executor) })
            const todos = await Todo.insertOne({ title: title, complete: false, deadline: new Date(), executor: user._id });
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
            console.log(title, deadline, complete)
            const todos = await Todo.updateOne({ _id: new ObjectId(id) }, { $set: { title: title, deadline: deadline, complete: JSON.parse(complete) } });
            res.status(201).json(todos)
        } catch (err) {
            console.log(err)
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