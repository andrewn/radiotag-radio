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
    { name: 'power',  from: 'playing', to: 'standby' },
    { name: 'volumeup',  from: 'playing', to: 'playing' },
    { name: 'volumedown',  from: 'playing', to: 'playing' },
    { name: 'stationnext',  from: 'playing', to: 'playing' },
    { name: 'stationprevious',  from: 'playing', to: 'playing' }
  ],
  callbacks: {
    oninit: init,
    onloaded: loaded,
    onpower: power,
    onvolumeup: volumeup,
    onvolumedown: volumedown,
    onstationnext: stationNext,
    onstationprevious: stationPrevious
  }
});

module.exports = fsm;

function init(event, from, to) {
  log(arguments);
  fsm.loaded();
}

function loaded(event, from, to) {
  log(arguments);
  radio.pause();
}

function power(event, from, to, ui) {
  log(arguments);
  if (to === 'playing') {
    // start radio
    radio.play();
    ui.display(radio.station, 'Volume: ' + radio.volume);
  } else if (to === 'standby') {
    // stop radio
    radio.pause();
    ui.display('Standby');
  }
}

function volumeup(event, from, to, ui) {
  log(arguments);
  radio.volumeUp();
  ui.display(radio.station, 'Volume: ' + radio.volume);
}

function volumedown(event, from, to, ui) {
  log(arguments);
  radio.volumeDown();
  ui.display(radio.station, 'Volume: ' + radio.volume);
}

function stationNext(event, from, to, ui) {
  log(arguments);
  radio.stationNext();
  ui.display(radio.station);
}

function stationPrevious(event, from, to, ui) {
  log(arguments);
  radio.stationPrevious();
  ui.display(radio.station);
}



/* Helpers */
function log(args) {
  args = Array.prototype.slice.call(args, 0);
  console.log.apply(console, ['  %s: %s -> %s (%s)'].concat(args) );
}