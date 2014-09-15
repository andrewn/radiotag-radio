var App = require('./src/app');

App.init();

process.on('SIGINT', function() {
    console.log("Caught interrupt signal");

    App.destroy();
    process.exit();
});