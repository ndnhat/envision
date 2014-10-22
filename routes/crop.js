var gm = require('gm');
var request = require('request');
var mime = require('mime');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var cors = require('cors');

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
        var prefix = q.prefix || 'uploads/';
        var path = prefix + filename;
        var data = {
          Bucket: 'oc-peer-api',
          Key: path,
          ACL: 'public-read',
          Body: buf,
          ContentType: mime.lookup(filename)
        };

        s3.putObject(data, function(err, s3res) {
          if (!err) {
            var resp = {
              image: 'https://oc-peer-api.s3.amazonaws.com/' + path,
              alteration: 'cropped'
            };
            res.send(resp);
          } else {
            res.status(500).send(e);
          }
        });
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
