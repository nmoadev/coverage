/**
 * Created by akuchta on 11/28/14.
 */
(function() {
  var GameBoard,
      Actions;

  Actions = {
    UP : 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right',
    JUMP: 'jump'
  };
  
  GameBoard = function GameBoard(config) {
    var grid = [],
        cursorLoc,
        getGrid,
        executeTurn,
        scoreRound,
        countSquares,
        processAction,
        checkLoc,
        executeAction,
        resetGrid,
        resetCursorLoc,
        reset;

    for (var i = 0; i < config.rows; i++) {
        var row = [];
        for (var j = 0; j < config.cols; j++) {
            row.push("gray");
        }
        grid.push(row);
    };

    cursorLoc = [0,0];

    checkLoc = function checkLoc(i, j) {
        return (0 <= i && i < config.rows && 0 <= j && j < config.cols);
    };

    processAction = function processAction(currentLoc, action) {
        // Working copy of current cursor location
        var tempLoc = currentLoc.slice();

        // Switch Statement for the commands
        switch(action[0]) {
          case Actions.UP:
              tempLoc[0]--;
              break;
          case Actions.DOWN:
              tempLoc[0]++;
              break;
          case Actions.LEFT:
              tempLoc[1]--;
              break;
          case Actions.RIGHT:
              tempLoc[1]++;
              break;
          case Actions.JUMP:
              tempLoc[0] = action[1];
              tempLoc[1] = action[2];
              break;
          default:
              break;
        }

        return tempLoc;
        // Check if the location is in bounds. Out of bounds will do nothing (for now)

    };

    /**
     * Execute just one action on behalf of a player
     * Designed for 'test run'
     *
     */
    executeAction = function executeAction(action, playerColor) {
        // Process the action to determine the new location
        // of the cursor
        var tempLoc = processAction(cursorLoc, action);

        // Check the bounds of the new location, out-of-bounds is ignored
        if (checkLoc(tempLoc[0], tempLoc[1])) {
            cursorLoc = tempLoc;
            // Mark the grid with the player's coor, last write wins
            grid[cursorLoc[0]][cursorLoc[1]] = playerColor;
        };
    };

    /**
     * Execute one player's turn.
     *
     */
    executeTurn = function executeTurn(playerTurn) {
        // For each action the player submitted
        _.each(playerTurn.actions, function(action) {
          executeAction(action, playerTurn.playerColor);
        })
    }

    /**
     * Score a round of the game, a round is made up of as many player turns
     * as there are players
     */
    scoreRound = function scoreRound(round) {
        _.each(round.turns, executeTurn);
        countSquares(round);
    };

    /**
     * Count the squares occupied by each player to determine scores
     * sets the appropriate scores on the round object
     */
    countSquares = function countSquares(round) {
        _.each(grid, function (row) {
            _.each(row, function (square) {
                if (round[square]) {
                    round[square].score++;
                } else {
                    throw new Error("We had a color we couldn't find");
                }
            });
        });
    };

    getGrid = function getGrid() {
      return grid;
    };

    resetGrid = function resetGrid() {
      for (var i = 0; i < config.rows; i++) {
          for (var j = 0; j < config.cols; j++) {
              grid[i][j] = "gray";
          }
      };
    };

    resetCursorLoc = function resetCursorLoc() {
      cursorLoc = [0, 0];
    };

    reset = function reset() {
      resetGrid();
      resetCursorLoc();
    };

    reset();
    return {
      scoreRound: scoreRound,
      executeTurn: executeTurn,
      executeAction: executeAction,
      getGrid: getGrid,
      reset: reset
    };
};
  if (typeof module !== 'undefined') {
    module.exports = {
      GameBoard: GameBoard,
      Actions: Actions
    };
  } else if (typeof angular !== 'undefined') {
    angular.module('coverage.GameBoard', [])
      .factory('GameBoard', function () {
        return GameBoard;
      })
      .factory('Actions', function () {
        return Actions;
      });
  }
})();

