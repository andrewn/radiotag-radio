var states = require('./states'),
    Web    = require('./web');

var Buttons = {
  power: '1',
  stationPrevious: '2',
  stationNext: '3',
  volumeDown: '6',
  volumeUp: '8'
};

var web;

module.exports = {
  init: function (config) {
    config = config || {};
    states.init();

    web = Web.create();
    web.on('button', function (num) {
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
    });
  },
  destroy: function () {
    if (states.current !== 'standby') {
      states.power();
    }
  }
};