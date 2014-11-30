angular.module('coverage.Cursor', ['coverage.GameBoard'])
  .factory('Cursor', ['Actions', function(Actions) {
    return function () {
      var cursor = {},
      commandList = [];
  
      // Return a copy of the command list so that the original can't be changed
      // with except through designed interfaces
      cursor.getCommandList = function getCommandList() {
        return commandList.slice();
      }
  
      // Reset the command list
      cursor.reset = function reset() {
        commandList = [];
      };
  
      // For each command in the command dictionary create a function on the 
      // cursor
      angular.forEach(Actions, function(value, key) {
          cursor[value] = function() {
              commandList.push([key].concat(Array.prototype.slice.call(arguments)));
              return cursor;
          }
      });
  
      return cursor;
    };
}]);
