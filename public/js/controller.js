var coverageControllers = angular.module('coverage.controllers', ['coverage.services']);


coverageControllers.controller('PlayCtrl', ['$routeParams' , function($routeParams){
    this.matchCode = $routeParams.matchcode;
}]);

coverageControllers.controller('JoinMatchCtrl', ['$location', 'MatchSvc', function($location, MatchSvc) {
    var _this = this;
    this.currentStep = "name";
    this.goToJoinView = function() {_this.currentStep = "join"};
    this.joinMatch = function(matchCode) {
        MatchSvc.joinMatch(matchCode).then(function(matchInfo) {
          $location.path("/play/" + matchInfo.matchCode);
        });
    };
    this.createMatch = function() {
        MatchSvc.newMatch().then(
            function(matchCode) {
                _this.joinMatch(matchCode);
            }
        )
    };

}]);
coverageControllers.controller('BoardCtrl', ['$scope','BoardSvc', function ($scope, BoardSvc) {
    var _this = this;
    this.views = {
      test :'test',
      play : 'play'
    };
    this.actionCounter = BoardSvc.actionCounter;
    this.testBoardGrid = BoardSvc.boards.test.getGrid();
    this.playBoardGrid = BoardSvc.boards.play.getGrid();
    this.currentView = this.views.test;

    $scope.$watch(function () {
      return _this.actionCounter(); // `this` IS the `this` above!!
    }, function (newVal, oldVal) {
      // A horrible horrible hack
      if (newVal > 0) {
        $scope.pling.play();
      }
    }, true);


    this.getClass = function (i,j) {
      var playerColor = _this.testBoardGrid[i][j];
      return 'cube '+ playerColor || 'gray';
    }
}]);

coverageControllers.controller('ScoreCtrl', ['MatchSvc', function (MatchSvc) {
  this.players = MatchSvc.matchData.players;
  this.rounds = MatchSvc.matchData.rounds
}]);

coverageControllers.controller('EditorCtrl', [ 'TestCodeSvc', 'MatchSvc', function(TestCodeSvc, MatchSvc) {
    var _this = this,
        content = "";
    this.onEditorChange = function onEditorChange(editor) {
        return function(change) {
            if (editor.getSession().getLength() > 5) {
                var doc = editor.getSession().getDocument();
                doc.removeLines(5, doc.getLength()-1);
            }
        }
    };
    this.editorLoaded = function(_editor) {
        _editor.setOptions({
          fontSize: "14px"
        });
        _editor.getSession().setMode("ace/mode/javascript");
        _editor.getSession().setTabSize(4);
        _editor.getSession().setUseSoftTabs(true);
        _editor.on('change', _this.onEditorChange(_editor));
    };
    this.submitCode = function() {
        _this.errors = MatchSvc.submitTurn(this.content);
    };

    this.testCode = function() {
        _this.errors = TestCodeSvc.testCode(this.content);
    };
}]);
