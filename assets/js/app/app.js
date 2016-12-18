'use strict';

var app = angular.module('app', ['ui.router', 'ngCookies', 'ngAudio', 'thatisuday.ng-image-gallery']);

app.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {

    $locationProvider.html5Mode(true);
    $stateProvider.state('app', {
        url: '',
        abstract: true,
        template: '<ui-view></ui-view>'
    }).state('app.index', {
        url: '/',
        abstract: true
    }).state('app.main', {
        url: '/main',
        templateUrl: '/assets/html/main.html'
    }).state('app.rules', {
        url: '/rules',
        templateUrl: '/assets/html/rules.html'
    }).state('app.girls', {
        url: '/girls',
        templateUrl: '/assets/html/girls.html',
        controller: function controller($scope, $getDataService, $interval) {
            $scope.methods = {};
            $getDataService('/data/girls.json', function (err, data) {
                $scope.girlsImages = data || [];
                console.log(data);
            });
            $interval(function() {
                $scope.methods.next();
            }, 3000);
        }
    }).state('app.programms', {
        url: '/programms',
        templateUrl: '/assets/html/programms.html',
        controller: 'programmsController'
    });
    $urlRouterProvider.otherwise('/main');
});

app.controller('programmsController', function ($scope, $rootScope, $getDataService) {
    $getDataService('/data/programms.json', function (err, data) {
        $scope.programms = err ? [] : data.programms;
        $scope.rowCount = new Array(Number(Math.ceil($scope.programms.length / 3)));
        $scope.getProgrammsByIndex = function (index) {
            return new Range(index * 3, index * 3 + 2).toArray().filter(function (index) {
                return index < $scope.programms.length;
            });
        };
        $scope.scroll = function (programm) {
            $('html, body').animate({ scrollTop: $('#' + programm).offset().top }, 'slow');
            return true;
        };
    });
    $scope.getNumber = function (num) {
        return new Array(Number(num));
    };
    $scope.isSingleTime = function (programm) {
        return Number.isInteger(programm.time);
    };
});

app.controller('mainController', function ($scope, ngAudio, $getDataService) {
    $scope.sound = ngAudio.load('/audio/' + new Range(1, 8).getRandom() + '.mp3');
    $getDataService('/data/audio.json', function (err, data) {
        $scope.sound = ngAudio.load(data[new Range(0, data.length - 1).getRandom()]);
        $scope.sound.setVolume(0.1);
    });
    $getDataService('/data/config.json', function (err, data) {
        $scope.config = data || {};
    });
    $scope.adult = localStorage['adult'];
    $scope.confirmAdult = function () {
        $scope.adult = localStorage['adult'] = true;
    };
    $scope.toggle = function () {
        $scope.sound.paused ? $scope.sound.play() : $scope.sound.pause();
    };
});

app.factory('$getDataService', function ($http) {
    return function (url, callback) {
        $http.get(url + "?" + Date.now()).then(function (response) {
            return callback(null, response.data);
        }).catch(function (err) {
            return callback(err);
        });
    };
});
