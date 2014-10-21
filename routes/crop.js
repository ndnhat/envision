var fs = require('fs');
var gm = require('gm');
var request = require('request');
var mime = require('mime');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var cors = require('cors');

function crop(req, res) {
  try {
    var image = gm(request(req.query.image), 'tempImage');
    var q = req.query;
    image.crop(q.width, q.height, q.left, q.top).stream(function(err, stdout, stderr) {
      var buf = new Buffer(0);
      stdout.on('data', function(d) {
        buf = Buffer.concat([buf, d]);
      });
      stdout.on('end', function() {
        var path = 'uploads/' + getFilename(req.query.image);

        var data = {
          Acl: 'public-read',
          Bucket: 'oc-peer-api',
          Key: path,
          Body: buf
        };
        s3.putObject(data, function(err, s3res) {
          if (!err) {
            // console.log(res);
            var resp = {
              image: 'http://oc-peer-api.s3.amazonaws.com/' + path,
              alteration: 'cropped'
            };
            res.send(resp);
          } else {
            console.log(err);
            res.json(e);
          }
        });
      });
    });
  } catch(e) {
    console.log(e);
    res.json(e);
  }
}

function getFilename(url) {
  return url.substring(url.lastIndexOf('/')+1);
}

function getImage(path) {
  if (!path) {
    throw 400;
  }
  return gm(request(path), 'tempImage');
}

module.exports = function (app) {
  app.get('/crop', cors(), crop);
};
