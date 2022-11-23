var registrationModule = angular.module("registrationModule", ["ngRoute", "ngGrid", "cgBusy", "ngAnimate", "ui.bootstrap", "LocalStorageModule",
    'ui.grid', 'ui.grid.selection', 'ui.grid.grouping', 'ui.grid.pinning', 'ui.grid.edit', 'ui.grid.moveColumns', 'dx'])
    .config(function ($routeProvider, $locationProvider) {

        $routeProvider.when('/', {
            templateUrl: '/AngularJS/Templates/Nodo.html',
            controller: 'nodoController'
        });

        $routeProvider.when('/administrador', {
            templateUrl: '/AngularJS/Templates/administrador.html',
            controller: 'administradorController'
        });

        $locationProvider.html5Mode(true);
    });

registrationModule.run(function ($rootScope) {
    $rootScope.empleado = "";
    $rootScope.cliente = "";
})

registrationModule.directive('resize', function ($window) {
    return function (scope, element) {
        var w = angular.element($window);
        var changeHeight = function () { element.css('height', (w.height() + 300) + 'px'); };
        w.bind('resize', function () {
            changeHeight();   // when window size gets changed          	 
        });
        changeHeight(); // when page loads          
    }
})
