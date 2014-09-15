var EventEmitter = require('events').EventEmitter

module.exports = {
  create: create
};

function create() {
  var instance = new EventEmitter();

  instance.station = '6music';
  instance.volume  = 0;

  instance.play = function () {
    console.log('Radio: play', instance.station);
  };

  instance.pause = function () {
    console.log('Radio: pause', instance.station);
  };

  return instance;
}