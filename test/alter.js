var request = require('supertest');
var should = require('should');

describe('Crop', function() {
  request = request(process.env.HOST || 'http://localhost:5000');

  describe('Returned a cropped image', function() {
    it('should be smaller ', function(done) {
      var width = 150,
          height = 100;
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