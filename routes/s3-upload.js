var shortId = require('shortid');
var envs = require('envs');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();

function upload(params, res) {
  var path = (params.prefix || 'altered/') + shortId.generate();
  var data = {
    Bucket: envs('S3_BUCKET'),
    Key: path,
    ACL: 'public-read',
    Body: params.buffer,
    ContentType: params.mimetype
  };

  s3.putObject(data, function(err) {
    if (err) {
      res.status(500).send(e);
    } else {
      var body = {
        image: params.protocol + '://' + data.Bucket + '.s3.amazonaws.com/' + path,
        alteration: params.alteration
      };
      res.send(body);
    }
  });
}

module.exports = upload;