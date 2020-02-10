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
      let bookResponse = null;
      let commentResponse = null;
      await db.transaction(trx => {
        trx.insert({title: title}).into('book')
        .returning(['_id', 'title'])
        .then(data => {
          bookResponse = data[0];
          //console.log(data);
        })
        .then(trx.commit)
        .catch(trx.rollback)
      })
      .catch(err => console.log(err))
      //console.log(bookResponse);
      
      await db.select('comments').from('comment').where('book_id', '=',  bookResponse._id).then(data => commentResponse = data);
      console.log('here is the comment response', commentResponse)
      console.log('here is the post response', {'title': bookResponse.title, 'comments': commentResponse ,'_id': bookResponse._id});
      res.json({'title': bookResponse.title, 'comments': commentResponse ,'_id': bookResponse._id});
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
    });


  app.route('/api/books/:id')
    .get( async function (req, res){
      var bookid = req.params.id;
      console.log('book id in get with params', bookid)
      let bookResponse = null;
      let commentResponse = null;
      let commentsArray = [];

      await db.select('_id', 'title').from('book').where('_id', '=', bookid).then(data => bookResponse = data[0]).catch(err => console.log(err))
      //console.log(bookResponse)
      await db.select('comments').from('comment').where('book_id', '=',  bookResponse._id).then(data => commentResponse = data).catch(err => console.log(err));
      //console.log(commentResponse);
      for(let i = 0; i < commentResponse.length; i++) {
        commentsArray.push(commentResponse[i].comments)
      }
      console.log('here is the get response with id param', {'_id': bookResponse._id, 'title': bookResponse.title, 'comments': commentsArray }); 
      res.json({ '_id': bookResponse._id, 'title': bookResponse.title, 'comments': commentsArray });
      // db('book').join('comment', 'book._id', '=', 'comment.book_id')
      // .select('book._id', 'book.title', 'comment.comments')
      // .then(
      //   data => console.log('here response in get with params', data)
      // )
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(async function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      let bookResponse = null;
      let commentResponse = null;
      let commentsArray = [];
      await db.transaction(trx => {
        trx('book').where('_id', '=', bookid).increment('commentcount', 1)
        .then(trx.commit)
        .catch(trx.rollback)
      })
      .catch(err => console.log(err))
      await db.select('_id', 'title').from('book').where('_id', '=', bookid).then(data => bookResponse = data[0]).catch(err => console.log(err))
      await db.transaction(trx => {
        trx.insert({comments: comment, book_id: bookResponse._id })
        .into('comment')
        .then(trx.commit)
        .catch(trx.rollback)
      })
      .catch(err => console.log(err))
      await db.select('comments').from('comment').where('book_id', '=',  bookResponse._id).then(data => commentResponse = data).catch(err => console.log(err));
      for(let i = 0; i < commentResponse.length; i++) {
        commentsArray.push(commentResponse[i].comments)
      }
      console.log('here is the post response with id param', {'_id': bookResponse._id, 'title': bookResponse.title, 'comments': commentsArray }); 
      res.json({ '_id': bookResponse._id, 'title': bookResponse.title, 'comments': commentsArray });
      
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      db.transaction(trx => {
        trx('book').where('_id', '=', bookid).del()
        .then(trx.commit)
        .then( () => res.json('delete successful'))
        .catch(trx.rollback);
      })
      .catch(err => console.log(err))
      //if successful response will be 'delete successful'
    });
  
};
