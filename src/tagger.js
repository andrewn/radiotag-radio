var EventEmitter = require('events').EventEmitter,
    _ = require('lodash'),
    radiotag = require('radiotag.js'),
    cpa = require('cpa.js'),
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

  // TODO: What happens when accessToken is already here?
  instance.getUserCode = function (serviceUri, domain /* optional */) {
    var dfd = defer();

    if (serviceUri == null) {
      dfd.reject( noServiceUriError() );
    } else {
      console.log('tagger.pair: ', serviceUri);

      authProvider(serviceUri, domain)
        .then(register)
        .then(requestUserCode)
        .then(
          function (data) {
            dfd.resolve({
              url: data.user.verification_uri,
              userCode: data.user.user_code
            })
          },
          dfd.reject
        );
    }

    return dfd.promise;
  };

  function authProvider(uri, domain) {
    var dfd = defer();

    radiotag.getAuthProvider(uri, function (error, authProviderBaseUrl, modes) {
      if (error) {
        dfd.reject(error);
      } else {
        console.log('  authProviderBaseUrl: ', authProviderBaseUrl);
        console.log('  modes: ', modes);
        dfd.resolve({
          // stationId: stationId,
          uri: uri,
          domain: domain,
          authProviderBaseUrl: authProviderBaseUrl,
          modes: modes
        });
      }
    });

    return dfd.promise;
  }

  /*
    Register for a clientId and clientSecret
  */
  function register(params) {
    var dfd = defer();

    console.log('\nCPA register');
    console.log('  authProviderBaseUrl', params.authProviderBaseUrl);

    console.log('  domain', params.domain);
    params.domain = params.domain || radiotag.utils.getDomain(params.uri);
    console.log('  domain', params.domain);

    cpa.device.registerClient(
      params.authProviderBaseUrl,
      'My Device Name',
      'radiotag-radio-test',
      '0.0.1',
      function (error, clientId, clientSecret) {
        if (error) {
          dfd.reject(error);
        } else {
          console.log('\nRegistered:');
          console.log('  clientId %s, clientSecret %s', clientId, clientSecret);
          params.clientId = clientId;
          params.clientSecret = clientSecret;
          dfd.resolve(params);
        }
      }
    );

    return dfd.promise;
  }

  /*
    CPA:
      Get a user code to show to user
  */
  function requestUserCode(params) {
    var dfd = defer();
    console.log('\nCPA request user code with ');
    console.log('  authProvider', params.authProviderBaseUrl);
    console.log('  clientId', params.clientId);
    console.log('  clientSecret', params.clientSecret);
    console.log('  domain', params.domain);

    cpa.device.requestUserCode(
      params.authProviderBaseUrl,
      params.clientId,
      params.clientSecret,
      params.domain,
      function (error, data) {
        if (error) {
          dfd.reject(error);
        } else {
          console.log('Got user code');
          params.user = data;
          dfd.resolve(params);
        }
      }
    );

    return dfd.promise;
  }

  return instance;
}