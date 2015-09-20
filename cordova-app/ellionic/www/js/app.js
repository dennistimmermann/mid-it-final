// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// angular.module('starter', ['ionic'])

// .run(function($ionicPlatform) {
//   $ionicPlatform.ready(function() {
//     // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
//     // for form inputs)
//     if(window.cordova && window.cordova.plugins.Keyboard) {
//       cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
//     }
//     if(window.StatusBar) {
//       StatusBar.styleDefault();
//     }

//     console.log("hello")
//     init()
//   });
// })

var app = angular.module('ionicApp', ['ionic','btford.socket-io'])
    app.config(['$ionicConfigProvider', function($ionicConfigProvider) {

        $ionicConfigProvider.tabs.position('bottom'); // other values: top

    }]);
    app.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('tabs', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html"
    })
    .state('tabs.home', {
      url: "/home",
      views: {
        'home-tab': {
          templateUrl: "views/list.html",
          controller: 'listCtrl'
        }
      }
    })
    .state('tabs.scan', {
      url: "/scan",
      views: {
        'scan-tab': {
          templateUrl: "views/scan.html",
          controller: 'scanCtrl'
        }
      }
    })
    .state('tabs.about', {
      url: "/about",
      views: {
        'about-tab': {
          templateUrl: "views/about.html",
          controller: 'aboutCtrl'
        }
      }
    })

    $urlRouterProvider.otherwise("/tab/home");

})

app.factory('socket', function(socketFactory) {
  var myIoSocket = io.connect('http://192.168.1.17:3000');

    mySocket = socketFactory({
      ioSocket: myIoSocket
    });

  return mySocket;
})
