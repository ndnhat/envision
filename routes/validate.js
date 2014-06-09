var gm = require('gm');

module.exports = function (app) {
  app.get('/validate', function(req, res) {
    var data = { valid: false };
    var imagePath = req.query.image;
    var image;
    
    if (!imagePath) {
      data.error = {
        statusCode: 400,
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

    });
    res.json(data);

  });

};
