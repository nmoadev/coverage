var coverageServices = angular.module('coverage.services', []);

coverageServices.Cursor = function(){
    var cursor = {}
    cursor.commandDictionary = {
        UP : 'up',
        DOWN: 'down',
        LEFT: 'left',
        RIGHT: 'right',
        JUMP: 'jump'
    };
    cursor.commandList = [];
    cursor.reset = function reset() {
      cursor.commandList = [];
    };
    angular.forEach(cursor.commandDictionary, function(value, key) {
        cursor[value] = function() {
            cursor.commandList.push([key].concat(Array.prototype.slice.call(arguments)));
            return cursor;
        }
    });

    return cursor;
};

coverageServices.Board = function() {
  var board = {};
  board.grid = [];
  for (var i = 0; i < config.rows, i++) {
      var row = [];
      for (var j = 9; j < config.cols, i++) {
          row.push(null);
      }
      board.grid.push(row);
  };
};

coverageServices.factory('MatchSvc', ['$q', function($q){
   return {
       newMatch: function() {
           var deferred = $q.defer();
           deferred.resolve(Math.floor(Math.random() + 1));
           return deferred.promise;
       }
   }
}]);

coverageServces.factory('BoardSvc', ['SocketSvc', function(SocketSvc) {
  var boards = {
    test: {},
    play: {}
  };

  // Register a listener for when the play board is updated
  SocketSvc.on(SocketSvc.MessageTypes.Updates.PlayBoard, function(data) {
    boards.play = data;
  });

  // Register a listener for when the test board is updated
  SocketSvc.on(SocketSvc.MessageTypes.Updates.TestBoard, function(data) {
    boards.test = data;
  });
  
  return {
    boards: boards
  };
});

coverageServices.factory('SocketSvc', ['$q', function($q) {
    var socket = io.connect();
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
coverageServices.factory('CommandSvc', ['SocketSvc', function(SocketSvc) {
    var cursor = coverageServices.Cursor();
    return {
        submitCode: function(code) {
          var err = this.processCode(code);
          if (err) {
              return err;
          }

          SocketSvc.emit(SocketSvc.MessageTypes.submitCode, {
            actions : cursor.commandList
          });
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

          BoardSvc.applyCursor(cursor);
        }
    }
}]);
