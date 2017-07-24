/*
 * ui-rating custom rating element
 * based on http://angular-ui.github.io/bootstrap/
 * Version: 2.5.0-1 (Modified by VasiliyIsaichkin)
 * License: MIT
 */
angular.module('ui-rating', ['ui-rating.tpls', 'ui-rating.impl']);
angular.module('ui-rating.tpls', ['ui-rating/rating.html']);
angular.module('ui-rating.impl', [])

       .constant('uiRatingConfig', {
	       max        : 5,
	       stateOn    : null,
	       stateOff   : null,
	       enableReset: true,
	       titles     : ['Poor', 'Fair', 'Average', 'Good', 'Excellent']
       })

       .controller('uiRatingController', ['$scope', '$attrs', 'uiRatingConfig', function($scope, $attrs, ratingConfig) {
	       var ngModelCtrl = {$setViewValue: angular.noop},
	           self        = this;

	       this.init = function(ngModelCtrl_) {
		       ngModelCtrl = ngModelCtrl_;
		       ngModelCtrl.$render = this.render;

		       ngModelCtrl.$formatters.push(function(value) {
			       if (angular.isNumber(value) && value << 0 !== value) {
				       value = Math.round(value);
			       }

			       return value;
		       });

		       this.stateOn = angular.isDefined($attrs.stateOn) ? $scope.$parent.$eval($attrs.stateOn) : ratingConfig.stateOn;
		       this.stateOff = angular.isDefined($attrs.stateOff) ? $scope.$parent.$eval($attrs.stateOff) : ratingConfig.stateOff;
		       this.enableReset = angular.isDefined($attrs.enableReset) ? $scope.$parent.$eval($attrs.enableReset) : ratingConfig.enableReset;
		       var tmpTitles = angular.isDefined($attrs.titles) ? $scope.$parent.$eval($attrs.titles) : ratingConfig.titles;
		       this.titles = angular.isArray(tmpTitles) && tmpTitles.length > 0 ? tmpTitles : ratingConfig.titles;

		       var ratingStates = angular.isDefined($attrs.ratingStates)
			       ? $scope.$parent.$eval($attrs.ratingStates)
			       : new Array(angular.isDefined($attrs.max) ? $scope.$parent.$eval($attrs.max) : ratingConfig.max);
		       $scope.range = this.buildTemplateObjects(ratingStates);
	       };

	       this.buildTemplateObjects = function(states) {
		       for (var i = 0, n = states.length; i < n; i++) {
			       states[i] = angular.extend({index: i}, {stateOn: this.stateOn, stateOff: this.stateOff, title: this.getTitle(i)}, states[i]);
		       }
		       return states;
	       };

	       this.getTitle = function(index) {
		       if (index >= this.titles.length) {
			       return index + 1;
		       }

		       return this.titles[index];
	       };

	       $scope.rate = function(value) {
		       if (!$scope.readonly && value >= 0 && value <= $scope.range.length) {
			       var newViewValue = self.enableReset && ngModelCtrl.$viewValue === value ? 0 : value;
			       ngModelCtrl.$setViewValue(newViewValue);
			       ngModelCtrl.$render();
		       }
	       };

	       $scope.enter = function(value) {
		       if (!$scope.readonly) {
			       $scope.value = value;
		       }
		       $scope.onHover({value: value});
	       };

	       $scope.reset = function() {
		       $scope.value = ngModelCtrl.$viewValue;
		       $scope.onLeave();
	       };

	       $scope.onKeydown = function(evt) {
		       if (/(37|38|39|40)/.test(evt.which)) {
			       evt.preventDefault();
			       evt.stopPropagation();
			       $scope.rate($scope.value + (evt.which === 38 || evt.which === 39 ? 1 : -1));
		       }
	       };

	       this.render = function() {
		       $scope.value = ngModelCtrl.$viewValue;
		       $scope.title = self.getTitle($scope.value - 1);
	       };
       }])

       .directive('uiRating', function() {
	       return {
		       require    : ['uiRating', 'ngModel'],
		       restrict   : 'AT',
		       scope      : {
			       readonly: '=?readOnly',
			       onHover : '&',
			       onLeave : '&'
		       },
		       controller : 'uiRatingController',
		       templateUrl: 'ui-rating/rating.html',
		       link       : function(scope, element, attrs, ctrls) {
			       var ratingCtrl = ctrls[0], ngModelCtrl = ctrls[1];
			       ratingCtrl.init(ngModelCtrl);
		       }
	       };
       });

angular.module('ui-rating/rating.html', []).run(['$templateCache', function($templateCache) {
	$templateCache.put('ui-rating/rating.html',
		'<span ng-mouseleave="reset()" ng-keydown="onKeydown($event)" class="ui-rating" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="{{range.length}}" aria-valuenow="{{value}}" aria-valuetext="{{title}}">\n'
		+
		'    <span ng-repeat-start="r in range track by $index" class="sr-only">({{ $index < value ? \'*\' : \' \' }})</span>\n'
		+
		'    <i ng-repeat-end ng-mouseenter="enter($index + 1)" ng-click="rate($index + 1)" class="" ng-class="$index < value && (r.stateOn || \'ui-rating-icon-star\') || (r.stateOff || \'ui-rating-icon-star-empty\')" ng-attr-title="{{r.title}}"></i>\n'
		+
		'</span>\n');
}]);
