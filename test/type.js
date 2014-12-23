var request = require('supertest');
var assert = require('assert');
var should = require('should');

describe('Validate', function() {
  request = request(process.env.HOST || 'http://localhost:5000');

  describe('image type', function() {
    it('should return an error for non-image files', function(done) {
      request.get('/validate?image=http://www.tonycuffe.com/mp3/tailtoddle_lo.mp3&mimetype=image/jpeg').end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.should.have.property('error');
        done();
      });
    });


    it('should return true for a valid image/jpeg type', function(done) {
      request.get('/validate?image=http%3A%2F%2Florempixel.com%2F40%2F20%2F&mimetype=image/jpeg').end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.valid.should.eql(true);
        done();
      });
    });

    it('should return false for an invalid image/png type', function(done) {
      request.get('/validate?image=http%3A%2F%2Florempixel.com%2F40%2F20%2F&mimetype=image/png').end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.valid.should.eql(false);
        res.body.invalid.should.have.property('type');
        done();
      });
    });
  });

});