const { name } = require('ejs');
var express = require('express');
const { ObjectId } = require('mongodb');
var router = express.Router();


module.exports = function(db){

const User = db.collection('users');

router.get('/', async function(req, res, next) {
  try {
    const { page = 1, sortBy = "_id", sortMode = "desc", limit = 5, query = ''} = req.query
    const offset = (page - 1) * limit
    const params = {}
    const sort = {}
    sort[sortBy] = sortMode
    if(search){
     params['$or'] = [ { "name": new RegExp(query, 'i') } , {"phone": new RegExp(query, 'i') } ]
    }

    const rows = await User.find(params).toArray()
    const total = rows.length
    const pages = Math.ceil(total / limit)
    const users = await User.find(params).sort(sort).limit(Number(limit)).skip(Number(offset)).toArray();
    res.json({data : users, total, pages, page, limit, offset })
  } catch (err) {
    res.status(500).json({ err })
  }
});

router.post('/', async function (req, res, next) {
  try {
    const {name, phone} = req.body
    const users = await User.insertOne({ name:name, phone:phone });
    const find = await User.findOne({ _id: new ObjectId(users.insertedId) })
    res.status(201).json(find)
  } catch (err) {
    res.status(500).json({ err })
  }
})

router.get('/:id', async function (req, res, next) {
  try {
    const id = req.params.id
    const user = await User.findOne({ _id: new ObjectId(id) });
    res.status(200).json(user)
  } catch (err) {
    res.status(500).json({ err })
  }
})

router.put('/:id', async function (req, res, next) {
  try {
    const id = req.params.id
    const {name, phone} = req.body
    const user = await User.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { name: name, phone: phone }}, {returnDocument : 'after'});
    console.log(user)
    res.status(201).json(user)
  } catch (err) {
    res.status(500).json({ err })
  }
})

router.delete('/:id', async function (req, res, next) {
  try {
    const id = req.params.id
    const user = await User.findOneAndDelete({ _id: new ObjectId(id) });
    res.status(201).json(user)
  } catch (err) {
    res.status(500).json({ err })
  }
})

 return router;
}
