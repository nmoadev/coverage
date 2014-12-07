/**
* Created by akuchta on 12/6/14.
*/
var EventEmitter = require('events').EventEmitter,
    _ = require('lodash'),
    GameBoard = require('gameboard'),
    Match;


module.exports = Match = function Match(config) {
  var match = {},
      matchCode = '',
      players = {},
      playerCount = 0,
      playerOrder = [],
      rounds = [],
      colors = ['red', 'blue', 'green', 'orange', 'yellow', 'violet'],
      gameBoard = GameBoard(config),
      currentRound,
      onTurnAccepted,
      onRoundAccepted,
      onRoundScored,
      onRoundStarted,
      onMatchEnded;

  /**
   * Setup/Initialization
   */

  // Make the match an EventEmitter
  util.inherits(match, EventEmitter);
  matchCode = config.matchCode;

  /**
   * Public methods
   */

  match.getMatchCode = function getMatchCode() {
    return matchCode;
  };

  match.roundNumber = function getRoundNumber() {
    return rounds.length;
  };

  /**
   * Adds a player to the match.
   * @param playerName
   */
  match.addPlayer = function addPlayers(playerName) {
    var newPlayerColor = null;
    // Add a new player with the next color
    if (colors.length < 1) {
      throw new Error("Ran out of colors for players - never expected this many players");
    }

    // Enforce logical player limit
    if (playerCount > config.maxPlayers) {
      return false;
    }

    newPlayerColor = colors.pop();
    players[newPlayerColor] = {
      name: playerName,
      score: 0
    };
    playerOrder.push(newPlayerColor);
    playerCount++;

    return true;
  };

  /**
   * Called when a player submits their actions. This method will cause one of two events to be emitted
   * 'turnAccepted' or 'turnRejected' which will trigger the scoring action. This is done so quick feedback can be given
   * @param playerColor - the color of the player submitting actions
   * @param actions - the array of actions
   * @emits 'turnAccepted' OR 'turnRejected'
   * @returns {boolean}
   */
  match.submitTurn = function submitTurn(playerColor, actions) {
      var currentRound = currentRound(),
      turnAccepted = false;

    // If this player has not already submitted their actions for this round
    // TODO: enforce player color to session binding elsewhere to stop players from faking out as each other.
    if (!currentRound[playerColor]) {
      currentRound[playerColor] = {
        actions: actions,
        score: 0
      };
      turnAccepted = true;
    }

    if (turnAccepted) {
      match.emit('turnAccepted', playerColor);
    } else {
      match.emit('turnRejected', playerColor);
    }

    // Indicate that submission was rejected.
      return turnAccepted;
  };

  match.matchData = function () {
    var playerData = {};
    _.each(players, function(player, playerColor){
      playerData[playerColor] = _.pick(player, 'name', 'totalScore');
    });

    return {
      matchCode: matchCode,
      players: playerData
    }
  };

  match.roundData = function () {
    var roundData = {};
    _.each(currentRound(), function(turn, playerColor) {
      roundData[playerColor] = _.pick(turn, 'score');
    });

    return roundData;
  };


  currentRound = function currentRound() {
    return rounds[rounds.length - 1];
  };

  /**
   * Build up event handlers to create game flow
   */

  onRoundStarted = function onRoundStarted() {

  };

  onTurnAccepted = function onTurnAccepted(playerColorAccepted) {
    var allTurnsSubmitted = true,
        currentRound = currentRound();
    // Check that every player has submitted their actions
    _.each(players, function(player, playerColor) {
      allTurnsSubmitted = allTurnsSubmitted && !!currentRound[playerColor];
    });
    match.emit('roundAccepted', currentRound);
  };

  onRoundAccepted = function onRoundAccepted(currentRound) {
    // Score the round
    gameBoard.scoreRound(currentRound);

    // For each player turn in the current round
    _.each(currentRound, function(playerTurn, playerColor) {
      // Add the score gained by each player to their overall score.
      players[playerColor].score += playerTurn.score;
    });
    match.emit('roundScored', currentRound);
  };

  onRoundScored = function onRoundScored(currentRound) {
    if (rounds.length === config.rounds) {
      // The match is over
      match.emit('matchEnded');
    } else {
      // Start a new round
      rounds.push({});
      playerOrder.reverse();
      match.emit('roundStarted');
    }
  };

  onMatchEnded = function onMatchEnded() {

  };


  // Add event listeners
  match
    .on('roundStarted', onRoundStarted)
    .on('turnAccepted', onTurnAccepted)
    .on('roundAccepted', onRoundAccepted)
    .on('roundScored', onRoundScored)
    .on('matchEnded', onMatchEnded);


  // Return the public interface
  return match;
};