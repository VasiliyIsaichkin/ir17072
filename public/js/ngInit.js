var ngApp = angular.module('ir17072', ['ngTouch', 'ngRoute', 'ui-rating', 'uiOfferPanel']);

ngApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$locationProvider.html5Mode(true).hashPrefix('!');
	$routeProvider.when('/', {
		              templateUrl: '/tpls/step1.html'
	              })
	              .when('/step2', {
		              templateUrl: '/tpls/step2.html'
	              })
	              .otherwise({redirectTo: '/'});
}]);

ngApp.factory('$localStorage', function() {
	return {
		get: function(idx) {
			var item = localStorage.getItem(idx);
			if (!item) return;
			return JSON.parse(item);
		},
		set: function(idx, what) {
			localStorage.setItem(idx, angular.toJson(what));
		}
	};
});

function httpCachedGet_abstractFactory(name, path, storageIdx) {
	ngApp.factory(name, function($http, $localStorage, $q) {
		storageIdx = storageIdx || 'HCG_' + name;
		return {
			getAsync: function() {
				var promise, cached = $localStorage.get(storageIdx);
				if (!cached) {
					promise = $http.get(path).then(function(response) {
						var result = response.data || [];
						$localStorage.set(storageIdx, result);
						return result;
					}).catch(function() { return []; });
				} else {
					promise = $q(function(resolve) { resolve(cached); }); //Async emulation
				}
				return promise;
			},
			get     : function($scope, name, filter) {
				this.getAsync().then(function(res) {
					$scope[name] = filter ? filter(res) : res;
				});
			}
		};
	});
}

function observableLocalStorage_abstractProvider(name, defaultType, storageIdx) {
	ngApp.provider(name, function() {
		return {
			$get: function($rootScope, $localStorage) {
				return function applyToScope($scope, valName) {
					if (!$scope || !$scope.$apply) return;
					storageIdx = storageIdx || 'LSM_' + name;
					valName = valName || name;
					$scope[valName] = $localStorage.get(storageIdx) || defaultType;
					$scope.$on('OLS::' + name, function(event, data) {
						$scope[valName] = data;
					});
					$scope.$watchCollection(valName, function(nVal, oVal) {
						$scope.$emit('OLS::' + name, nVal);
						if (nVal === oVal) return;
						$localStorage.set(storageIdx, $scope[name]);
					});
				};
			}
		};
	});
}

ngApp.factory('processOfferService', function($http) {
	return {
		sendAsync: function(list, offer) {
			return $http.post('/api/v1/processOffer', {
				selected: _.pluck(list, 'id'),
				offer   : offer.offerId
			});
		}
	};
});

httpCachedGet_abstractFactory('getCarListService', '/api/v1/getCarList', 'carList');
httpCachedGet_abstractFactory('getCarOffers', '/api/v1/getCarOffers', 'carOffers');
observableLocalStorage_abstractProvider('carsSelected', []);
observableLocalStorage_abstractProvider('currentOffer', false);
