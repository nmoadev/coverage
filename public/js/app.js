/**
 * Created by akuchta on 11/6/14.
 */
'use strict';
// Declare app level module which depends on filters, and services
angular.module('coverage', [
    'ngRoute',
    'coverage.controllers',
    'coverage.services',
    'ui.ace',
    'ui.bootstrap',
    'ngLodash',
    'mediaPlayer'
]).
    config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/join', {
                templateUrl: 'js/partials/join.html'
            })
            .when('/play/:matchcode', {
               templateUrl: 'js/partials/play.html',
            })
            .when('/sprite', {
                templateUrl: 'js/partials/sprite.html'
            })
            .otherwise({
                redirectTo: '/join'
            });
    }]);

