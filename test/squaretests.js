var request = require('supertest')(process.env.HOST || 'http://localhost:5000');
var should = require('should');

describe('Square', function() {
  describe('an image', function() {
    it('should not crop the image and return a new url if already square', function(done) {
        request.get('/square?image=http://placehold.it/10x10.gif').end(function(err, res) {
            if (err) {
                throw err;
            }
            res.body.should.have.property('image');
            res.body.image.should.not.eql('http://placehold.it/10x10.gif')
            res.body.should.have.property('alteration');
            res.body.alteration.should.eql('none');

            request.get('/validate?image=' + res.body.image + '&max-width=10&max-height=10').end(function(err, res) {
                if (err) {
                    throw err;
                }
                res.body.valid.should.eql(true);
                done();
            });
        });
    });
    it('should return a different url with equal width and height to original width if the original width is smaller that height', function(done) {
        request.get('/square?image=http://placehold.it/10x15.gif').end(function(err, res) {
            if (err) {
                throw err;
            }
            res.body.should.have.property('image');
            res.body.image.should.not.eql('http://placehold.it/10x15.gif');
            res.body.should.have.property('alteration');
            res.body.alteration.should.eql('squared');

            request.get('/validate?image=' + res.body.image + '&max-width=10&max-height=10').end(function(err, res) {
                if (err) {
                    throw err;
                }
                res.body.valid.should.eql(true);
                done();
            });
        });
    });
    it('should return a different url with equal width and height to original height if the original width is greater that height', function(done) {
        request.get('/square?image=http://placehold.it/15x10.gif').end(function(err, res) {
            if (err) {
                throw err;
            }
            res.body.should.have.property('image');
            res.body.image.should.not.eql('http://placehold.it/15x10.gif');
            res.body.should.have.property('alteration');
            res.body.alteration.should.eql('squared');

            request.get('/validate?image=' + res.body.image + '&max-width=15&max-height=10').end(function(err, res) {
                if (err) {
                    throw err;
                }
                res.body.valid.should.eql(true);
                done();
            });
        });
    });
    it('should not crop the image but should remove transparency for a png image that is square', function(done) {
        request.get('/square?image=http://placehold.it/10x10.png&removePngTransparency=y').end(function(err, res) {
            if (err) {
                throw err;
            }
            res.body.should.have.property('image');
            res.body.image.should.not.eql('http://placehold.it/10x10.png');
            res.body.should.have.property('alteration');
            res.body.alteration.should.eql('removed PNG transparency');

            request.get('/validate?image=' + res.body.image + '&max-width=10&max-height=10').end(function(err, res) {
                if (err) {
                    throw err;
                }
                res.body.valid.should.eql(true);
                done();
            });
        });
    });
    it('should crop the image square and remove transparency for a png image that is not square', function(done) {
        request.get('/square?image=http://placehold.it/15x10.png&removePngTransparency=y').end(function(err, res) {
            if (err) {
                throw err;
            }
            res.body.should.have.property('image');
            res.body.image.should.not.eql('http://placehold.it/15x10.png');
            res.body.should.have.property('alteration');
            res.body.alteration.should.eql('squared and removed PNG transparency');

            request.get('/validate?image=' + res.body.image + '&max-width=10&max-height=10').end(function(err, res) {
                if (err) {
                    throw err;
                }
                res.body.valid.should.eql(true);
                done();
            });
        });
    });
    it('should crop the image square and not remove transparency for a png image if removePngTransparency is not set to y', function(done) {
        request.get('/square?image=http://placehold.it/15x10.png').end(function(err, res) {
            if (err) {
                throw err;
            }
            res.body.should.have.property('image');
            res.body.image.should.not.eql('http://placehold.it/15x10.png');
            res.body.should.have.property('alteration');
            res.body.alteration.should.eql('squared');

            request.get('/validate?image=' + res.body.image + '&max-width=10&max-height=10').end(function(err, res) {
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
