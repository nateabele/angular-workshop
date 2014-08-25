"use strict";

var SockDrawer = angular.module("sockdrawer", [
  'ui.bootstrap',
  'ui.router',
  'ur.model',
  'ur.scaffold'
]);

SockDrawer.config(function($locationProvider, $stateProvider) {

  $locationProvider.html5Mode(true);

  $stateProvider.state("apps", {
    url: "/"
  }).state("apps.messages", {
    url: "/messages"
  }).state("apps.photos", {
    url: "/photos"
  }).state("apps.files", {
    url: "/files"
  });

});

SockDrawer.run(function($state, $location) {
  $state.go("apps");
});

SockDrawer.controller("NavigationController", function($scope, $state) {
  $scope.user = { name: "Test" };
});
