var EventEmitter = require('events').EventEmitter,
    _ = require('lodash'),
    radiotag = require('radiotag.js'),
    cpa = require('cpa.js'),
    defer = require('radiodan-client').utils.promise.defer,
    LocalStorage = require('node-localstorage').LocalStorage;

module.exports = {
  create: create
};

function accessTokenExistsError() {
  var error = new Error('Access token already exists');
  error.name = 'AccessTokenExists';
  return error;
}

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
    var dfd = defer(),
        accessToken = storage.getItem('accesToken'),
        deviceCode = storage.getItem('deviceCode');

    if (accessToken) {
      dfd.reject( accessTokenExistsError() );
    } else if (deviceCode) {
      dfd.resolve({
        url: storage.getItem('verificationUrl'),
        userCode: storage.getItem('userCode')
      });
    } else if (serviceUri == null) {
      dfd.reject( noServiceUriError() );
    } else {
      console.log('tagger.pair: ', serviceUri);

      authProvider(serviceUri, domain)
        .then(register)
        .then(requestUserCode)
        .then(
          function (data) {
            dfd.resolve({
              url: storage.getItem('verificationUrl'),
              userCode: storage.getItem('userCode')
            });
          },
          dfd.reject
        );
    }

    return dfd.promise;
  };

  instance.userName = function () {
    return storage.getItem('username');
  };

  instance.getAccessToken = function () {
    var dfd = defer();

    var pollIntervalInSecs = storage.getItem('accessTokenPollInterval') * 1000;

    console.log('pollIntervalInSecs', pollIntervalInSecs);

    /* Does a single request for access token
       and resolve, rejects or schedules another request
    */
    function requestAccessToken() {
      process.stdout.write('.');

      cpa.device.requestUserAccessToken(
        storage.getItem('authProviderBaseUrl'),
        storage.getItem('clientId'),
        storage.getItem('clientSecret'),
        storage.getItem('deviceCode'),
        storage.getItem('domain'),
        function (error, data) {
          if (error) {
            console.log('reject ', error);
            dfd.reject(error);
          } else if (data) {
            console.log('  access token data: ', data);
            storage.setItem('accessToken', data.access_token);
            storage.setItem('username', data.user_name);
            dfd.resolve(data.access_token);
          } else {
            console.log('set timeout')
            setTimeout(requestAccessToken, pollIntervalInSecs);
          }
        }
      );
    }

    var accessToken = storage.getItem('accessToken');

    if (accessToken) {
      console.log('tagger.getAccessToken: already have access token', accessToken)
      dfd.resolve(accessToken);
    } else {
      console.log('no access token, polling');
      requestAccessToken();
    }

    return dfd.promise;
  };

  instance.reset = function () {
    [ 'username', 'accessToken', 'accessTokenPollInterval', 'authProviderBaseUrl', 'clientId', 'clientSecret', 'deviceCode', 
      'domain', 'modes', 'serviceUrl', 'userCode', 'verificationUrl'
    ].forEach(function (key) {
      storage.removeItem(key);
    });
  };

  function authProvider(uri, domain) {
    var dfd = defer();

    console.log('authProvider', uri, domain)

    radiotag.getAuthProvider(uri, function (error, authProviderBaseUrl, modes) {
      if (error) {
        console.error('  error', error)
        dfd.reject(error);
      } else {
        console.log('  authProviderBaseUrl: ', authProviderBaseUrl);
        console.log('  modes: ', modes);
        storage.setItem('serviceUrl', uri);
        storage.setItem('domain', domain);
        storage.setItem('authProviderBaseUrl', authProviderBaseUrl);
        try {
          storage.setItem('modes', JSON.stringify(modes));
        } catch (e) {
          console.error('error serialising modes', modes);
        }

        dfd.resolve();
      }
    });

    return dfd.promise;
  }

  /*
    Register for a clientId and clientSecret
  */
  function register() {
    console.log('register');

    var dfd = defer(),
        authProviderBaseUrl = storage.getItem('authProviderBaseUrl');

    console.log('\nCPA register');
    console.log('  authProviderBaseUrl', authProviderBaseUrl);

    cpa.device.registerClient(
      authProviderBaseUrl,
      'My Device Name',
      'radiotag-radio-test',
      '0.0.1',
      function (error, clientId, clientSecret) {
        if (error) {
          dfd.reject(error);
        } else {
          console.log('\nRegistered:');
          console.log('  clientId %s, clientSecret %s', clientId, clientSecret);

          storage.setItem('clientId', clientId);
          storage.setItem('clientSecret', clientSecret);

          dfd.resolve();
        }
      }
    );

    return dfd.promise;
  }

  /*
    CPA:
      Get a user code to show to user
  */
  function requestUserCode() {
    var dfd    = defer(),
        domain = storage.getItem('domain');

    if (!domain) {
      domain = radiotag.utils.getDomain( storage.getItem('serviceUrl') );
      storage.setItem('domain', domain);
    }

    cpa.device.requestUserCode(
      storage.getItem('authProviderBaseUrl'),
      storage.getItem('clientId'),
      storage.getItem('clientSecret'),
      storage.getItem('domain'),
      function (error, data) {
        if (error) {
          dfd.reject(error);
        } else {
          console.log('Got user code', data);

          storage.setItem('verificationUrl', data.verification_uri);
          storage.setItem('userCode', data.user_code);
          storage.setItem('deviceCode', data.device_code);
          storage.setItem('accessTokenPollInterval', data.interval);

          dfd.resolve();
        }
      }
    );

    return dfd.promise;
  }

  return instance;
}