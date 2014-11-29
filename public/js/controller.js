var coverageControllers = angular.module('coverage.controllers', []);


coverageControllers.controller('PlayCtrl', ['$routeParams' , function($routeParams){
    this.matchCode = $routeParams.matchcode;
}]);

coverageControllers.controller('JoinMatchCtrl', ['$location', 'MatchSvc', function($location, MatchSvc) {
    var _this = this;
    this.currentStep = "name";
    this.goToJoinView = function() {_this.currentStep = "join"};
    this.joinMatch = function(matchCode) {
        $location.path("/play/" + matchCode);
    };
    this.createMatch = function() {
        MatchSvc.newMatch().then(
            function(matchCode) {
                _this.joinMatch(matchCode);
            }
        )
    };

}]);
coverageControllers.controller('BoardCtrl', function ($scope) {
    var i = 0;
    this.rows = [];
    for (i; i < 10; i++ ){
        this.rows.push([1,0,1,1,0])
    }

    this.getClass = function getClass(value) {
        var color = value === 1 ? "red" : "blue";
        return "cube col-md-1 " + color;
    };

});

coverageControllers.controller('EditorCtrl', [ 'CommandSvc', function(CommandSvc) {
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
        _editor.getSession().setMode("ace/mode/javascript");
        _editor.getSession().setTabSize(4);
        _editor.getSession().setUseSoftTabs(true);
        _editor.on('change', _this.onEditorChange(_editor));
    };
    this.submitCommand = function() {
        CommandSvc.processCode(this.content);
    }

}]);

coverageControllers.controller('SpriteCtrl', function () {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.offset = 0;
    this.background = "url(\"../images/DazeBeforeChristmasSheet1.gif\");"
    this.getStyle = function() {
        return {
        }
    }
});