$(function() {
	$("button#go:submit").click(function() {
		$("button#go:submit").fadeOut(1000);
	});
});

var map; // For Google map object
var infowindow; // For Google infowindow object
var geocoder; // For Google geocoder object
var markers = []; // Stores Google marker objects

var iterator = 0;
var friendsWithLocation = []; // Stores friends with location set
var friendsWithLatLong = []; // Stores geocoded frriend locations

var mc; // var for MarkerClusterer object
var oms; // var for OverlappingMarkerSpiderfier

// Initialize Google Maps
function initialize() {
	var mapOptions = {
	zoom: 2,
	center: new google.maps.LatLng(30, 10),
	mapTypeId: google.maps.MapTypeId.ROADMAP,
		// maxZoom: 16,
		scrollwheel: false,
		panControl: false,
		streetViewControl: false,
		mapTypeControl: false
	};
	map = new google.maps.Map(document.getElementById('map_canvas'),
		mapOptions);
	geocoder = new google.maps.Geocoder();
	infowindow = new google.maps.InfoWindow({
		content: 'Hello world'
	});
	oms = new OverlappingMarkerSpiderfier(map);
}

// Toggles marker bounce animation
function toggleBounce() {
	if (marker.getAnimation() != null) {
		marker.setAnimation(null);
	} else {
		marker.setAnimation(google.maps.Animation.BOUNCE);
	}
}

google.maps.event.addDomListener(window, 'load', initialize);

// Takes FB friend object and augments it with a LatLng object returned 
// by Google geocoding
function codeAddress(friendsWithLocation) {
	// Limits to 5 loops right now to avoid QUERY_OVER_LIMIT
	for (var i = 0, l = friendsWithLocation.length; i < l && i < 5; i++) {
		var random = Math.floor(Math.random()*(l));
		geocodeFriend(friendsWithLocation[random]);
	}
	// Since you are calling the function with a value, that value
	// will not change since it is now a var/param in a closure. The
	// interpreter won't try to look outside of the scope of this func for the
	// value of friend. (Thanks @kmiyashiro)
	function geocodeFriend(friend) {
		var address = friend.location.name;
		// Google's geocoder syntax
		geocoder.geocode( {'address': address}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				// Gets location LatLng object from Google's first result
				// and augments the friend object with it
				friend.location.latlong = results[0].geometry.location;
				// Adds this newly-augmented friend object with LatLng to
				// the array friendsWithLatLong.
				friendsWithLatLong.push(friend);
				// console.log(friendsWithLatLong[i]);
				// Determines that it is the last loop and drops markers
				// for each friend object now in friendsWithLatLong.
				if (friendsWithLatLong.length === 5) {
					console.log(friendsWithLatLong);
					drop(friendsWithLatLong);
				}
			} else {
				alert("Geocode was not successful because " + status);
			};
		});
	};
};

// Drops the markers by calling addMarker on the array of LatLng objects
function drop(array) {
	for (var i = 0, l = array.length; i < l; i++) {
		setTimeout(function() {
			addMarker(array);
			}, i * 200); // Sets delay between marker drops
	};
}

// Creates new Marker object from a markers array of LatLng objects
function addMarker(array) {
	markers.push(new google.maps.Marker({
		position: array[iterator].location.latlong,
		map: map,
		draggable: false,
		animation: google.maps.Animation.DROP,
		title: array[iterator].name,
		city: array[iterator].location.name,
		photo: '<img src="https://graph.facebook.com/' + array[iterator].id + '/picture" width="56px" height="56px" alt="profile picture">',
		fbpage: '"http://www.facebook.com/' + array[iterator].id + '"'
	}));
	iterator++;
	if (iterator === array.length) {
		addInfoWindowListener(markers);
	};
};
// Event listener for marker clicks opening and setting content
function addInfoWindowListener(markers) {
	for (var i = 0, l = markers.length; i < l; i++) {
		google.maps.event.addListener(markers[i], 'click', function() {
			infowindow.content = '<a href=' + this.fbpage + ' target="_blank"><div id="user-info">' + this.photo + '<div class="name-city">' + this.title + '</a><br><span>' + this.city + '</span></div></div>';
			infowindow.open(map, this);
		})
		if (i === markers.length - 1) {
			mc = new MarkerClusterer(map, markers);
		}
	}
}

// Initialize FB API 
window.fbAsyncInit = function() {
	FB.init({
			appId      : '460199387350228', // App ID
			channelUrl : '//ericpan.net/gmaps/channel.html', // Channel File
			status     : true, // check login status
			cookie     : true, // enable cookies to allow the server to access the session
			xfbml      : true  // parse XFBML
	});

	FB.Event.subscribe('auth.statusChange', handleStatusChange);
};

// Load the SDK Asynchronously
(function(d){
	var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement('script'); js.id = id; js.async = true;
	js.src = "//connect.facebook.net/en_US/all.js";
	ref.parentNode.insertBefore(js, ref);
}(document));

// Toggles body class based on FB login response 
function handleStatusChange(response) {
	document.body.className = response.authResponse ? 'connected' : 'not_connected';

	if (response.authResponse) {
		console.log(response);
		updateUserInfo(response);
	}
}

// Login the user, ask for permission
function loginUser() {    
	FB.login(function(response) { 
			// if (!response.error) {
			// 	getUserFriends();
			// }
	}, {scope:'email, user_location, friends_location'});     
}

// Show the user info at div#user-info if authenticated
function updateUserInfo(response) {
	FB.api('/me', function(response) {
		if (response.location.name !== null && response.location.name !== undefined) {
			document.getElementById('user-info').innerHTML = '<img src="https://graph.facebook.com/' + response.id + '/picture" width="28px" height="28px" alt="profile picture"><div class="name-city">' + response.name + '<br><span>' + response.location.name + '</span></div>';
		} else {
			document.getElementById('user-info').innerHTML = '<img src="https://graph.facebook.com/' + response.id + '/picture" width="28px" height="28px" alt="profile picture"><div class="name-city">' + response.name + '</div>';
		}
	});
}

// Get friends' info (name, picture, location) then filters out ones with location
function getUserFriends() {

	FB.api("/me/friends?fields=name,picture,location", function(response) {
		// Confirms: Friends request responded
		console.log("Got friends: ", response);
		
		if (!response.error) {
			var friends = response.data;

			for (var i = 0, l = friends.length; i < l; i++) {
				var friend = friends[i];

				// Check if friend has a location set
				if (friend.location !== undefined &&
					friend.location !== null &&
					friend.location.name !== null &&
					friend.location.name !== undefined) {
					// console.log(friend.name + " " + friend.location.name);
					friendsWithLocation.push(friend);
				}
				if (i === friends.length - 1) {
					codeAddress(friendsWithLocation);
				}
			}
		}
	});
}
// Check if user is logged in then drop friend markers
function autoDropFriends() {

} 