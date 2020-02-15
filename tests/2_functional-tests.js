/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
var knex = require('knex');

chai.use(chaiHttp);

const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: process.env.USER,
    password: process.env.PASS,
    database: 'fcclibrary'
  }
})

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
        .post('/api/books')
        .send({title : 'harry potter'})
        .end( function(err, res) {
          //console.log('in test, res.body', res.body)
          assert.equal(res.status, 200);
          assert.property(res.body, 'title', 'response should have title');
          assert.isString(res.body.title, 'title is a string')
          assert.property(res.body, '_id', 'response should have an _id');
          assert.isNumber(res.body._id, '_id is a number');
          assert.property(res.body, 'comments', 'response has an array of comments');
          assert.isArray(res.body.comments, 'comments is an array');
          assert.lengthOf(res.body.comments, 0, 'comments is an empty array')
          done();
        })
        
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
        .post('/api/books')
        .send({title: ""})
        .end( function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, 'missing title');
          done();
        })
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
        .get('/api/books')
        .end( function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body, 'response is an array');
          assert.property(res.body[0], 'commentcount', 'books in array contain commentcount property');
          assert.property(res.body[0], 'title', 'books in array contain title property');
          assert.property(res.body[0], '_id', 'books in array contain _id property');
          done();
        })
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
        .get('/api/books/0')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, 'no book exists');
          done();
        })
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        // grab books, get id from first book
        async function runValidId() {
          let id = null;

          await db.select("_id").from('book').limit(1)
          .then(data => id = data[0]._id)

          console.log('id in test', id);

          chai.request(server)
          .get(`/api/books/${id}`)
          //.query({_id: id})
          .end(function (err, res) {
            console.log(res.body,  'res.body in test for id valid')
            assert.equal(res.status, 200);
            assert.property(res.body, 'title', 'response should have title');
            assert.isString(res.body.title, 'title is a string')
            assert.property(res.body, '_id', 'response should have an _id');
            assert.isNumber(res.body._id, '_id is a number');
            assert.property(res.body, 'comments', 'response has an array of comments');
            assert.isArray(res.body.comments, 'comments is an array');
            done();
          })
        }
        runValidId();
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        async function runAsync() {
          let id = null;

          await db.select("_id").from('book').limit(1).then(data => id = data[0]._id)

          console.log('id in test', id);

          chai.request(server)
          .post(`/api/books/${id}`)
          .send({comment: 'test comment'})
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, 'title', 'response should have title');
            assert.isString(res.body.title, 'title is a string')
            assert.property(res.body, '_id', 'response should have an _id');
            assert.isNumber(res.body._id, '_id is a number');
            assert.property(res.body, 'comments', 'response has an array of comments');
            assert.isArray(res.body.comments, 'comments is an array');
            done();
          })
        }
  
        runAsync();
       
      });
      
    });

  });

});
