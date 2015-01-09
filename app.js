var Express = require('express'),
    Logger = require('morgan'),
    BodyParser = require('body-parser'),
    debug = require('debug')('efight-server'),
    SocketIO = require('socket.io'),
    MatchManager = require(__dirname + '/lib/MatchManager'),
    MatchConnector = require(__dirname + '/lib/MatchConnector'),
    path = require('path'),
    app,
    httpServer,
    matchChannel,
    io,
    matchManager;

matchManager = MatchManager({
  matchConfig: {
    maxPlayers: 2,
    rounds: 4,
    boardConfig: {
      rows: 5,
      cols: 5
    }
  }
});


app = Express();
app.use(Logger('dev'));
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: false }));
app.use(Express.static(path.join(__dirname, 'public')));

httpServer = require('http').Server(app);
io = SocketIO(httpServer);
matchChannel = io.of('/match');

matchChannel.on('connect', function onConnect(socket) {
  console.log('connection');
  MatchConnector(socket, matchManager);
});






// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handlers

// development error handler
// will print stacktrace

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
        message: err.message,
        error: err
    });
});


module.exports = {app:app, httpServer:httpServer};
