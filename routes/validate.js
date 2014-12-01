var gm = require('gm');
var async = require('async');
var request = require('request');
var cors = require('cors');

function validate(req, res) {
  try {
    var image = getImage(req.query.image);
    validateImage(req, res, image);
  } catch(e) {
    console.log("Caught error: " + e);
    if (e.statusCode && e.statusCode.code && e.statusCode.code === "EAGAIN") console.log(">>> RUNAWAY PROCESS. PLEASE RESTART THIS APP! <<<");
    res.json(error(e));
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
        if (err) {
          res.json(error(500));
        } else {
          res.json(combine(results));
        }
      }
    );
  } else {
    res.json(valid());
  }

}

function valid() {
  return { valid: true };
}

function error(err) {
  var appStatus = '';

  if (err.code) appStatus = err.code + ' ';

  return {
    error: {
      statusCode: ((typeof err) === "number") ? err : 500,
      message: (err === 400) ? 'The "image" parameter is required.' : appStatus + 'Problem loading the specified image.'
    }
  };
}

function getImage(path) {
  if (!path) {
    throw 400;
  }
  return gm(request(path), 'tempImage');
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
    } else {
      data = error(500);
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
        data.invalid = {
          type: {
            code: 'image-type-invalid',
            message: 'The image format is invalid.'
          }
        };
      }
    } else {
      data = error(500);
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
  app.get('/validate', cors(), validate);
};
