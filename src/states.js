var StateMachine = require('javascript-state-machine');

var fsm = StateMachine.create({
  initial:  { state: 'loading', event: 'init', defer: true },
  events: [
    { name: 'loaded', from: 'loading', to: 'standby' },
    { name: 'power',  from: 'standby', to: 'starting' },
    { name: 'started',  from: 'starting', to: 'playing' }
  ],
  callbacks: {
    oninit: init,
    onloaded: loaded,
    onpower: power,
    onstarted: started
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
}

function started(event, from, to, msg) {
  log(arguments);
}

/* Helpers */
function log(args) {
  args = Array.prototype.slice.call(args, 0);
  console.log.apply(console, ['  %s: %s -> %s (%s)'].concat(args) );
}