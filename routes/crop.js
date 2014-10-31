var gm = require('gm');
var request = require('request');
var cors = require('cors');
var mime = require('mime');
var upload = require('./s3-upload');

function crop(req, res) {
  try {
    var q = req.query;
    var filename = getFilename(q.image);
    var image = gm(request(q.image), filename);

    image.crop(q.width, q.height, q.left, q.top).stream(function(err, stdout, stderr) {
      var buf = new Buffer(0);

      stdout.on('data', function(d) {
        buf = Buffer.concat([buf, d]);
      });

      stdout.on('end', function() {
        var fileObj = {
          alteration: 'cropped',
          protocol: req.protocol,
          prefix: q.prefix,
          buffer: buf,
          mimetype: mime.lookup(filename)
        };
        upload(fileObj, res);
      });
    });
  } catch(e) {
    res.status(500).send(e);
  }
}

function getFilename(url) {
  return url.substring(url.lastIndexOf('/')+1);
}

module.exports = function (app) {
  app.get('/crop', cors(), crop);
};
