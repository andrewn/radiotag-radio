var states = require('./states'),
    web    = require('./web');

module.exports = {
  init: function (config) {
    config = config || {};
    states.init();

    web.init();
  }
};