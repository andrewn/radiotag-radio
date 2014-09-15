var StateMachine = require('javascript-state-machine'),
    radio        = require('./radio').create();

var fsm = StateMachine.create({
  initial:  { state: 'loading', event: 'init', defer: true },
  // error: function(eventName, from, to, args, errorCode, errorMessage) {
  //   return 'event ' + eventName + ' not valid. ' + errorMessage;
  // },
  events: [
    { name: 'loaded', from: 'loading', to: 'standby' },
    { name: 'power',  from: 'standby', to: 'playing' },
    { name: 'power',  from: 'playing', to: 'standby' }
  ],
  callbacks: {
    oninit: init,
    onloaded: loaded,
    onpower: power
  }
});

module.exports = fsm;

function init(event, from, to, msg) {
  log(arguments);
  fsm.loaded();
}

function loaded(event, from, to, msg) {
  log(arguments);
}

function power(event, from, to, msg) {
  log(arguments);
  if (to === 'playing') {
    // start radio
    radio.play();
  } else if (to === 'standby') {
    // stop radio
    radio.pause();
  }
}

/* Helpers */
function log(args) {
  args = Array.prototype.slice.call(args, 0);
  console.log.apply(console, ['  %s: %s -> %s (%s)'].concat(args) );
}