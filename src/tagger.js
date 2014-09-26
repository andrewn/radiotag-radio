var EventEmitter = require('events').EventEmitter,
    _ = require('lodash'),
    radiotag = require('radiotag.js'),
    defer = require('radiodan-client').utils.promise.defer,
    LocalStorage = require('node-localstorage').LocalStorage;

module.exports = {
  create: create
};

function noAccessTokenError() {
  var error = new Error('No access token found');
  error.name = 'NoAccessToken';
  return error;
}

function noIdError() {
  var error = new Error('No service URI specified');
  error.name = 'NoURI';
  return error;
}

function noServiceUriError() {
  var error = new Error('No station id specified');
  error.name = 'NoStationId';
  return error;
}

function create(configStorePath) {
  var instance = new EventEmitter(),
      storage  = new LocalStorage(configStorePath);

  // storage.setItem('accessToken', 'Mk7O27sBYJiLNlCMh6c3ycHtfdVtaq8TqRzRjOPlDZh');

  instance.tag = function (id, serviceUri) {
    var dfd = defer(),
        accessToken = storage.getItem('accessToken');

    if (id == null) {
      dfd.reject( noIdError() );
    } else if (accessToken == null) {
      dfd.reject( noAccessTokenError() );
    } else if (serviceUri == null) {
      dfd.reject( noServiceUriError() );
    } else {
      console.log('tagger.tag: ', id, serviceUri, accessToken);
      radiotag.tag(id, serviceUri, accessToken, function (error, tag) {
        console.log('tagger.tag error,tag: ', error, tag);
        error ? dfd.reject(error) : dfd.resolve(tag);
      });
    }

    return dfd.promise;
  };

  return instance;
}