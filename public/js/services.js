var coverageServices = angular.module('coverage.services', []);

coverageServices.factory('MatchSvc', ['$q', function($q){
   return {
       newMatch: function() {
           var deferred = $q.defer();
           deferred.resolve(Math.floor(Math.random() + 1));
           return deferred.promise;
       }
   }
}]);

coverageServices.factory('ConnectSvc', function(){

});

coverageServices.factory('CommandSvc', [function(){

}]);