/**
* Created by akuchta on 12/6/14.
*/
var EventEmitter = require('events').EventEmitter,
    _ = require('lodash'),
    util = require('util'),
    GameBoard = require(__dirname + '/../public/js/common/gameboard'),
    colors = ['red', 'blue', 'green', 'orange', 'yellow', 'violet'],
    Match,
    MatchEvents,
    MatchStates;

MatchEvents = {
  wait_players: 'wait_players',
  add_player: 'add_player',
  start_match: 'start_match',
  start_round: 'start_round',
  accept_turn: 'accept_turn',
  reject_turn: 'reject_turn',
  end_round: 'end_round',
  end_match: 'end_match'
};

MatchStates = {
  start: 'start',
  wait_players: 'wait_players',
  wait_turns: 'wait_turns',
  wait_scoring: 'scoring',
  end: 'end'
};


module.exports = function Match(config) {
    var match_public = {},
        match_private = {
          matchCode : '',
          players : {},
          playerCount : 0,
          playerOrder : [],
          rounds : [],
          gameBoard : GameBoard(config.boardConfig),
          state : MatchStates.wait_players
        };

    /**
     * # Setup/Initialization
     */

      // Make the match an EventEmitter
    match_public = Object.create(new EventEmitter());
    match_private.matchCode = '' + (config.matchCode || _.random(50000).toString(36));

    /**
     * # Public methods
     */

    /**
     * ## Accessor Methods
     * 
     * These have no effect on state
     */

    match_public.getState = function getState() {
      return match_private.state;
    };

    match_public.getMatchCode = function getMatchCode() {
      return match_private.matchCode;
    };

    match_public.getRoundCount = function getRoundCount() {
      return match_private.rounds.length;
    };

    match_public.getCurrentRoundNumber = function getCurrentRoundNumber() {
      return match_private.rounds.length;
    };

    match_public.getCurrentRound = function getCurrentRound() {
      return match_private.rounds[match_private.rounds.length - 1];
    };

    /**
     * Builds a representation of the match suitable for the UI
     */
    match_public.getMatchData = function () {
      var playerData = {};
      _.each(players, function (player, playerColor) {
        playerData[playerColor] = _.pick(player, 'name', 'totalScore');
      });

      return {
        matchCode: matchCode,
        players: playerData,
        roundCount: match_public.getRoundCount(),
        currentRoundNumber: match_public.getCurrentRoundNumber()
      }
    };

    /**
     * Builds a representation of the current round suitable for the UI
     */
    match_public.getRoundData = function () {
      var roundData = {};
      _.each(match_public.getCurrentRound(), function (turn, playerColor) {
        roundData[playerColor] = _.pick(turn, 'score', 'actions');
      });

      return roundData;
    };
    
    /**
     * ## Action Methods
     *
     * These change the state of the match
     */

    /**
     * Adds a player to the match.
     * @param playerName
     */
    match_public.addPlayer = function addPlayers(playerName) {
      var newPlayerColor = null;
      // Add a new player with the next color
      if (match_private.playerCount > colors.length) {
        throw new Error("Ran out of colors for players - never expected this many players");
      }

      // Enforce logical player limit
      if (match_private.playerCount > config.maxPlayerCount) {
        return false;
      }

      newPlayerColor = colors[match_private.playerCount];
      match_private.players[newPlayerColor] = {
        name: playerName,
        score: 0
      };
      match_private.playerOrder.push(newPlayerColor);
      match_private.playerCount++;

      match_public.emit(MatchEvents.add_player, newPlayerColor);
      return newPlayerColor;
    };

    /**
     * Called when a player submits their actions. This method will cause one of two events to be emitted
     * 'turnAccepted' or 'turnRejected' which will trigger the scoring action. This is done so quick feedback can be given
     * @param playerColor - the color of the player submitting actions
     * @param actions - the array of actions
     * @emits 'turnAccepted' OR 'turnRejected'
     * @returns {boolean}
     */
    match_public.submitTurn = function submitTurn(turn) {
      var currentRound = match_public.getCurrentRound(),
        turnAccepted = false;

      // If this player has not already submitted their actions for this round
      // TODO: enforce player color to session binding elsewhere to stop players from faking out as each other.
      if (!currentRound[turn.playerColor]) {
        currentRound[turn.playerColor] = {
          actions: turn.actions,
          score: 0
        };
        turnAccepted = true;
      }

      if (turnAccepted) {
        match_public.emit(MatchEvents.accept_turn, turn.playerColor);
      } else {
        match_public.emit(MatchEvents.reject_turn, turn.playerColor);
      }

      // Indicate that submission was rejected.
      return turnAccepted;
    };

   
    /**
     * # Private Methods
     *
     */


    /**
     * ## Event Handlers
     *
     * These will implement the game flow
     */

    match_private.onAddPlayer = function onAddPlayer(playerColor) {
      if (match_private.playerCount === config.maxPlayerCount) {
        match_public.emit(MatchEvents.start_match);
      } else {
        match_private.state = MatchStates.wait_players;
      }
    };

    match_private.onStartMatch = function onStartMatch() {
      match_public.emit(MatchEvents.start_round);
    }; 
    
    match_private.onStartRound = function onStartRound() {
      match_private.state = MatchStates.wait_turns;
    };

    match_private.onAcceptTurn = function onAcceptTurn(playerColorAccepted) {
      var allTurnsSubmitted = true,
        currentRound = match_public.getCurrentRound();
      // Check that every player has submitted their actions
      _.each(players, function (player, playerColor) {
        allTurnsSubmitted = allTurnsSubmitted && !!currentRound[playerColor];
      });
      match_private.state = MatchStates.wait_scoring;
      match_public.emit(MatchEvents.end_round, currentRound);
    };

    match_private.onEndRound = function onEndRound(currentRound) {
      // Score the round
      gameBoard.scoreRound(currentRound);

      // For each player turn in the current round
      _.each(currentRound, function (playerTurn, playerColor) {
        // Add the score gained by each player to their overall score.
        players[playerColor].score += playerTurn.score;
      });
      match_public.emit('roundScored', currentRound);
    };

    match_private.onRoundScored = function onRoundScored(currentRound) {
      if (rounds.length === config.rounds) {
        // The match is over
        match_public.emit(MatchEvents.end_match);
      } else {
        // Start a new round
        rounds.push({});
        playerOrder.reverse();
        match_public.emit(MatchEvents.start_round);
      }
    };

    match_private.onEndMatch = function onEndMatch() {
      match_private.state = MatchStates.end;
    };

    // Add event listeners
    match_public
      .on(MatchEvents.add_player, match_private.onAddPlayer)
      .on(MatchEvents.start_round , match_private.onStartRound)
      .on(MatchEvents.accept_turn , match_private.onAcceptTurn)
      .on(MatchEvents.end_round, match_private.onEndRound)
      .on('roundScored', match_private.onRoundScored)
      .on(MatchEvents.end_match, match_private.onEndMatch);


    // Return the public interface
    return match_public;
  };
module.exports.MatchEvents = MatchEvents;
module.exports.MatchStates = MatchStates;
