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

coverageServices.factory('ConnectSvc', function() {

});

coverageServices.factory('CommandSvc', [function() {
    return {
        processCode: function(code) {
            var cursor = coverageServices.Cursor();
            try {
                eval(code);
                console.log(cursor.commandHistory)
            } catch (e) {

            }
        }
    }
}]);