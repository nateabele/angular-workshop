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
        controller: "MessagesController"
      }
    }
  }).state("apps.messages.view", {
    url: "/{id}",
    views: {
      view: {
        templateUrl: "/partials/message-view.html",
        controller: "MessageViewController"
      }
    }
  }).state("apps.photos", {
    url: "/photos"
  }).state("apps.files", {
    url: "/files"
  });

});

SockDrawer.run(function($state, $rootScope) {
  $state.go("apps");

  $rootScope.$on("$stateChangeError", function(event, transition) {
    event.preventDefault();
    console.log(arguments);
  });
});

SockDrawer.controller("NavigationController", function($scope, $state) {
  angular.extend($scope, {
    user: { name: "Nate" }
  });
});

SockDrawer.controller("MessagesController", function($scope, messages) {
  $scope.messages = messages;
});

SockDrawer.controller("MessageViewController",
  function($scope, $stateParams, messages) {
    angular.extend($scope, {
      message: _(messages).find({ id: $stateParams.id })
    });
  }
);

SockDrawer.service("DataManager", function() {

  angular.extend(this, {
    doSomething: function(val) {
      return ++val;
    }
  });
});
