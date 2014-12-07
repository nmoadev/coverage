/**
 * Created by akuchta on 12/6/14.
 */
module.exports = function MatchConnector(socket, matchManager) {
  var glueSocketToMatch;

  socket.on('connect', function(socket) {
     socket.on('joinMatch', function(gameCode, playerName, fn) {
       // Get the existing match or make a new one
       match = matchManager.getMatchForGameCode(gameCode);

       // Add the player who joined on this socket
       match.addPlayer(playerName, socket);

       // Join this socket to the room for the match
       socket.join(match.getMatchCode());

       socket.emit('matchJoined', match.clientData());

       fn(true);

       glueSocketToMatch(socket, match);
     });
  });

  glueSocketToMatch = function glueSocketToMatch(socket, match) {
    socket
      .on('submitTurn', function(turn) {
        match.submitTurn(turn);
      });

    match
      .on('roundStarted', function(){

      })
      .on('turnAccepted', function(playerColorAccepted) {
        socket.emit('turnAccepted');
      })
      .on('roundAccepted', function(currentRound) {
        socket.emit('roundAccepted');
      })
      .on('roundScored', function(currentRound) {
        socket.emit('roundScored', match.roundNumber(), match.roundData());
      })
      .on('matchEnded', function(){

      });
  };
};