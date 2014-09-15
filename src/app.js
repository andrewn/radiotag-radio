var states = require('./states'),
    Web    = require('./web');

var web;

module.exports = {
  init: function (config) {
    config = config || {};
    states.init();

    web = Web.create();
    web.on('button', function (num) {
      console.log('Button %s pressed', num);
      if (num === '1') {
        states.power();
      }
    });
  }
};