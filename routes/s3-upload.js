var shortId = require('shortid');
var fileType = require('file-type');
var mime = require('mime');
var envs = require('envs');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();

function upload(params, res) {
  var mimetype = fileType(params.buffer).mime;
  var extension = mime.extension(mimetype);
  var path = (params.prefix || 'altered/') + shortId.generate() + '.' + extension;
  var data = {
    Bucket: envs('AWS_BUCKET_NAME'),
    Key: path,
    ACL: 'public-read',
    Body: params.buffer,
    ContentType: mimetype
  };

  s3.putObject(data, function(err) {
    if (err) {
      throw err;
    }

    var body = {
      image: params.protocol + '://' + data.Bucket + '.s3.amazonaws.com/' + path,
      alteration: params.alteration
    };
    res.send(body);
  });
}

module.exports = upload;