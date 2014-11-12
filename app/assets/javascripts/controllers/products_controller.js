var myApp = angular.module('product_listing', ['ngRoute','templates','restangular','ui.bootstrap']);

myApp.config(['$routeProvider', '$locationProvider', "RestangularProvider","$httpProvider" ,function($routeProvider, $locationProvider,RestangularProvider,$httpProvider) {
	$httpProvider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');
  RestangularProvider.setRequestSuffix('.json');
  $routeProvider.
  when('/products',{
    templateUrl: 'products/index.html',
    controller: 'ProductListCtr'
  }).
  otherwise({
    redirectTo: '/products'
  });
 }
]);

myApp.controller("ProductListCtr", ["$scope", "$location", "Restangular","$modal", function($scope,$location,Restangular,$modal) {
  $scope.products = Restangular.all('products').getList().$object;
  $scope.show = function(product){
    $scope.selectedProduct = product;
	};


	$scope.edit = function (product) {
    var modalInstance = $modal.open({
      templateUrl: 'edit.html',
      controller: 'ProductEditCtr',
      resolve: {
				product: function(){
					product.price = parseFloat(product.price);
					return product;
				}
			}
    });

    modalInstance.result.then(function (product) {
      $scope.selectedProduct = product;
    }, function () {
      // $log.info('Modal dismissed at: ' + new Date());
    });
  };


  $scope.new_product = function (product) {
    var modalInstance = $modal.open({
      templateUrl: 'edit.html',
      controller: 'ProductCreateCtr'
    });

    modalInstance.result.then(function (product) {
      $scope.selectedProduct = product;
      $.merge( $scope.products, [product] );
    }, function () {
      // $log.info('Modal dismissed at: ' + new Date());
    });
  };

  $scope.destroy = function(product) {
    product.remove().then(function() {
      $scope.products = Restangular.all('products').getList().$object;
      $scope.selectedProduct = null;
    });
  };

  $scope.$on('$viewContentLoaded', function() {
  	console.log("hi");
    $('.product-item').eq(0).trigger('click');
	});

}]);

myApp.controller("ProductCreateCtr",["$scope", "$location", "Restangular","$modalInstance",function CreateCtrl($scope, $location, Restangular,$modalInstance) {
  $scope.save = function() {
    Restangular.all('products').post($scope.product).then(function(product) {
      $modalInstance.close(product);
    });
	};

	$scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}]);

myApp.controller("ProductEditCtr",["$scope", "$location", "Restangular", "product","$modalInstance",function EditCtrl($scope, $location, Restangular, product,$modalInstance) {
  var original = product;
  $scope.product = Restangular.copy(original);

  $scope.isClean = function() {
    return angular.equals(original, $scope.product);
  };

  

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.save = function() {
    $scope.product.put().then(function() {
      $modalInstance.close($scope.product);
    });
  };
}]);

$(function(){
	$(window).resize(function(){
		$('.product-side-bar').css("height",$(window).height() - $('.navbar-header').height());
	}).resize();
})