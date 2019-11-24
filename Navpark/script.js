function initMap() { //function ran when index.html starts (and API is retrieved)
  //generate the google maps directions objects that calculate and display the routes
  var directionsService = new google.maps.DirectionsService();
  var directionsRenderer =   new google.maps.DirectionsRenderer({suppressMarkers: true});
  var directionsService2 = new google.maps.DirectionsService();
  var directionsRenderer2 = new google.maps.DirectionsRenderer({
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: 'red' //use this to change the WALKING route colour
    }
  });

  var map = new google.maps.Map(document.getElementById('map'), { //generate the map
    zoom: 7,
    center: {lat: 43.001300, lng: -81.275700}
  });
  directionsRenderer.setMap(map); //make the route displayers render the routes on the map
  directionsRenderer2.setMap(map);

  //create the markers
  var markerDriveHere = new google.maps.Marker({
    title: "Drive Here",
    icon:'images/driving.png'
  });
  var markerWalkHere = new google.maps.Marker({
    title: "Walk Here",
    icon:'images/walking.png'
  });
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = { //getting user's current position
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      map.setCenter(pos);
      var onCheckHandler = function() {
        if (document.getElementById('currentCheck').checked) {
          document.getElementById('inputStart').readOnly = true;
          document.getElementById('inputStart').style.visibility='hidden';
          document.getElementById('divStart').style.visibility='hidden';

        } else {
          document.getElementById('inputStart').readOnly = false;
          document.getElementById('inputStart').style.visibility='visible';
          document.getElementById('divStart').style.visibility='visible';
        }

      };
      var onClickHandler = function() {
        if (!document.getElementById('currentCheck').checked) {
          var geocoder = new google.maps.Geocoder();
          geocoder.geocode({'address': document.getElementById('inputStart').value}, function(results, status) { //function to get latlng of input
            if (status == google.maps.GeocoderStatus.OK) { //if geocoder working
              var latitude = results[0].geometry.location.lat(); //record the latitude and longitude under a GMaps LatLng variable to read
              var longitude = results[0].geometry.location.lng();
              var myLatLng = new google.maps.LatLng(latitude,longitude);
              calculateDrivingRoute(directionsService, directionsRenderer, map, markerDriveHere, myLatLng);
            }
          })
        }
        else {
          calculateDrivingRoute(directionsService, directionsRenderer, map, markerDriveHere, pos);
        }
        calculateWalkingRoute(directionsService2, directionsRenderer2, map, markerWalkHere);
      };
      document.getElementById('button').addEventListener('click', onClickHandler);
      document.getElementById('currentCheck').addEventListener('change', onCheckHandler)
    }, function() { //error incase user blocks GPS access; same as above but ignores the checkbox and it's conditions
      document.getElementById("currentCheck").disabled = true; //disable the checkbox
      document.getElementById("currentCheck").checked = false; //checkbox unchecked means app is not using current position
      var onClickHandler = function() { //when the Go button is clicked
            var geocoder = new google.maps.Geocoder(); //create geocoder
            geocoder.geocode({'address': document.getElementById('inputStart').value}, function(results, status) { //replace 'end' with parking's location
            if (status == google.maps.GeocoderStatus.OK) { //if geocoder working
              var latitude = results[0].geometry.location.lat();
              var longitude = results[0].geometry.location.lng();
              var myLatLng = new google.maps.LatLng(latitude,longitude);
              calculateDrivingRoute(directionsService, directionsRenderer, map, markerDriveHere, myLatLng);
            }
          });
        calculateWalkingRoute(directionsService2, directionsRenderer2, map, markerWalkHere);
      }
      document.getElementById('button').addEventListener('click', onClickHandler);
    });
  } else {
    // error incase geolocator does not work
    console.log('error 1');
    window.alert("Error! Geolocator not working.");
  }
}

// function for the driving portion of the route; from user's starting location to the parking location
function calculateDrivingRoute(directionsService, directionsRenderer, map, marker, pos) {
  var geocoder = new google.maps.Geocoder(); //set up geocoder
  geocoder.geocode({'address': document.getElementById('end').value}, function(results, status) { //replace 'end' with parking's location
    if (status == google.maps.GeocoderStatus.OK) { //if geocoder working
      var latitude = results[0].geometry.location.lat();
      var longitude = results[0].geometry.location.lng();
      var myLatLng = new google.maps.LatLng(latitude,longitude); //get latlng of the user's input

      directionsService.route( //generate route using input from user and external API's coordinates
          {
            origin: pos,
            destination: {query: document.getElementById('end').value}, // USE EXTERNAL API'S LONGITUDE AND LATITUDE
            travelMode: 'DRIVING'
          },
          function(response, status) {
            if (status === 'OK') { //if route works
              directionsRenderer.setDirections(response); //generate directions using Directions API
              marker.setMap(map); //put marker on map and set their position
              marker.setPosition(myLatLng);

              //distance matrix
              var service = new google.maps.DistanceMatrixService; //distmatrix API used for calculating time of travel
              service.getDistanceMatrix({
                origins: [pos], //use one-element arrays
                destinations: [{query: document.getElementById('end').value}],
                travelMode: 'DRIVING' //driving for this portion
            }, function(response, status) {
              if (status !== 'OK') { //if error,
                alert("Error! Distance Matrix not working.");
              } else {
                var output = document.getElementById('driveTime'); //create variable for output's location, and access matrix for the time value
                output.innerHTML = "<center>Driving Distance: " +response.rows[0].elements[0].duration.text + "</center>";
                document.getElementById('outputPanel').style.visibility='visible';
              }
            })
            } else {
              alert("Error! Route failed to generate");
            }
          });
    }
  });
}

//exact same logic as above code, but with different points and using WALKING mode & markers
function calculateWalkingRoute(directionsService, directionsRenderer, map, marker) {
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({'address': document.getElementById('inputEnd').value}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      var latitude = results[0].geometry.location.lat();
      var longitude = results[0].geometry.location.lng();
      var myLatLng = new google.maps.LatLng(latitude,longitude);

      directionsService.route(
          {
            origin: {query: document.getElementById('end').value},
            destination: {query: document.getElementById('inputEnd').value},
            travelMode: 'WALKING'
          },
          function(response, status) {
            if (status === 'OK') {
              directionsRenderer.setDirections(response);
              marker.setMap(map);
              marker.setPosition(myLatLng);

              var service = new google.maps.DistanceMatrixService;
              service.getDistanceMatrix({
                origins: [{query: document.getElementById('end').value}],
                destinations: [{query: document.getElementById('inputEnd').value}],
                travelMode: 'WALKING'
            }, function(response, status) {
              if (status !== 'OK') {
                alert("Error! Distance Matrix not working.");
              } else {
                var output = document.getElementById('walkTime');
                output.innerHTML = "<center>Walking Distance: " +response.rows[0].elements[0].duration.text + "</center>";
              }
            })
            } else {
              alert("Error! Route failed to generate");
            }
          });
    }
  });

}
