var newrelic = require('newrelic');
var stack = require('simple-stack-common');

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

require('./routes/index')(app);
require('./routes/validate')(app);

