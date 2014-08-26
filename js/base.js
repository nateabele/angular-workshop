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
    url: "",
    views: {
      main: {
        templateUrl: "/partials/apps.html"
      }
    }
  }).state("apps.messages", {
    url: "/messages",
    resolve: {
      messages: function($http) {
        return $http.get("/api/messages").then(function(response) {
          return response.data;
        });
      }
    },
    views: {
      "main@": {
        templateUrl: "/partials/messages.html",
        controller: function($scope, messages, DataManager) {
          console.log(DataManager.doSomething(2));
          $scope.messages = messages;
        }
      }
    }
  }).state("apps.photos", {
    url: "/photos"
  }).state("apps.files", {
    url: "/files"
  });

});

SockDrawer.run(function($state) {
  $state.go("apps");
});

SockDrawer.controller("NavigationController", function($scope, $state) {
  $scope.user = { name: "Nate" };
});

SockDrawer.service("DataManager", function() {

  angular.extend(this, {
    doSomething: function(val) {
      return val++;
    }
  });
});
