ngApp.controller('step1Ctrl', function($scope, getCarListService, getCarOffers, carsSelected, currentOffer) {
	carsSelected($scope);
	currentOffer($scope);

	getCarOffers.get($scope, 'offers');
	$scope.currentOffer = false;
	getCarListService.get($scope, 'carList', function(res) {
		_.each($scope.carsSelected, function(selectedCar) {
			var car = _.findWhere(res, {id: selectedCar.id});
			if (!car) return;
			car.selected = true;
		});
		return res;
	});

	$scope.btnOfferClick = function(offer) {
		$scope.currentOffer = offer;
		$scope.gotoStep(2);
	};

	$scope.btnUnselectClick = function(item) {
		_.findWhere($scope.carList, {id: item.id}).selected = false;
		item.id;
		$scope.carsSelected = _.without($scope.carsSelected, item);
	};

	$scope.btnSelectClick = function(item) {
		item.selected = true;
		$scope.carsSelected.push(item);
	};
});

ngApp.controller('step2Ctrl', function($scope, currentOffer, carsSelected, processOfferService) {
	carsSelected($scope);
	currentOffer($scope);

	if (!$scope.carsSelected || !$scope.carsSelected.length || !$scope.currentOffer) return $scope.gotoStep(1);
	$scope.btnSendToServerClick = function() {
		processOfferService.sendAsync($scope.carsSelected, $scope.currentOffer).then(function() {
			$scope.carsSelected = [];
			window.location.href = '/viewSended';
		});
	};
	$scope.btnUnselectClick = function(item) {
		item.selected = false;
		$scope.carsSelected = _.without($scope.carsSelected, item);
		if ($scope.carsSelected.length === 0) { $scope.gotoStep(1); }
	};
	$scope.btnBack = function() {
		$scope.gotoStep(1);
	};

});

ngApp.controller('stepsCtrl', function($scope, $location) {
	$scope.getPath = function() { return $location.path(); };
	$scope.gotoStep = function(no) {
		$location.path({
			1: '/',
			2: '/step2'
		}[no]);
	};
});