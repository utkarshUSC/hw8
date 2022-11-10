angular
    .module('mainApp', ['ngRoute'])
    .config(function($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'search/search.component.html'
        }).when('/search', {
            templateUrl: 'search/search.component.html'
        }).when('/bookings', {
            templateUrl: 'bookings/bookings.component.html'
        });
    })
    .controller('mainController', function(){})