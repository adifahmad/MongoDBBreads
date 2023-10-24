var express = require('express');
var router = express.Router();

module.exports = function (db) {
  router.get('/', function (req, res, next) {
    res.render('users/listuser');
  });

  router.get('/users/:id/todos', function (req, res, next) {
    res.render('todos/list', {executor: req.params.id});
  });
  

  return router
}