var EventSource = require('eventsource'),
    EventEmitter = require('events').EventEmitter;

module.exports = { create: create };

function create(url) {
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