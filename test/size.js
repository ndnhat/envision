var request = require('supertest');
var assert = require('assert');
var should = require('should');

describe('Validate', function() {
  request = request('http://localhost:5000');

  it('should return an error when image is not present', function(done) {
    request.get('/validate').end(function(err, res) {
      if (err) {
        throw err;
      }
      res.body.should.have.property('error');
      res.body.error.should.have.status(400);
      res.body.should.be.valid;
      done();
    });
  });

  describe('image size', function() {
    it('should return true when no constraints are present', function(done) {
      request.get('/validate?image=http%3A%2F%2Florempixel.com%2F40%2F20%2F').end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.should.be.valid;
        done();
      });
    });

    it('should return false when image is too wide', function(done) {
      request.get('/validate?image=http%3A%2F%2Florempixel.com%2F40%2F20%2F&max-width=10').end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.should.be.valid;
        done();
      });
    });

    it('should return false when image is too tall', function(done) {
      request.get('/validate?image=http%3A%2F%2Florempixel.com%2F40%2F20%2F&max-height=10').end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.should.be.valid;
        done();
      });
    });

    it('should return false when image is too narrow', function(done) {
      request.get('/validate?image=http%3A%2F%2Florempixel.com%2F40%2F20%2F&min-width=50').end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.should.not.be.valid;
        done();
      });
    });

    it('should return false when image is too short', function(done) {
      request.get('/validate?image=http%3A%2F%2Florempixel.com%2F40%2F20%2F&min-height=30').end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.should.not.be.valid;
        done();
      });
    });

    it('should return true when image meets all requirements', function(done) {
      request.get('/validate?image=http%3A%2F%2Florempixel.com%2F40%2F20%2F&min-width=30&min-height=10&max-width=40&max-height=30').end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.should.be.valid;
        done();
      });
    });
  });

  describe('image type', function() {
    it('should return true for a valid image/png type', function(done) {
      request.get('/validate?image=http%3A%2F%2Florempixel.com%2F40%2F20%2F&mimetype=image/png').end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.should.be.valid;
        res.body.type.should.eql('png');
        done();
      });
    });
  });
});