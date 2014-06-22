var gm = require('gm');
var async = require('async');

function validate(req, res) {
  try {
    var image = getImage(req.query.image);
    validateImage(req, res, image);
  } catch(e) {
    res.json({ error: getError(e) });
  }
}

function validateImage(req, res, img) {
  var tasks = [];
  if (req.query['min-width'] || req.query['min-height'] || req.query['max-width'] || req.query['max-height']) {
    tasks.push(validateSize.bind(img, req.query));
  }

  if (req.query['mimetype']) {
    tasks.push(validateType.bind(img, req.query));
  }

  if (tasks.length) {
    async.parallel(
      tasks,
      function(err, results) {
        res.json(combine(results));
      }
    );
  } else {
    res.json(validRes());
  }

}

function validRes() {
  return { valid: true };
}

function getError(code) {
  var error = { statusCode: code };
  error.message = (code === 400)
                ? 'The "image" parameter is required'
                : 'Problem loading the specified image';
  return error;
}

function getImage(path) {
  if (!path) {
    throw 400;
  }
  return gm(path);
}

function validateSize(query, cb) {
  this.size(function (err, size) {
    var data = {};
    if (!err) {
      var minWidth = parseInt(query['min-width'], 10) || 0;
      var minHeight = parseInt(query['min-height'], 10) || 0;
      var maxWidth = parseInt(query['max-width'], 10) || Infinity;
      var maxHeight = parseInt(query['max-height'], 10) || Infinity;

      data.info = { size: size };
      data.valid = size.width >= minWidth &&
                   size.height >= minHeight &&
                   size.width <= maxWidth &&
                   size.height <= maxHeight;
      if (!data.valid) {
        data.invalid = { size: {message: 'Invalid size'} };
      }
    } else {
      data.error = getError(500);
    }
    cb(null, data);
  });
}

function validateType(query, cb) {
  this.format(function (err, type) {
    var data = {};
    if (!err) {
      data.info = { type: type.toLowerCase() };
      data.valid = query.mimetype.indexOf(data.info.type) >= 0;
      if (!data.valid) {
        data.invalid = { type: {message: 'Invalid type'} };
      }
    } else {
      data.error = getError(500);
    }
    cb(null, data);
  });

}

function combine(results) {
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
  app.get('/validate', validate);
};
