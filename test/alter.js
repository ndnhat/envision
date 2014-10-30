var request = require('supertest');
var should = require('should');

describe('Resize', function() {
  request = request(process.env.HOST || 'http://localhost:5000');

  describe('Returned image', function() {
    it('should have the specified width', function(done) {
      request.get('/crop?image=http://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Nelumno_nucifera_open_flower_-_botanic_garden_adelaide2.jpg/1024px-Nelumno_nucifera_open_flower_-_botanic_garden_adelaide2.jpg&width=300&height=300&left=0&top=0').end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.should.have.property('image');
        res.body.should.have.property('alteration');
        done();
      });
    });
  });

});