/**
 * Created by akuchta on 12/6/14.
 */
var glueSocketToMatch = function glueSocketToMatch(socket, match) {
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

module.exports = function matchConnector(socket, matchManager) {
     socket.on('joinMatch', function(matchCode, playerName, fn) {
       // Get the existing match or make a new one
       match = matchManager.getMatch(code);

       // Add the player who joined on this socket
       match.addPlayer(playerName, socket);

       // Join this socket to the room for the match
       socket.join(match.getMatchCode());

       socket.emit('matchJoined', match.clientData());

       fn(true);

       glueSocketToMatch(socket, match);
     });
};