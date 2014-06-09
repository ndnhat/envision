var newrelic = require('newrelic');
var stack = require('simple-stack-common');
var gm = require('gm');

var app = module.exports = stack({
  base: {
    host: 'x-orig-host',
    path: 'x-orig-path',
    port: 'x-orig-port',
    proto: 'x-orig-proto'
  }
});

app.useBefore('router', function locals(req, res, next) {
  var url = req.base + (req.url === '/' ? '' : req.url);
  res.locals({
    url: url,
    root: req.get('x-root') || req.base
  });
  var _json = res.json;
  res.json = function(data) {
    var root = res.locals.root;
    data.root = {href: root};
    data.href = url;
    _json.call(res, data);
  };
  res.set('cache-control', 'max-age=3600');
  next();
});

app.get('/', function(req, res) {
  var data = {
    validate: {
      method: 'GET',
      action: res.locals.url + '/validate',
      input: {
        image: {
          required: true,
          label: 'Image'
        },
        props: {
          required: true,
          label: 'Properties'
        }
      }
    }
  };
  data.validate.input['min-width'] = {
    label: 'min-width'
  };
  data.validate.input['max-width'] = {
    label: 'max-width'
  };
  data.validate.input['min-height'] = {
    label: 'min-height'
  };
  data.validate.input['max-height'] = {
    label: 'max-height'
  };

  res.json(data);
});

app.get('/validate', function(req, res) {
  var data = { valid: false };
  var imagePath = req.query.image;
  var image;
  
  if (!imagePath) {
    data.error = {
      status: 400,
      code: 'missing_image',
      message: 'The "image" parameter is required'
    };
    res.json(data);
    return;
  }

  gm(imagePath).size(function (err, size) {
    if (!err) {
      var minWidth = parseInt(req.query['min-width'], 10) || 0;
      var minHeight = parseInt(req.query['min-height'], 10) || 0;
      var maxWidth = parseInt(req.query['max-width'], 10) || Infinity;
      var maxHeight = parseInt(req.query['max-height'], 10) || Infinity;

      data.size = size;
      data.valid = size.width >= minWidth &&
                   size.height >= minHeight &&
                   size.width <= maxWidth &&
                   size.height <= maxHeight;
    }

    res.json(data);
  });


});

