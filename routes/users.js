const { name } = require('ejs');
var express = require('express');
const { ObjectId } = require('mongodb');
var router = express.Router();


module.exports = function(db){

const User = db.collection('users');
// const sort = ""

router.get('/', async function(req, res, next) {
  try {
    // const {sortby, limit} = req.params
    const users = await User.find({}).toArray();
    res.json(users)
  } catch (err) {
    res.status(500).json({ err })
  }
});

router.post('/', async function (req, res, next) {
  try {
    const {name, phone} = req.body
    const users = await User.insertOne({ name:name, phone:phone });
    res.status(201).json(users)
  } catch (err) {
    res.status(500).json({ err })
  }
})

router.get('/:id', async function (req, res, next) {
  try {
    const id = req.params.id
    const user = await User.findOne({ _id: new ObjectId(id) });
    res.status(201).json({user})
  } catch (err) {
    res.status(500).json({ err })
  }
})

router.put('/:id', async function (req, res, next) {
  try {
    const id = req.params.id
    const {name, phone} = req.body
    const user = await User.updateOne({ _id: new ObjectId(id) }, { $set: { name: name, phone:phone } });
    res.status(201).json(user)
  } catch (err) {
    res.status(500).json({ err })
  }
})

router.delete('/:id', async function (req, res, next) {
  try {
    const id = req.params.id
    const user = await User.deleteOne({ _id: new ObjectId(id) });
    res.status(201).json(user)
  } catch (err) {
    res.status(500).json({ err })
  }
})

 return router;
}
