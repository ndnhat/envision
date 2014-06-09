module.exports = function (app) {
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
          'min-width': {
            label: 'min-width'
          },
          'max-width': {
            label: 'max-width'
          },
          'min-height': {
            label: 'min-height'
          },
          'max-height': {
            label: 'max-height'
          }
        }
      }
    };

    res.json(data);
  });

};
