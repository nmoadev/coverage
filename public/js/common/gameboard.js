/**
 * Created by akuchta on 11/28/14.
 */
(function (isNode, isAngular) {
  var GameBoardModule, Actions;

  /**
   * Actions is (sort of) an enumeration of the actions the game understands.
   * @type {{MARK: string, UP: string, DOWN: string, LEFT: string, RIGHT: string, JUMP: string}}
   */
  Actions = {
    MARK: 'mark',
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right',
    JUMP: 'jump'
  };

  /**
   * The Gameboard Module represents in the logical gameboard and provides mechanisms for scoring.
   * @param _ - dependency injection point for lodash
   * @returns {GameBoard} - a factory function that creates instances of Gameboard
   * @constructor
   */
  GameBoardModule = function(_) {
    var GameBoard = function GameBoard(config) {
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

      /**
       * Initialization
       *
       */
      for (var i = 0; i < config.rows; i++) {
        var row = [];
        for (var j = 0; j < config.cols; j++) {
          row.push("gray");
        }
        grid.push(row);
      }

      cursorLoc = [0, 0];

      /**
       * Function definitions
       */

      getGrid = function getGrid() {
        return grid;
      };

      resetGrid = function resetGrid() {
        for (var i = 0; i < config.rows; i++) {
          for (var j = 0; j < config.cols; j++) {
            grid[i][j] = "gray";
          }
        }
      };

      resetCursorLoc = function resetCursorLoc() {
        cursorLoc = [0, 0];
      };

      reset = function reset() {
        resetGrid();
        resetCursorLoc();
      };

      checkLoc = function checkLoc(i, j) {
        return (0 <= i && i < config.rows && 0 <= j && j < config.cols);
      };

      processAction = function processAction(currentLoc, action) {
        // Working copy of current cursor location
        var tempLoc = currentLoc.slice();

        // Switch Statement for the commands
        switch (action[0]) {
          case Actions.MARK:
            break;
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
        }
        ;
      };

      /**
       * Execute one player's turn.
       *
       */
      executeTurn = function executeTurn(playerTurn, playerColor) {
        // For each action the player submitted
        _.each(playerTurn.actions, function (action) {
          executeAction(action, playerColor);
        });
      };

      /**
       * Score a round of the game, a round is made up of as many player turns
       * as there are players
       */
      scoreRound = function scoreRound(round, playerOrder) {
        resetGrid();
        _.each(playerOrder, function(playerColor) {
          executeTurn(round[playerColor], playerColor);
        });
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

      // Return the public interface to the object
      return {
        scoreRound: scoreRound,
        executeTurn: executeTurn,
        executeAction: executeAction,
        getGrid: getGrid,
        reset: reset
      };
    };
    return GameBoard;
  };

  /**
   * Crappy polyfill stuff for making this module work in NodeJs and AngularJs frameworks
   */
  if (isNode) {
    var lodash = require('lodash');
    module.exports = GameBoardModule(lodash);
    module.exports.Actions = Actions;
  } else if (isAngular) {
    angular.module('coverage.GameBoard', [])
      .factory('GameBoard', ['lodash', function (lodash) {
        return GameBoardModule(lodash);
      }])
      .factory('Actions', function () {
        return Actions;
      });
  }
})(typeof module !== 'undefined', typeof angular !== 'undefined');

