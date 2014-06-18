var request = require('supertest');
var assert = require('assert');
var should = require('should');

describe('Validate', function() {
  request = request('http://localhost:5000');

  describe('combo', function() {
    it('should return true for a valid type and size', function(done) {
      request.get('/validate?image=http%3A%2F%2Florempixel.com%2F40%2F20%2F&mimetype=image/jpeg&min-height=10').end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.valid.should.eql(true);
        res.body.type.should.eql('jpeg');
        done();
      });
    });

    it('should return false for an invalid combo', function(done) {
      request.get('/validate?image=http%3A%2F%2Florempixel.com%2F40%2F20%2F&mimetype=image/jpeg&max-height=10').end(function(err, res) {
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