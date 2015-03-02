var gm = require('gm');
var request = require('request');
var cors = require('cors');
var upload = require('./s3-upload');

function square(req, res) {
  try {
    var q = req.query;
    var squared = false;
    var image = gm(request(q.image));

    image.size(function (err, info) {
      if (err) {
        res.status(500).send(err);
      } else {
        var croppedImage = null;
        if (info.width > info.height) {
          var x = (info.width - info.height) / 2;
          croppedImage = gm(request(q.image)).crop(info.height, info.height, x, 0);
          squared = true;
        } else if (info.height > info.width) {
          var y = (info.height - info.width) / 2;
          croppedImage = gm(request(q.image)).crop(info.width, info.width, 0, y);
          squared = true;
        } else {
          croppedImage = gm(request(q.image));
        }

        if (q.removePngTransparency) {
          croppedImage
            .out("-operator", "Opacity", "Assign", "100%")
            .out("-background", "#ffffff")
            .toBuffer("JPEG", function (err, buffer) {
              if (err) {
                throw err;
              } else {
                var alterationDesc;
                if (squared) {
                  alterationDesc = "squared and removed PNG transparency";
                } else {
                  alterationDesc = "removed PNG transparency";
                }

                var fileObj = {
                  alteration: alterationDesc,
                  protocol: req.protocol,
                  prefix: q.prefix,
                  buffer: buffer
                };
                upload(fileObj, res);
              }
            });
        } else if (squared) {
          croppedImage.toBuffer(function (err, buffer) {
            if (err) {
              res.status(500).send(e);
            }
            var fileObj = {
              alteration: 'squared',
              protocol: req.protocol,
              prefix: q.prefix,
              buffer: buffer
            };
            upload(fileObj, res);
          });
        } else {
          var body = {
            image: q.image,
            alteration: 'none'
          };
          res.send(body);
        }
      }
    });
  } catch(e) {
    res.status(500).send(e);
  }
}

module.exports = function (app) {
  app.get('/square', cors(), square);
};