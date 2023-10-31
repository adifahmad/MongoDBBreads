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
            const { page = 1, sortBy = '_id', sortMode = 'desc', title, executor, startdateDeadline, enddateDeadline, complete, limit = 5 } = req.query
            const offset = (page - 1) * limit
            const params = {}
            const sort = {}
            sort[sortBy] = sortMode
            
            if (title) {
                params['title'] = new RegExp(title, 'i')
            }

            if (startdateDeadline && enddateDeadline) {
                params['deadline'] = {
                    $gte: startdateDeadline,
                    $lte: enddateDeadline
                }
            } else if (startdateDeadline) {
                params['deadline'] =  {$gte: startdateDeadline}
            } else if (enddateDeadline) {
                params['deadline'] = {$lte: enddateDeadline}
            }

            if(complete){
                params['complete'] = JSON.parse(complete)
            }
            if(executor){
                params['executor'] = new ObjectId(executor)
            }
            const rows = await Todo.find({}).toArray();
            const total = rows.length
            const pages = Math.ceil(total / limit)
            const todos = await Todo.find(params).sort(sort).skip(Number(offset)).limit(Number(limit)).toArray();
            res.json({ data: todos, total, pages, page, limit, offset, moment })
        } catch (err) {
            console.log(err)
            res.status(500).json({ err })
        }
    });

    router.post('/', async function (req, res, next) {
        try {
            const { title, executor } = req.body
            const user = await User.findOne({ _id: new ObjectId(executor) })
            const todos = await Todo.insertOne({ title: title, complete: false, deadline: new Date(), executor: user._id });
            const find = await todos.findOne({ _id: new ObjectId(todos.insertedId) })
            res.status(201).json(find)
        } catch (err) {
            res.status(500).json({ err })
        }
    })

    router.get('/:id', async function (req, res, next) {
        try {
            const id = req.params.id
            const todos = await Todo.findOne({ _id: new ObjectId(id) });
            res.status(201).json(todos)
        } catch (err) {
            res.status(500).json({ err })
        }
    })

    router.put('/:id', async function (req, res, next) {
        try {
            const id = req.params.id
            const { title, deadline, complete } = req.body
            const todos = await Todo.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { title: title, deadline: deadline, complete: JSON.parse(complete) } });
            res.status(201).json(todos)
        } catch (err) {
            console.log(err)
            res.status(500).json({ err })
        }
    })

    router.delete('/:id', async function (req, res, next) {
        try {
            const id = req.params.id
            const todos = await Todo.findOneAndDelete({ _id: new ObjectId(id) });
            res.status(201).json(todos)
        } catch (err) {
            res.status(500).json({ err })
        }
    })
    return router;
}