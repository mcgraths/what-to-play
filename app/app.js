'use strict';

/* Gaming Group Members */
const MEMBERS = [
	'mcgraths',
	'Jonstandring13'
];

/*
*   Angular App 
*/
var playApp = angular.module('playApp', []);

playApp.controller('MainController', function($scope, bggApi){
	$scope.members = MEMBERS;
	$scope.memberSelection =  _.clone(MEMBERS);

	$scope.gameCollection = [];
	$scope.loading = true;
	$scope.sortType = 'name';
	$scope.sortReverse = false;

	//Filters
	$scope.mode = 'play'; //or 'buy' (uses wishlist data)
	$scope.playerCount = 'any';
	$scope.playTime = 'any';


	$scope.fetchCollections = function(){

		//reset
		$scope.gameCollection = [];
		$scope.collectionsFetched = 0;
		$scope.loading = true;

		for (var i = 0; i < $scope.memberSelection.length; i++) {
			bggApi.getCollection($scope.memberSelection[i], function(err, results){

				//process each game
				for (var j = 0; j < results.length; j++) {
					$scope.addGameToCollection(results[j]);
				}

				$scope.collectionsFetched++;

				//if all games are loaded
				if($scope.collectionsFetched === $scope.memberSelection.length)
					$scope.loading = false;
			});
		}
	};


	$scope.addGameToCollection = function(game) {

		//is game already in collection?
		if(_.findIndex($scope.gameCollection, { 'gameId': game.gameId}) > -1)
			return;

		$scope.gameCollection.push(game);
	};

	$scope.filterCollection = function(game) {

		//Filter out exansions
		if(game.isExpansion)
			return false;

		//Filter out items owned or items on wishlist		

		//If we are looking for games to play and the game isn't owned, do display it
  		if($scope.mode === 'play' && !game.owned) 
  			return false;

  		//If the mode is to buy
  		if($scope.mode === 'buy' && !game.wantToBuy && !game.wishList) 
  			return false;

  		//Now we filter based on other parameters
  		
  		//player count
  		if ($scope.playerCount !== 'any') {
  			
  			var playerCount;
  			
  			if($scope.playerCount === '10+')
  				playerCount = 10;
  			else	
  				playerCount = parseInt($scope.playerCount);

  			if(playerCount === 10 && game.maxPlayers < 10)
  				return false; 

  			if(playerCount < game.minPlayers || playerCount > game.maxPlayers)
  				return false;

  		}

  		//player count
  		if ($scope.playTime !== 'any') {
  			var timeRange = $scope.playTime.split('-');
  			var min = parseInt(timeRange[0]);
  			var max = parseInt(timeRange[1]);

  			//console.log(min, max, game.playingTime);
  			if(game.playingTime < min || game.playingTime > max)
  				return false;
  		}

  		return true;
	};

	$scope.sortCollection = function(field){
		if(field === $scope.sortType)
			$scope.sortReverse = !$scope.sortReverse;

		$scope.sortType = field;
	};

	$scope.toggleMember = function(member) {
    	var idx = $scope.memberSelection.indexOf(member);

	    // is currently selected
	    if (idx > -1) {
	      $scope.memberSelection.splice(idx, 1);
	    }
	    else { // is newly selected
	      $scope.memberSelection.push(member);
	    }

    	console.log($scope.memberSelection);
	    $scope.fetchCollections();
	 };

	//Init
	$scope.fetchCollections();

}); 	


//Factory for interacting with BGG
playApp.factory('bggApi', ['$http', function($http) {
	var enpoint = 'https://bgg-json.azurewebsites.net/';
	return {
		getCollection: function(username, callback) {
			//https://bgg-json.azurewebsites.net/collection/USERNAME?grouped=false
			$http({
			  	method: 'GET',
			  	url: enpoint + 'collection/' + username + '?grouped=false'
			}).then(function successCallback(response) {
			    return callback(null, response.data);
			}, function errorCallback(response) {
			    return callback(new Error('API Error'), null)
			});
		}
	};
}]);