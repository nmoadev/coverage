var coverageServices = angular.module('coverage.services', ['coverage.Cursor', 'coverage.GameBoard', 'btford.socket-io']);


coverageServices.factory('MatchSvc', ['SocketSvc', function (SocketSvc) {
  var matchData = {},
      joinMatch,
      lockSubmit,
      submitLocked;
  SocketSvc.on('matchJoined', function(matchData) {
    match = matchData;
  });

  joinMatch = function joinMatch(matchCode) {
    SocketSvc.emit('joinMatch', matchCode);
  
  };
  
  submitTurn = function submitTurn(code) {
    var actions = ActionsSvc.processCode(code);
    SocketSvc.emit('submitTurn', actions);
  };
  
  return {
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
    }
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
              board.executeAction(action, MatchSvc.thisPlayerColor);
            }, 500);
          });
        });
        promise.catch(function(e){console.log(e);}).finally(function(){console.log("END")});
    }
  };
}]);

coverageServices.factory('SocketSvc', ['$q', 'socketFactory' , function ($q, SocketFactory) {
  var socket = SocketFactory();
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
    }
  };
}]);

/*
 * Command Service
 *
 * Evals code using a Cursor object to create list of commands 
 * on cursor.
 *
 */
coverageServices.factory('ActionsSvc', ['SocketSvc', 'Cursor', 'MatchSvc', 'BoardSvc', function (SocketSvc, Cursor, MatchSvc, BoardSvc) {
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

coverageServices.factory('TestCodeSvc', [ function () {
  return {
    testCode: function (code) {
      var processResult = this.processCode(code);
      if (processResult.error === null && processResult.actons !== null) {
        BoardSvc.applyActions(ActionsSvc.processCode(code), BoardSvc.boards.test, MarchSvc.thisPlayerColor);
        return null;
      } else {
        return processResult.error;
      }
    }
  }
}]);

