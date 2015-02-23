var newrelic = require('newrelic');
var stack = require('simple-stack-common');
var proxy = require('simple-http-proxy');
var envs = require('envs');

var conf = {
  app: {
    base: {
      host: 'x-orig-host',
      path: 'x-orig-path',
      port: 'x-orig-port',
      proto: 'x-orig-proto'
    }
  },
  proxy : {
    xforward: {
      proto: 'x-orig-proto',
      host: 'x-orig-host',
      path: 'x-orig-path',
      port: 'x-orig-port'
    }
  }
};

var app = module.exports = stack(conf.app);

function prependPath(path) {
  return function(req, res, next) {
    delete req.headers['accept-encoding'];
    req.headers[conf.proxy.xforward.path] = (req.headers[conf.proxy.xforward.path] || '') + path;
    next();
  };
}

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
require('./routes/crop')(app);
require('./routes/rotate')(app);
require('./routes/square')(app);

app.use('/upload', 'proxy:upload:path', prependPath('/upload'));
app.use('/upload', 'proxy:upload', proxy(envs('UPLOAD_URL', 'http://oc-peer-api.s3.amazonaws.com'), conf.proxy));
