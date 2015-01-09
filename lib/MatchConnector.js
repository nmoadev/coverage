/**
 * Created by akuchta on 12/6/14.
 */
var glueSocketToMatch = function glueSocketToMatch(socket, match) {
  socket
    .on('submitTurn', function(turn) {
      match.submitTurn(turn);
    });

  match
    .on('roundStarted', function(currentRound) {
      socket.emit('roundStarted', currentRound);
    })
    .on('turnAccepted', function(playerColorAccepted) {
      socket.emit('turnAccepted', playerColorAccepted);
    })
    .on('roundAccepted', function(currentRound) {
      socket.emit('roundAccepted', currentRound);
    })
    .on('roundScored', function(currentRound) {
      socket.emit('roundScored', match.roundNumber(), match.roundData());
    })
    .on('matchEnded', function() {
      socket.emit('matchEnded'); 
    });
};

module.exports = function matchConnector(socket, matchManager) {
    console.log('MatchConnector -------');
     socket.on('joinMatch', function onJoinMatch(matchCode, playerName, fn) {
       var newPlayerColor;
       console.log('[joinMatch] ' + matchCode + ' : ' +  playerName);
       // Get the existing match or make a new one
       match = matchManager.getMatch(matchCode);

       // Add the player who joined on this socket
       newPlayerColor = match.addPlayer(playerName, socket);

       // Join this socket to the room for the match
       socket.join(match.getMatchCode());

       socket.emit('matchJoined', {matchCode: match.getMatchCode(), playerColor: newPlayerColor});


       glueSocketToMatch(socket, match);
     });
};
