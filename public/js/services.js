var coverageServices = angular.module('coverage.services', ['coverage.Cursor', 'coverage.GameBoard', 'btford.socket-io']);

coverageServices.factory('MatchSvc', ['$q', function($q){
   return {
       newMatch: function() {
           var deferred = $q.defer();
           deferred.resolve(Math.floor(Math.random() + 1));
           return deferred.promise;
       },
      boardConfig: {
        rows: 5,
        cols: 5
      }
   }
}]);

coverageServices.factory('BoardSvc', ['SocketSvc', 'GameBoard', 'MatchSvc', function(SocketSvc, GameBoard, MatchSvc) {
  var boards = {
    test: GameBoard(MatchSvc.boardConfig),
    play: GameBoard(MatchSvc.boardConfig)
  };
  
  return {
    boards: boards  
  };
}]);

coverageServices.factory('SocketSvc', ['$q', 'socketFactory' , function($q, SocketFactory) {
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

/**
 * Command Service
 *
 * Evals code using a Cursor object to create list of commands 
 * on cursor.
 *
 */
coverageServices.factory('CommandSvc', ['SocketSvc', 'Cursor','MatchSvc', function(SocketSvc, Cursor, MatchSvc) {
    var cursor = Cursor();
    return {
        submitCode: function(code) {
          var err = this.processCode(code);
          if (err) {
              return err;
          }

          if (MatchSvc.submitLocked()) {
            SocketSvc.emit(SocketSvc.MessageTypes.submitCode, {
              actions : cursor.commandList
            });
            MatchSvc.lockSubmit();
          } 
        },
        processCode: function(code) {
            cursor.reset();
            try {
                eval(code);
            } catch (e) {
              return e;    
            }
        },
        testCode: function(code) {
          var err = this.processCode(code);
          if (err) {
              return err;
          }

        }
    }
}]);
