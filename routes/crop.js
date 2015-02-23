var gm = require('gm');
var request = require('request');
var cors = require('cors');
var mime = require('mime');
var upload = require('./s3-upload');

function crop(req, res) {
  try {
    var q = req.query;
    var image = gm(request(q.image)).crop(q.width, q.height, q.left, q.top);

    image.toBuffer(function(err, buffer) {
      if (err) {
        throw err;
      }

      var fileObj = {
        alteration: 'cropped',
        protocol: req.get('x-orig-proto') || req.protocol,
        prefix: q.prefix,
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
  app.get('/crop', cors(), crop);
};
