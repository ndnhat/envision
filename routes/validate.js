var gm = require('gm');

function getError(code) {
  var error = { statusCode: code };
  error.message = (code === 400)
                ? 'The "image" parameter is required'
                : 'Something is messed up';
  return error;
}

module.exports = function (app) {
  app.get('/validate', function(req, res) {
    var data = { valid: true };
    var imagePath = req.query.image;
    var image;
    
    if (imagePath) {
      image = gm(imagePath);
    } else {
      res.json({error: getError(400)});
      return;
    }

    if (req.query['min-width'] || req.query['min-height'] || req.query['max-width'] || req.query['max-height']) {
      image.size(function (err, size) {
        if (!err) {
          var minWidth = parseInt(req.query['min-width'], 10) || 0;
          var minHeight = parseInt(req.query['min-height'], 10) || 0;
          var maxWidth = parseInt(req.query['max-width'], 10) || Infinity;
          var maxHeight = parseInt(req.query['max-height'], 10) || Infinity;

          data.size = size;
          data.valid = data.vaild &&
                       size.width >= minWidth &&
                       size.height >= minHeight &&
                       size.width <= maxWidth &&
                       size.height <= maxHeight;
        } else {
          data.error = getError(500);
        }
      });
    }
    res.json(data);

  });

};
