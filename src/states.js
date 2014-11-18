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
      { name: 'tag',  from: ['playing', 'paired'], to: 'tagging' },
      { name: 'tagged',  from: 'tagging', to: 'displayTag' },
      { name: 'ok',  from: 'displayTag', to: 'playing' },
      { name: 'unauthorised',  from: 'tagging', to: 'needToPair' },
      { name: 'pair',  from: 'needToPair', to: 'pairing' },
      { name: 'usercode',  from: 'pairing', to: 'awaitAccessToken' },
      { name: 'accesstoken',  from: 'awaitAccessToken', to: 'paired' },
      { name: 'cancel',  from: 'needToPair', to: 'playing' },
      { name: 'cancel',  from: 'pairing', to: 'playing' },
      { name: 'cancel',  from: 'awaitAccessToken', to: 'playing' },
      { name: 'reset',  from: '*', to: 'standby' }
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
      ontagged: tagged,
      onunauthorised: unauthorised,
      oncancel: cancel,
      onpair: pair,
      onusercode: usercode,
      onaccesstoken: accessToken,
      onreset: reset,

      // Enter/Leave States
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
      ui.display(radio.station, 'Vol: ' + radio.volume);
    } else if (to === 'standby') {
      ui.display('Standby');
    }
  }

  function volumeup(event, from, to) {
    log(arguments);
    radio.volumeUp();
    ui.display(radio.station, 'Vol: ' + radio.volume);
  }

  function volumedown(event, from, to) {
    log(arguments);
    radio.volumeDown();
    ui.display(radio.station, 'Vol: ' + radio.volume);
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
            function (tag) {
              console.log('tag', tag);
              fsm.tagged(tag);
            },
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

  function tagged(event, from, to, tagInfo) {
    log(arguments);
    ui.display('Tagged', tagInfo.title);
    // Display message for 3s and then clear
    setTimeout(function () { fsm.ok(); }, 3000);
  }

  function unauthorised(event, from, to) {
    log(arguments);
    fsm.pair();
  }

  function cancel(event, from, to) {
    log(arguments);
    fsm.playing();
  }

  function pair(event, from, to) {
    log(arguments);
    var tagServiceUrl = config.tagServiceUrl;
    tagger.getUserCode(tagServiceUrl, 'radiotag.api.bbci.co.uk')
          .then(
            function (data) {
              console.log('pair:', data);
              fsm.usercode(data.url, data.userCode);
            },
            function (error) {
              console.error('tagger.pair: error', error);
              fsm.cancel();
            }
          );
  }

  function usercode(event, from, to, url, userCode) {
    log(arguments);
    ui.display(url, 'Code: ' + userCode);

    tagger.getAccessToken()
          .then(
            function (accessToken) {
              console.log('accessToken', accessToken);
              fsm.accesstoken(accessToken);
            },
            function (error) {
              console.err('error', accessToken);
              fsm.cancel();
            }
          );
  }

  function accessToken(event, from, to, accessToken) {
    log(arguments);
    ui.display('Paired', tagger.userName() || '');
    fsm.tag();
  }

  function reset(event, from, to) {
    ui.display('RESET');
    tagger.reset();
  }

  /* Helpers */
  function log(args) {
    args = Array.prototype.slice.call(args, 0);
    console.log.apply(console, ['  %s: %s -> %s (%s)'].concat(args) );
  }

  return fsm;
}