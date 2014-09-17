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
          states.power();
          break;
        case Buttons.volumeUp:
          states.volumeup();
          break;
        case Buttons.volumeDown:
          states.volumedown();
          break;
        case Buttons.stationPrevious:
          states.stationprevious();
          break;
        case Buttons.stationNext:
          states.stationnext();
          break;
      }

      updateDisplay(states);
    });

    function updateDisplay(states) {
      ui.display(states.current);
    }
  },
  destroy: function () {
    if (states.current !== 'standby') {
      states.power();
    }
  }
};