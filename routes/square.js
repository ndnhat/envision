var gm = require('gm');
var request = require('request');
var cors = require('cors');
var mime = require('mime');
var upload = require('./s3-upload');

/*
  Returns the url to a square cropped image from Amazon S3. If the image is already square then there is no change.
  If the removePngTransparency param is set to y and the mime type is png then also removes transparency.
  The png is returned as a jpeg.
  If the mime type cannot be determined then no image is returned.
  The alteration code returned in the response depends on what was done
  square  means that the image was cropped only
  square n means that no change was made
  square removePngTransparency means that the image was cropped and transparency removed
  square n removePngTransparency means that only transparency was removed
 */
function square(req, res) {
    try {
        var q = req.query;
        var squared = false;
        var image = gm(request(q.image));

        var mimeType = mime.lookup(q.image);
        //console.log("********** mimeType=" + mimeType);
        if (mimeType == "application/octet-stream") {
            //console.log("********** cannot determine image mime type");
            var body = {
                image: null,
                message: 'Cannot determine mime type'
            };
            res.send(body);
        } else {
            image.size(function (err, info) {
                if (err) {
                    res.status(500).send(e);
                } else {
                    var croppedImage = null;
                    //console.log("******* size = " + info.width + " " + info.height);
                    if (info.width > info.height) {
                        var x = (info.width - info.height) / 2;
                        croppedImage = gm(request(q.image)).crop(info.height, info.height, x, 0);
                        squared = true;
                        //console.log("********** width > height *********");
                    } else if (info.height > info.width) {
                        var y = (info.height - info.width) / 2;
                        croppedImage = gm(request(q.image)).crop(info.width, info.width, 0, y);
                        squared = true;
                        //console.log("********** height > width *********");
                    } else {
                        croppedImage = gm(request(q.image));
                        //console.log("********** width = height *********");
                    }

                    if (q.removePngTransparency && (q.removePngTransparency == 'y') && (mimeType == 'image/png')) {
                        //console.log("**********png image so need to remove transparency");
                        croppedImage
                            .out("-operator", "Opacity", "Assign", "100%")
                            .out("-background", "#ffffff")
                            .toBuffer("JPEG", function (err, buffer) {
                                if (err) {
                                    throw err;
                                } else {
                                    var alterationDesc = "square";
                                    if (squared) {
                                        alterationDesc = alterationDesc + " removePngTransparency"
                                    } else {
                                        alterationDesc = alterationDesc + " n removePngTransparency"
                                    }

                                    var fileObj = {
                                        alteration: alterationDesc,
                                        protocol: req.protocol,
                                        prefix: q.prefix,
                                        buffer: buffer,
                                        mimetype: 'image/jpeg'
                                    };
                                    upload(fileObj, res);
                                }
                            });
                    } else if (squared) {
                        //console.log("********** squared but no need to remove transparency");
                        croppedImage.toBuffer(function (err, buffer) {
                            if (err) {
                                res.status(500).send(e);
                            }
                            var fileObj = {
                                alteration: 'square',
                                protocol: req.protocol,
                                prefix: q.prefix,
                                buffer: buffer,
                                mimetype: mimeType
                            };
                            upload(fileObj, res);
                        });
                    } else {
                        //console.log("********** no changes to image");
                        var body = {
                            image: q.image,
                            alteration: 'square n'
                        };
                        res.send(body);
                    }
                }
            });
        }
    } catch(e) {
        res.status(500).send(e);
    }
}

module.exports = function (app) {
    app.get('/square', cors(), square);
};