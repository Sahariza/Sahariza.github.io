const app = angular.module('app', ['ui.router', 'ngCookies', 'ngAudio', 'thatisuday.ng-image-gallery']);

app.config(($stateProvider, $urlRouterProvider, $locationProvider) => {

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
        })
        .state('app.rules', {
            url: '/rules',
            templateUrl: '/assets/html/rules.html'
        })
        .state('app.girls', {
            url: '/girls',
            templateUrl: '/assets/html/girls.html',
            controller: ($scope, $getDataService) => {
                $getDataService('/data/girls.json', (err, data) => {
                    $scope.girlsImages = data || [];
                    console.log(data);
                });
            }
        })
        .state('app.programms', {
            url: '/programms',
            templateUrl: '/assets/html/programms.html',
            controller: 'programmsController'
        });
    $urlRouterProvider.otherwise('/main');
});

app.controller('programmsController', ($scope, $rootScope, $getDataService) => {
    $getDataService('/data/programms.json', (err, data) => {
        $scope.programms = err ? [] : data.programms;
        $scope.rowCount = new Array(Number(Math.ceil($scope.programms.length / 3)));
        $scope.getProgrammsByIndex = index => new Range(index * 3, index * 3 + 2).toArray().filter(index => index < $scope.programms.length);
        $scope.scroll = programm => {
            $('html, body').animate({ scrollTop: $(`#${programm}`).offset().top }, 'slow');
            return true;
        };
    });
    $scope.getNumber = num => new Array(Number(num));
    $scope.isSingleTime = programm => Number.isInteger(programm.time);
})

app.controller('mainController', ($scope, ngAudio, $getDataService) => {
    $scope.sound = ngAudio.load(`/audio/${new Range(1, 8).getRandom()}.mp3`);
    $getDataService('/data/audio.json', (err, data) => {
        $scope.sound = ngAudio.load(data[new Range(0, data.length - 1).getRandom()]);
        $scope.sound.setVolume(0.1);
    });
    $getDataService('/data/config.json', (err, data) => {
        $scope.config = data || {};
    });
    $scope.adult = localStorage['adult'];
    $scope.confirmAdult = () => {
        $scope.adult = localStorage['adult'] = true;
    }
    $scope.toggle = function() {
        $scope.sound.paused ? $scope.sound.play() : $scope.sound.pause();
    };
});

app.factory('$getDataService', ($http) => {
    return function(url, callback) {
        $http.get(url)
            .then(response => callback(null, response.data))
            .catch(err => callback(err));
    }
});