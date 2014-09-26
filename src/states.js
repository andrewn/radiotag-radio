var StateMachine = require('javascript-state-machine'),
    radio        = require('./radio').create(),
    tagger       = require('./tagger').create('./db/storage');

var ui;

module.exports = function (config) {
  ui = config.ui;

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
      { name: 'stationprevious',  from: 'playing', to: 'playing' },
      { name: 'tag',  from: 'playing', to: 'tagging' },
      { name: 'unauthorised',  from: 'tagging', to: 'needToPair' },
      { name: 'cancel',  from: 'needToPair', to: 'playing' }
    ],
    callbacks: {
      // Transitions
      oninit: init,
      onloaded: loaded,
      onpower: power,
      onvolumeup: volumeup,
      onvolumedown: volumedown,
      onstationnext: stationNext,
      onstationprevious: stationPrevious,
      ontag: tag,
      onunauthorised: unauthorised,
      oncancel: cancel,

      // States
      onenterplaying: playing,
      onleaveplaying: playing
    }
  });

  function init(event, from, to) {
    log(arguments);
    fsm.loaded();
  }

  function loaded(event, from, to) {
    log(arguments);
    ui.display('Standby');
    radio.pause();
  }

  function power(event, from, to) {
    log(arguments);
    if (to === 'playing') {
      // start radio
      radio.play();
    } else if (to === 'standby') {
      // stop radio
      radio.pause();
    }
  }

  function playing(event, from, to) {
    log(arguments);
    if (to === 'playing') {
      ui.display(radio.station, 'Volume: ' + radio.volume);
    } else if (to === 'standby') {
      ui.display('Standby');
    }
  }

  function volumeup(event, from, to) {
    log(arguments);
    radio.volumeUp();
    ui.display(radio.station, 'Volume: ' + radio.volume);
  }

  function volumedown(event, from, to) {
    log(arguments);
    radio.volumeDown();
    ui.display(radio.station, 'Volume: ' + radio.volume);
  }

  function stationNext(event, from, to) {
    log(arguments);
    radio.stationNext();
    ui.display(radio.station);
  }

  function stationPrevious(event, from, to) {
    log(arguments);
    radio.stationPrevious();
    ui.display(radio.station);
  }

  function tag(event, from, to) {
    log(arguments);
    var info = radio.currentInfo(),
        dabStationId = info.dabId,
        tagServiceUrl = config.tagServiceUrl;

    tagger.tag(dabStationId, tagServiceUrl)
          .then(
            function (tag) { fsm.tagged(tag); },
            function (error) {
              console.error('Error', error.name);
              if (error.name === 'NoAccessToken') {
                console.error('Need to pair');
                fsm.unauthorised();
              }
            }
          );

    ui.display('Tagging...');
  }

  function unauthorised(event, from, to) {
    fsm.cancel();
  }

  function cancel(event, from, to) {
    fsm.playing();
  }

  /* Helpers */
  function log(args) {
    args = Array.prototype.slice.call(args, 0);
    console.log.apply(console, ['  %s: %s -> %s (%s)'].concat(args) );
  }

  return fsm;
}