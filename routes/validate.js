var gm = require('gm');
var request = require('request');
var cors = require('cors');

function validate(req, res) {
  if (!req.query.image) {
    error('The "image" parameter is required.', res);
  } else {
    verifyImage(req, res, validateImage);
  }
}

function verifyImage(req, res, next) {
  var path = req.query.image;
  request.head(path, function(err, response, body) {
    if (err) {
      error(err, res);
    } else if (response.headers['content-type'].indexOf('image') < 0) {
      error('The file provided is not an image', res);
    } else {
      next(req, res);
    }
  });

}

function validateImage(req, res) {
  var path = req.query.image;
  var image = gm(request(path), 'tempImage');
  image.identify(function(err, info) {
    if (err) {
      error(err, res);
    } else {
      var validations = [];
      if (req.query['min-width'] || req.query['min-height'] || req.query['max-width'] || req.query['max-height']) {
        validations.push(validateSize(info.size, req.query));
      }
      if (req.query['mimetype']) {
        validations.push(validateType(info.format, req.query));
      }

      res.json(combine(validations));
    }
  });
}

function valid() {
  return { valid: true };
}

function error(err, res) {
  var exception = new Error(err);
  res.status(500).json({
    error: {
      statusCode: 500,
      message: exception.message || exception.toString()
    }
  });
}

function validateSize(size, query) {
  var minWidth = parseInt(query['min-width'], 10) || 0;
  var minHeight = parseInt(query['min-height'], 10) || 0;
  var maxWidth = parseInt(query['max-width'], 10) || Infinity;
  var maxHeight = parseInt(query['max-height'], 10) || Infinity;
  var data = {};

  data.info = { size: size };
  data.valid = size.width >= minWidth &&
               size.height >= minHeight &&
               size.width <= maxWidth &&
               size.height <= maxHeight;
  if (size.width > maxWidth || size.height > maxHeight) {
    data.invalid = {
      size: {
        code: 'image-size-too-large',
        message: 'The image size is too large.'
      }
    };
  } else if (size.width < minWidth || size.height < minHeight) {
    data.invalid = {
      size: {
        code: 'image-size-too-small',
        message: 'The image size is too small.'
      }
    };
  }

  return data;
}

function validateType(type, query) {
  var data = {};
  data.info = { type: type.toLowerCase() };
  data.valid = query.mimetype.indexOf(data.info.type) >= 0;
  if (!data.valid) {
    data.invalid = {
      type: {
        code: 'image-type-invalid',
        message: 'The image format is invalid.'
      }
    };
  }

  return data;
}

function combine(results) {
  if (!results.length) {
    return valid();
  }
  return results.reduce(merge);
}

function merge(a, b) {
  for (var prop in b) {
    if (prop === 'valid') {
      a.valid = a.valid && b.valid;
    } else if (a.hasOwnProperty(prop)) {
      a[prop] = merge(a[prop], b[prop]);
    } else {
      a[prop] = b[prop];
    }
  }
  return a;
}

module.exports = function (app) {
  app.get('/validate', cors(), validate);
};
