var request = require('supertest');
var assert = require('assert');
var should = require('should');

describe('Validate', function() {
  request = request('http://localhost:5000');

  describe('size()', function() {
    it('should return an error when image is not present', function(done) {
      request.get('/validate?props=size').end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.valid.should.be.false;
        res.body.should.have.property('error');
        done();
      });
    });

    it('should return true when no constraints are present', function(done) {
      request.get('/validate?props=size&image=http%3A%2F%2Florempixel.com%2F40%2F20%2F').end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.should.be.valid;
        done();
      });
    });

    it('should return false when image is too wide', function(done) {
      request.get('/validate?props=size&image=http%3A%2F%2Florempixel.com%2F40%2F20%2F&max-width=10').end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.should.be.valid;
        done();
      });
    });

    it('should return false when image is too tall', function(done) {
      request.get('/validate?props=size&image=http%3A%2F%2Florempixel.com%2F40%2F20%2F&max-height=10').end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.should.be.valid;
        done();
      });
    });

    it('should return false when image is too narrow', function(done) {
      request.get('/validate?props=size&image=http%3A%2F%2Florempixel.com%2F40%2F20%2F&min-width=50').end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.should.be.valid;
        done();
      });
    });

    it('should return false when image is too short', function(done) {
      request.get('/validate?props=size&image=http%3A%2F%2Florempixel.com%2F40%2F20%2F&min-height=30').end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.should.be.valid;
        done();
      });
    });

    it('should return true when image meets all requirements', function(done) {
      request.get('/validate?props=size&image=http%3A%2F%2Florempixel.com%2F40%2F20%2F&min-width=30&min-height=10&max-width=40&max-height=30').end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.should.be.valid;
        done();
      });
    });
  });
});