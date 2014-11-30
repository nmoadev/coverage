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
    cursor.commandHistory = [];

    angular.forEach(cursor.commandDictionary, function(value, key) {
        cursor[value] = function() {
            cursor.commandHistory.push([key].concat(Array.prototype.slice.call(arguments)));
            return cursor;
        }
    });

    return cursor;
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

coverageServces.factory('BoardSvc', function(){

});

coverageServices.factory('SocketSvc', function() {
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
});

coverageServices.factory('CommandSvc', [function() {
    var cursor = coverageServices.Cursor();
    return {
        submitCode: function(code) {
          var err = this.processCode(code);
          if (err) {
              return err;
          }

//          SocketSvc.send();
        },
        processCode: function(code) {
            try {
                eval(code);
                console.log(cursor.commandHistory)
            } catch (e) {

            }
        }
    }
}]);