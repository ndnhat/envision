var request = require('supertest');
var assert = require('assert');
var should = require('should');

describe('Validate', function() {
  request = request('http://localhost:5000');

  describe('image type', function() {
    it('should return true for a valid image/jpeg type', function(done) {
      request.get('/validate?image=http%3A%2F%2Florempixel.com%2F40%2F20%2F&mimetype=image/jpeg').end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.valid.should.eql(true);
        res.body.type.should.eql('jpeg');
        done();
      });
    });

    it('should return false for an invalid image/png type', function(done) {
      request.get('/validate?image=http%3A%2F%2Florempixel.com%2F40%2F20%2F&mimetype=image/png').end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.valid.should.eql(false);
        res.body.type.should.eql('jpeg');
        done();
      });
    });
  });

});