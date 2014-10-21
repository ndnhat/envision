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
          },
          'mimetype': {
            label: 'mimetype'
          }
        }
      },
      crop: {
        method: 'GET',
        action: res.locals.url + '/crop',
        input: {
          image: {
            required: true,
            label: 'Image'
          },
          'width': {
            label: 'width'
          },
          'height': {
            label: 'height'
          },
          'left': {
            label: 'left'
          },
          'top': {
            label: 'top'
          }
        }
      }
    };

    res.json(data);
  });

};
