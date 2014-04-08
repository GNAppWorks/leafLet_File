function Route(routeGeoJSON, route, lon, lat){
	this.routeGeoJSON = routeGeoJSON;
	this.lon = lon;
	this.lat = lat;
	this.route = route;
	this.closestPointOnLine;
	this.routeIndex;

	//This is the main function we'll be calling. It returns the generated GeoJSON object of the route from the current location to the nearest rest stop.
	this.getRoute = function(){
		return this.routeToNearestRestStop;
	};	

	//Takes coordinates and returns the closest location to those coordinates on our route line. Utilizes the leaflet-knn library.
	this.snapToLine = function(){
		var lknn = leafletKnn(this.routeGeoJSON);
		var closestPointOnLineUnformatted = lknn.nearest([this.lon, this.lat], 1, 999999);
		//console.log(closestPointOnLineUnformatted[0].lat);
		//returns it in a format that's the same as the way GeoJSON has it
		return new Array(closestPointOnLineUnformatted[0].lon, closestPointOnLineUnformatted[0].lat);
	};

	//Takes the lat/lon we found in snapToLine and returns the index of it in the GeoJSON route array. We need this because leaflet-knn returns the coordinate values, not the index
	this.findRouteIndex = function(){
		for(var i = 0; i < this.route.features.length; i++){
			for(var x = 0; x < this.route.features[i].geometry.coordinates.length; x++){
				if((this.route.features[i].geometry.coordinates[x][0] == this.closestPointOnLine[0]) && (this.route.features[i].geometry.coordinates[x][1] == this.closestPointOnLine[1])){
					//Returns both values in the nested array as an array object
					return new Array(i, x);
				}
			}
		}
		//Only returns -1 if the value isn't found. This will only happen if snapToLine and therefore leaflet-knn fail.
		return -1;
	};

	//Takes the full GeoJSON route coordinate array and slices it from the index of the location on the route closest to the GPS coordinates to the 
	//end of the array. It is assumed that the end of the array is a rest stop. This gives us the path between those two locations. We then throw this
	//in a new GeoJSON object and return it.
	this.buildRoute = function(){
		var routeToNearestRestStop = {
    		"type": "Feature",
			"properties": {},
			"geometry": {
				"type": "LineString",
				"coordinates": []
			}
		}
		//Note this.routeIndex[0] and [1] - it's this way because findRouteIndex returns the array indicies of both features[] (to get which line segment we're utilizing)
		//and coordinates[] (to get the lat/lon index we figured out in findRouteIndex).
		routeToNearestRestStop.geometry.coordinates = this.route.features[this.routeIndex[0]].geometry.coordinates.slice(this.routeIndex[1]);
		return routeToNearestRestStop;
	};

	//Takes the GeoJSON route to the nearest rest stop and returns the distance of the line in miles
	this.getGeoJSONLineDistance = function(){

		//Helper function - returns the distance between two sets of coordinates in km
		function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
		  	var R = 6371; // Radius of the earth in km
		  	var dLat = deg2rad(lat2-lat1);  // deg2rad below
		  	var dLon = deg2rad(lon2-lon1); 
		  	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
		  	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		  	var d = R * c; // Distance in km
		  	return d;
		}

		//Helper function to the helper function - performs a degrees to radians calculation
		function deg2rad(deg) {
		  return deg * (Math.PI/180)
		}

		var distance = 0;
		//Iterates through the line segment from initial location to rest stop and calculates the distance between each neighboring lat/lon, then adds it to distance
		for(var i = 0; i < this.routeToNearestRestStop.geometry.coordinates.length-1; i++){
			distance += getDistanceFromLatLonInKm(this.routeToNearestRestStop.geometry.coordinates[i][1], this.routeToNearestRestStop.geometry.coordinates[i][0], this.routeToNearestRestStop.geometry.coordinates[i+1][1], this.routeToNearestRestStop.geometry.coordinates[i+1][0]);
		}
		//We return the conversion to miles since this is all in km up to this point
		return (0.621371 * distance).toFixed(2);
	};

	//Think of this as part of the constructor. It calls the functions above to set up the object.
	this.closestPointOnLine = this.snapToLine();
	this.routeIndex = this.findRouteIndex();
	this.routeToNearestRestStop = this.buildRoute();
}