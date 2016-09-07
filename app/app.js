'use strict';

/* Gaming Group Members */
var MEMBERS = [
	'mcgraths',
	'Jonstandring13',
	'm477r33d'
];

function getQueryStringValue (key) {  
	return unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));  
}

function getMembers() {
	var members = getQueryStringValue('members');

	if(members)
		return members.split("|");
	else
		return MEMBERS;
}

/*
*   Angular App 
*/
var playApp = angular.module('playApp', []);

playApp.controller('MainController', function($scope, bggApi){
	$scope.members = getMembers();
	$scope.memberSelection =  _.clone($scope.members);

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
			bggApi.getCollection($scope.memberSelection[i], function(err, username, results){

				//process each game
				for (var j = 0; j < results.length; j++) {
					$scope.addGameToCollection(results[j], username);
				}

				$scope.collectionsFetched++;

				//if all games are loaded
				if($scope.collectionsFetched === $scope.memberSelection.length)
					$scope.loading = false;
			});
		}
	};

	$scope.addGameToCollection = function(game, player) {

		//only count games that players own or want to buy
		//if(!game.owned && !game.wantToBuy && !game.wishList) 
			//return;

		//is game already in collection?
		if(_.findIndex($scope.gameCollection, { 'gameId': game.gameId}) > -1) {

			var existingGame = _.find($scope.gameCollection, { 'gameId': game.gameId});

			if(game.owned) {
				existingGame.owned = true;
	  			existingGame.ownCount++;
			}

	  		//If the mode is to buy
	  		if(game.wantToBuy || game.wishList) {
	  			existingGame.wishList = true;
	  			existingGame.wishlistCount++;
	  		}

	  		//game ratings
	  		if(game.rating && game.rating >= 0) {
	  			existingGame.ratings = existingGame.ratings || [];
	  			existingGame.ratings.push(game.rating);
	  			existingGame.averageGroupRating = _.mean(existingGame.ratings);
	  		}

  			existingGame.members.push(player);

			return;
		}

		// How many times does is this owned or on a wishlist
		if(game.owned) 
  			game.ownCount = 1;

  		//If the mode is to buy
  		if(game.wantToBuy || game.wishList) 
  			game.wishlistCount = 1;

  		game.averageGroupRating = 0;

  		//track game ratings
  		if(game.rating && game.rating >= 0) {
  			game.ratings = [];
  			game.ratings.push(game.rating);
  			game.averageGroupRating = _.mean(game.ratings);
  		}

  		game.members = [player];

		$scope.gameCollection.push(game);
	};

	$scope.filterCollection = function(game) {

		//Filter out exansions
		if($scope.mode === 'play' && game.isExpansion)
			return false;

		//Filter out items owned or items on wishlist		

		//If we are looking for games to play and the game isn't owned, don't display it
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
			    return callback(null, username, response.data);
			}, function errorCallback(response) {
			    return callback(new Error('API Error'), username, null)
			});
		}
	};
}]);