var states = require('./states'),
    ui;

// ui = require('./physical').connectWeb('http://localhost:4000/buttons');
ui = require('./physical').connectSocket('./uds_socket');

var Buttons = {
  power: 0,
  stationPrevious: 1,
  stationNext: 2,
  volumeDown: 5,
  volumeUp: 7
};

var web;

module.exports = {
  init: function (config) {
    config = config || {};
    states.init();

    ui.on('button', function (num) {
      console.log('Button %s pressed', num);

      switch (num) {
        case Buttons.power:
          transition('power');
          break;
        case Buttons.volumeUp:
          transition('volumeup');
          break;
        case Buttons.volumeDown:
          transition('volumedown');
          break;
        case Buttons.stationPrevious:
          transition('stationprevious');
          break;
        case Buttons.stationNext:
          transition('stationnext');
          break;
      }
    });

    function transition(target) {
      if (states.can(target)) {
        states[target](ui);
      }
    }
  },
  destroy: function () {
    if (states.current !== 'standby') {
      states.power();
    }
  }
};