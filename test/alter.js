var request = require('supertest')(process.env.HOST || 'http://localhost:5000');
var should = require('should');

var width = 150,
  height = 100;

describe('Crop a image', function() {
  describe('returns a cropped image', function() {
    it('that should be smaller ', function(done) {
      request.get('/crop?image=http://lorempixel.com/200/200/&width=' + width + '&height=' + height + '&left=0&top=0').end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.should.have.property('image');
        res.body.should.have.property('alteration');

        request.get('/validate?image=' + res.body.image + '&max-width=' + width + '&max-height=' + height).end(function(err, res) {
          if (err) {
            throw err;
          }
          res.body.valid.should.eql(true);
          done();
        });
      });
    });
  });
});

describe('Rotate a image 90 degrees', function() {
  describe('returns a rotated image', function() {
    it('that should have width for height', function(done) {
      request.get('/rotate?image=http://lorempixel.com/' + width + '/' + height + '&degrees=90').end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.should.have.property('image');
        res.body.should.have.property('alteration');

        request.get('/validate?image=' + res.body.image + '&min-width=' + height + '&min-height=' + width).end(function(err, res) {
          if (err) {
            throw err;
          }
          res.body.valid.should.eql(true);
          done();
        });
      });
    });
  });
});