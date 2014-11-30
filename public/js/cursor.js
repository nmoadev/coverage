angular.module('coverage.Cursor', ['coverage.GameBoard'])
  .factory('Cursor', ['Actions', function(Actions) {
    return function () {
      var cursor = {},
      actionList = [];
  
      // Return a copy of the command list so that the original can't be changed
      // with except through designed interfaces
      cursor.getActions = function getCommandList() {
        return actionList.slice();
      }
  
      // Reset the command list
      cursor.reset = function reset() {
        actionList = [];
      };
  
      // For each command in the command dictionary create a function on the 
      // cursor
      angular.forEach(Actions, function(value, key) {
          cursor[value] = function() {
              actionList.push([value].concat(Array.prototype.slice.call(arguments)));
              return cursor;
          }
      });
  
      return cursor;
    };
}]);
