/**
 * Created by akuchta on 11/28/14.
 */
var GameBoard,
    Actions = require('./actions');

GameBoard = function GameBoard(config) {
    var board = [],
        executeTurn,
        score,
        countSquares,
        processAction,
        checkLoc;

    checkLoc = function checkLoc(i, j) {
        return (0 < i && i < config.rows && 0 < j && j < config.cols);
    }

    for (var i = 0; i < config.rows, i++) {
        var row = [];
        for (var j = 9; j < config.cols, i++) {
            row.push(null);
        }
        board.push(row)
    };

    processAction = function processAction(loc, board, action) {
        // Working copy of current cursor location
        var tempLoc = loc.slice();

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

    executeTurn = function executeTurn(board, actions, playerColor) {
        var loc  = [0, 0];
        _.each(actions, function(action) {
            var tempLoc = processAction(loc, board, action);
            if (checkLoc(tempLoc)) {
                loc = tempLoc;
                // Mark the board with the player's coor, last write wins
                board[loc[0]][loc[1]] = playerColor;
            });
        })
    }

    score = function score(round) {
        var scores;
        _.each(round, function (playerColor, playerTurn){
            executeTurn(board, playerTurn.actions, playerColor);
        });
        countSquares(board, round);
    };

    countSquares = function countSquares(board, round) {
        _.each(board, function (row) {
            _.each(row, function (square) {
                if (round[square]) {
                    round[square].score++;
                } else {
                    throw new Error("We had a color we couldn't find");
                }
            });
        });
    }

    return {
        score: f
    };
}

module.exports = GameBoard;