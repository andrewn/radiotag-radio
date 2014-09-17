var EventEmitter = require('events').EventEmitter,
    _ = require('lodash'),
    radiodan     = require('radiodan-client').create(),
    services     = require('./bbc-services').create().connect();

module.exports = {
  create: create
};

function create() {
  var instance = new EventEmitter(),
      player = radiodan.player.get('main'),
      audio  = radiodan.audio.get('default'),
      stations;

  services.ready
          .then(services.stations)
          .then(function (s) {
            stations = s;
          });

  instance.station = '6music';
  instance.volume  = 0;

  instance.play = function () {
    console.log('Radio: play', instance.station);

    var service = services.get(instance.station)

    var url = extractStream(service).url;

    if (url) {
      player.clear();
      player.add({playlist: [url]});
      player.play();
    }
  };

  instance.pause = function () {
    console.log('Radio: pause', instance.station);
    player.stop();
  };

  instance.volumeUp = function () {
    instance.volume += 5
    audio.volume({ value: instance.volume });
  };

  instance.volumeDown = function () {
    instance.volume -= 5
    audio.volume({ value: instance.volume });
  };

  instance.stationNext = function () {
    var stationId = findId(stations, instance.station, 1);

    if (stationId) {
      instance.station = stationId;
      instance.play();
    }
  };

  instance.stationPrevious = function () {
    var stationId = findId(stations, instance.station, -1);

    if (stationId) {
      instance.station = stationId;
      instance.play();
    }
  };

  return instance;
}

function findId(stations, currentId, offset) {
  var index = _(stations).findIndex(
    function (item) { return item.id === currentId }
  ),
  adjacent,
  target = {};

  if (index > -1) {
    adjacentIndex = index + offset;
    target = stations[adjacentIndex % stations.length];
  }

  return target.id;
}

function extractStream(service) {
  var url = {};

  if (service && service.audioStreams) {
    url = service.audioStreams[0];
  }

  return url;
}