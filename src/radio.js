var EventEmitter = require('events').EventEmitter,
    radiodan     = require('radiodan-client').create(),
    services     = require('./bbc-services').create().connect();

module.exports = {
  create: create
};

function create() {
  var instance = new EventEmitter(),
      player = radiodan.player.get(1),
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
    audio.volume({ diff: 5 });
  };

  instance.volumeDown = function () {
    audio.volume({ diff: -5 });
  };

  return instance;
}


function extractStream(service) {
  var url = {};

  if (service && service.audioStreams) {
    url = service.audioStreams[0];
  }

  return url;
}