/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app,db) {

  app.route('/api/books')
    .get(async function (req, res){
      let dbResponse = null;
      await db.select('*').from('book').then(data => dbResponse = data)
      console.log(dbResponse);
      res.json(dbResponse)
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(async function (req, res){
      const title = req.body.title;
      let dbResponse = null;
      await db.transaction(trx => {
        trx.insert({title: title}).into('book')
        .returning(['id', 'title'])
        .then(data => {
          dbResponse = data[0];
          //console.log(data);
        })
        .then(trx.commit)
        .catch(trx.rollback)
      })
      .catch(err => console.log(err))
      //response will contain new book object including atleast _id and title
      console.log(dbResponse);
      res.json({'_id': dbResponse.id, 'title': dbResponse.title})
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
    });
  
};
