var EventSource = require('eventsource'),
    EventEmitter = require('events').EventEmitter;

module.exports = {
  connectWeb: connectWeb,
  connectSocket: connectSocket
};

function connectWeb(url) {
  var instance = new EventEmitter();

  var source = new EventSource(url);
  source.onmessage = function (e) {
    var data = JSON.parse(e.data);
    if (data && data.id != null) {
      instance.emit('button', data.id);
    }
  };
  source.onerror = function() {
    console.log('ERROR!');
  };

  return instance;
}

function connectSocket(path) {
  var instance = new EventEmitter();

  var socket = require('net').connect(path, function () {
    console.log('connected', arguments);
    // socket.write('blah');
    socket.on('data', function (buffer) {
      var raw  = buffer.toString(),
          data = JSON.parse(raw);
      console.log('raw', raw);
      console.log('data', data);
      if (data.type === 'button' && data.id != null) {
        console.log('emit', data.id);
        instance.emit('button', data.id);
      }
    });
  });

  return instance;
}