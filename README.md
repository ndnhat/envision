envision
========

An image validation web service. 

## Request

Requests are made with GET where validation parameters can be passed in as part of the query string. For example: 

```
http://example.com/validate?image=http%3A%2F%2Florempixel.com%2F40%2F20%2F&min-height=50&mimetype=image/jpeg
```

Multiple parameters can be used in the same request. The available parameters are:

- **image**: An encoded url path to the image for validation. _This parameter is required_.
- **min-height**: Minimum height in pixels as an integer.
- **max-height**: Maximum height in pixels as an integer.
- **min-width**: Minimum width in pixels as an integer.
- **max-width**: Maximum width in pixels as an integer.
- **mimetype**: A valid image mimetype. 

A [demo](http://image-envision.herokuapp.com/validate?image=http%3A%2F%2Florempixel.com%2F40%2F20%2F&min-height=50&mimetype=image/jpeg) of this service is available at [image-envision.herokuapp.com](http://image-envision.herokuapp.com/validate?image=http%3A%2F%2Florempixel.com%2F40%2F20%2F&min-height=50&mimetype=image/jpeg). 

## Response

The response body data are formatted as JSON. For example:

    {
      "info": {
        "size": {
          "width": 40,
          "height": 20
        },
        "type": "jpeg"
      },
      "valid": false,
      "invalid": {
        "size": {
          "message": "Invalid size"
        }
      },
    }

A typical response body consists of the following parts:

- **valid**: A boolean property that indicates whether the provided image is valid based on the validation criteria.
- **info**: An object that provides relevant information about the image based on the validation criteria.
- **invalid**: An object that indicates the failing validation types.

## CORS Support

CORS, or cross-origin resource sharing, is a mechanism that allows a web page to make XMLHttpRequests to another domain. The 'envision' image validation API supports CORS but please note that some older browsers (e.g. IE7) may not support this mechanism.




