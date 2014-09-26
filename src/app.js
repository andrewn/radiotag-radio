var statesFactory = require('./states'),
    ui;

var Buttons = {
  power: 0,
  stationPrevious: 1,
  stationNext: 2,
  volumeDown: 6,
  volumeUp: 7,
  tag: 4,
  reset: 3
};

var web,
    states;

module.exports = {
  init: function (config) {
    config = config || {};

    if (!config.socketPath) {
      throw new Error('config.socketPath is required');
    }

    // ui = require('./physical').connectWeb('http://localhost:4000/buttons');
    ui = require('./physical').connectSocket(config.socketPath);

    states = statesFactory({ ui: ui, tagServiceUrl: config.tagServiceUrl });
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
        case Buttons.tag:
          transition('tag');
          break;
        case Buttons.reset:
          transition('reset');
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