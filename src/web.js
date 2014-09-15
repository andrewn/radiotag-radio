var EventEmitter = require('events').EventEmitter,
    Hapi = require('hapi'),
    server = new Hapi.Server(process.env.PORT || 3000);

module.exports = {
  create: create
};

function create() {
  var instance = new EventEmitter();


  server.start(function () {
    console.log('Server running at:', server.info.uri);
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply.file(__dirname + '/../static/index.html');
    }
  });

  server.route({
    method: 'POST',
    path: '/buttons/{num}',
    handler: function (request, reply) {
      var number = request.params.num;
      console.log('POST', request.path, number);
      instance.emit('button', number);
      reply.redirect('/');
    }
  });

  return instance;
}