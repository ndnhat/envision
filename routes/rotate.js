var gm = require('gm');
var request = require('request');
var cors = require('cors');
var mime = require('mime');
var upload = require('./s3-upload');

function rotate(req, res) {
  try {
    var image = gm(request(req.query.image)).rotate('white', req.query.degrees);
    image.toBuffer(function(err, buffer) {
      if (err) {
        throw err;
      }

      var fileObj = {
        alteration: 'rotated',
        protocol: req.get('x-orig-proto') || req.protocol,
        prefix: req.query.prefix,
        buffer: buffer,
        mimetype: mime.lookup(image.source)
      };

      upload(fileObj, res);
    });
  } catch(e) {
    res.status(500).send(e);
  }
}

module.exports = function (app) {
  app.get('/rotate', cors(), rotate);
};
