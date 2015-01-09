var coverageServices = angular.module('coverage.services', ['coverage.Cursor', 'coverage.GameBoard', 'btford.socket-io']);


coverageServices.factory('MatchSvc', ['SocketSvc', '$q', 'ActionSvc', function (SocketSvc, $q, ActionSvc) {
  var matchData = {},
      joinMatch,
      lockSubmit,
      submitLocked,
      thisPlayerColor;

  SocketSvc.forward(
    [
      'matchJoined',
      'wait_players',
      'add_player',
      'start_round',
      'accept_turn',
      'reject_turn',
      'end_round',
      'end_match'
    ]);

  SocketSvc.on('matchJoined', function onMatchJoined(matchData) {
    matchData = matchData;
  });

  SocketSvc.on('wait_players', function onWaitPlayers() {
    
  });
  
  SocketSvc.on('add_player', function onAddPlayer(matchData) {
    matchData = matchData;
  });

  SocketSvc.on('start_round', function onStartRound() {
    matchData = matchData;
  });

  SocketSvc.on('accept_turn', function onAcceptTurn() {
    
  });

  SocketSvc.on('reject_turn', function onRejectTurn() {
  
  });

  SocketSvc.on('end_round', function onEndRound() {
  
  });

  SocketSvc.on('end_match', function onEndMatch() {
  
  });

  joinMatch = function joinMatch(matchCode, playerName, cb) {
    var deferred = $q.defer();

    SocketSvc.once('matchJoined', function(matchPlayerInfo){
      thisPlayerColor = matchPlayerInfo.playerColor;
      deferred.resolve(matchPlayerInfo);
    });

    SocketSvc.emit('joinMatch', matchCode);
    return deferred.promise;
  }; 
  
  submitTurn = function submitTurn(code) {
    var actions,
        deferred;
    actions = ActionSvc.processCode(code);
    deferred = $q.defer();
    SocketSvc.once('accept_turn', function() {
      deferred.resolve();
    });
    SocketSvc.emit('submitTurn', actions);
    return deferred.promise;
  };
  
  return {
    thisPlayerColor: function getThisPlayerColor() {
      return thisPlayerColor;
    },
    joinMatch: joinMatch,
    newMatch: function () {
      var deferred = $q.defer();
      deferred.resolve(Math.floor(Math.random() + 1));
      return deferred.promise;
    },
    scores: [
      {
        playerName: "Alain",
        playerColor: "Blue",
        value: 50
      },
      {
        playerName: "Adam",
        playerColor: "Red",
        value: 23
      }
    ],
    boardConfig: {
      rows: 5,
      cols: 5
    },
    matchData: matchData,
    submitTurn: submitTurn
  }
}]);

coverageServices.factory('BoardSvc', ['SocketSvc', 'GameBoard', 'MatchSvc', '$q', '$timeout', function (SocketSvc, GameBoard, MatchSvc, $q, $timeout) {
  var boards = {
    test: GameBoard(MatchSvc.boardConfig),
    play: GameBoard(MatchSvc.boardConfig)
    },
    actionCounter = 0;


  return {
    boards: boards,
    actionCounter: function(){ return actionCounter;},
    applyActions: function applyActions(actions, board) {
        var promise = $timeout(function(){}, 10);
        board.reset();
        actionCounter = 0;
        angular.forEach(actions, function (action) {
          promise = promise.then(function () {
            return $timeout(function () {
              actionCounter++;
              board.executeAction(action, MatchSvc.thisPlayerColor());
            }, 500);
          });
        });
        promise.catch(function(e){console.log(e);}).finally(function(){console.log("END")});
    }
  };
}]);

coverageServices.factory('SocketSvc', ['$q', 'socketFactory', '$rootScope', function ($q, SocketFactory, $rootScope) {
  var socket = SocketFactory({namespace: '/match'});
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    },
    once: function (eventName, callback) {
      socket.once(eventName, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    },
    forward: socket.forward
  };
}]);

/*
 * Command Service
 *
 * Evals code using a Cursor object to create list of commands 
 * on cursor.
 *
 */
coverageServices.factory('ActionSvc', ['Cursor', function (Cursor) {
  var cursor = Cursor();
  return {
    processCode: function (code) {
      cursor.reset();
      try {
        eval(code);
      } catch (e) {
        return {
          actions:null,
          error: e
        };
      }
      return {
        actions: cursor.getActions(),
        error: null
      };
    }
  }
}]);

coverageServices.factory('TestCodeSvc', [ 'ActionSvc', 'BoardSvc', 'MatchSvc', function (ActionSvc, BoardSvc, MatchSvc) {
  return {
    testCode: function (code) {
      var processResult = ActionSvc.processCode(code);
      if (processResult.error === null && processResult.actions !== null) {
        BoardSvc.applyActions(processResult.actions, BoardSvc.boards.test, MatchSvc.thisPlayerColor);
        return null;
      } else {
        return processResult.error;
      }
    }
  }
}]);

