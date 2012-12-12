	// Initialize Google Maps
		var map;
		function initialize() {
			var mapOptions = {
				zoom: 8,
				center: new google.maps.LatLng(-34.397, 150.644),
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			map = new google.maps.Map(document.getElementById('map_canvas'),
			mapOptions);
		}

		google.maps.event.addDomListener(window, 'load', initialize);

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
			FB.login(function(response) { }, {scope:'email, user_location, friends_location'});     
		}
	
	// Show the user info at div#user-info if authenticated
		function updateUserInfo(response) {
			FB.api('/me', function(response) {
				document.getElementById('user-info').innerHTML = '<img src="https://graph.facebook.com/' + response.id + '/picture">' + response.name + " " + response.location.name;
			});
		}