var EventEmitter = require('events').EventEmitter,
    _ = require('lodash'),
    defer = require('radiodan-client').utils.promise.defer;

module.exports = {
  create: create
};

function create() {
  var instance = new EventEmitter();

  instance.tag = function (id) {
    console.log('Fake tag', id);
    var dfd = defer();

    return dfd.promise;
  };

  return instance;
}