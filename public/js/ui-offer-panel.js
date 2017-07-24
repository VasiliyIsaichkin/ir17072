angular.module('uiOfferPanel', []).directive('uiOfferPanel', function() {
	return {
		restrict: 'AT',
		template: '<div class="col-md-4 col-sm-6"><div class="panel panel-default offerPanel" id="{{offer.offerId}}">'
		          + '<h4>{{offer.title}}</h4>'
		          + '<p>{{offer.description}}</p>'
		          + '<div class="labelsZone">'
		          + '<div style="float: left" ng-repeat="car in items" ><span class="label" ng-click="unselect(car)">{{car.title}}</span></div>'
		          + '</div>'
		          + '<div class="buttonZone"><button  ng-disabled="!canAccept" type="button" ng-click="accept(offer)" class="btn">Go to step 2</button><div>'
		          + '</div></div>',
		replace : true,
		scope   : {
			offer    : '=',
			items    : '=',
			accept   : '=',
			canAccept: '=',
			unselect : '='
		}
	};
});